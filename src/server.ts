import { fileURLToPath } from "node:url";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  THINKING_MODES,
  resolveMode,
  parseThinkingRequest,
  resolveQuestion,
  formatUserExamples,
} from "./thinking/modes.js";
import { THINK_TOOL, THINK_NEXT_TOOL } from "./mcp-tool-schema.js";
import {
  createSession,
  loadSession,
  submitAnswer,
} from "./thinking/session.js";
import {
  buildStartDirective,
  buildRefinementDirective,
  buildCompletionDirective,
} from "./thinking/prompts.js";
import { getPassFocus } from "./thinking/pass-focus.js";
import {
  validatePassAnswer,
  buildMetaRejectionMessage,
  buildStagnationRejectionMessage,
} from "./thinking/answer-guard.js";
import { buildServerInstructions, detectLocale } from "./thinking/locale/index.js";
import { MCP_STDIO_BANNER, PKG_VERSION } from "./version.js";

const STAGNATION_STOP_WORDS = new Set(["için", "ile", "ve", "bir", "the", "and"]);

function substantiveWords(text: string): Set<string> {
  return new Set(
    text
      .toLowerCase()
      .replace(/\.(html|ts|tsx|js|jsx|mjs|py|css|json|md|yaml|yml)\b/gi, " ")
      .replace(/\/[\w.-]+/g, " ")
      .replace(/\b\d+\b/g, " ")
      .replace(/[^\p{L}\p{N}\s]/gu, " ")
      .split(/\s+/)
      .filter((w) => w.length > 2 && !STAGNATION_STOP_WORDS.has(w)),
  );
}

function countNewSubstantiveWords(prev: string, next: string): number {
  const prevWords = substantiveWords(prev);
  let count = 0;
  for (const word of substantiveWords(next)) {
    if (!prevWords.has(word)) count++;
  }
  return count;
}

/** Önceki cevapla birebir aynı, küçük tweak veya read pass içerik kopyası mı? */
function isStagnantAnswer(
  prev: string,
  next: string,
  execution: string = "none",
): boolean {
  const p = prev.trim();
  const n = next.trim();
  if (!p || !n) return false;
  if (p === n) return true;
  const maxTweak = 24;
  if (n.startsWith(p) && n.length - p.length <= maxTweak) return true;
  if (p.startsWith(n) && p.length - n.length <= maxTweak) return true;
  if (execution === "read" && countNewSubstantiveWords(p, n) < 4) return true;
  return false;
}

const SERVER_INSTRUCTIONS = buildServerInstructions();

export function handleThinkNext(sessionId: string, answer: string) {
  const session = loadSession(sessionId);
  if (!session) {
    return {
      content: [
        {
          type: "text" as const,
          text: `Oturum bulunamadı. Yeniden \`think\` ile başlat.`,
        },
      ],
      isError: true,
    };
  }

  if (session.completed) {
    return {
      content: [
        {
          type: "text" as const,
          text: `Bu oturum zaten bitti. Yeni soru için \`think\` kullan.`,
        },
      ],
    };
  }

  const nextPassNumber = session.currentRound + 1;
  const focus = getPassFocus(session.mode, nextPassNumber, session.taskKind, session.language);
  const execution = focus?.execution ?? "none";

  const validation = validatePassAnswer(answer, nextPassNumber, execution);
  const prevAnswer = session.rounds[session.rounds.length - 1]?.answer ?? "";

  if (!validation.valid) {
    return {
      content: [
        {
          type: "text" as const,
          text: buildMetaRejectionMessage(validation, nextPassNumber, session.language),
        },
      ],
      isError: true,
    };
  }

  if (prevAnswer && isStagnantAnswer(prevAnswer, answer, execution)) {
    const readCopy = execution === "read";
    return {
      content: [
        {
          type: "text" as const,
          text: buildStagnationRejectionMessage(nextPassNumber, readCopy, session.language),
        },
      ],
      isError: true,
    };
  }

  const updated = submitAnswer(session, answer);

  if (updated.completed) {
    return {
      content: [{ type: "text" as const, text: buildCompletionDirective(updated) }],
    };
  }

  const remaining = updated.totalPasses - updated.currentRound;
  return {
    content: [
      {
        type: "text" as const,
        text: [
          buildRefinementDirective(updated),
          ``,
          `---`,
          `Pass ${updated.currentRound}/${updated.totalPasses} tamam | kalan: ${remaining}`,
        ].join("\n"),
      },
    ],
  };
}

async function main(): Promise<void> {
  const server = new McpServer(
    {
      name: "ultra-extra-more-genius-thinking",
      version: PKG_VERSION,
    },
    { instructions: SERVER_INSTRUCTIONS },
  );

  server.registerTool(
    THINK_TOOL.name,
    {
      description: THINK_TOOL.description,
      inputSchema: THINK_TOOL.inputSchema,
    },
    async (args) => {
      let question: string;
      let modeKey: string;
      let conversationContext = args.conversation_context?.trim();

      if (args.user_message) {
        const parsed = parseThinkingRequest(args.user_message);
        question = resolveQuestion(parsed, conversationContext);
        modeKey = args.mode ?? parsed.mode;
      } else if (args.question) {
        question = conversationContext
          ? `${args.question}\n\n---\nChat bağlamı:\n${conversationContext}`
          : args.question;
        modeKey = args.mode ?? "easy";
      } else if (conversationContext) {
        question = conversationContext;
        modeKey = args.mode ?? "easy";
      } else {
        return {
          content: [
            {
              type: "text" as const,
              text: [
                "user_message veya question+conversation_context gerekli.",
                "",
                "Kullanıcı sadece mod dediyse agent chat özetini conversation_context'e yazmalı.",
                "",
                formatUserExamples(),
              ].join("\n"),
            },
          ],
          isError: true,
        };
      }

      const cfg = resolveMode(modeKey);
      const sessionLang = args.user_message
        ? detectLocale(args.user_message)
        : detectLocale(question);
      const session = createSession(question, cfg.mode, sessionLang, conversationContext);

      return {
        content: [
          {
            type: "text" as const,
            text: [
              buildStartDirective(session),
              ``,
              `---`,
              `Mod: ${cfg.shortName} (${cfg.totalPasses} pass)`,
              `Görev tipi: ${session.taskKind}`,
              `session_id: ${session.id}`,
            ].join("\n"),
          },
        ],
      };
    },
  );

  server.registerTool(
    THINK_NEXT_TOOL.name,
    {
      description: THINK_NEXT_TOOL.description,
      inputSchema: THINK_NEXT_TOOL.inputSchema,
    },
    async (args) => handleThinkNext(args.session_id, args.answer),
  );

  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error(MCP_STDIO_BANNER);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main().catch((err) => {
    console.error("Fatal:", err);
    process.exit(1);
  });
}
