import { fileURLToPath } from "node:url";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import {
  THINKING_MODES,
  MODE_ENUM,
  SHORT_MODE_ENUM,
  resolveMode,
  parseThinkingRequest,
  resolveQuestion,
  formatUserExamples,
} from "./thinking/modes.js";
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
import { detectLocale } from "./thinking/locale/index.js";

const MODE_SCHEMA = z.enum(MODE_ENUM);
const SHORT_MODE_SCHEMA = z.enum(SHORT_MODE_ENUM);

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

const SERVER_INSTRUCTIONS = [
  "ULTRA THINKING MCP — cevap kalitesini pass pass artırır.",
  "",
  "CHAT BAĞLAMI (KRİTİK):",
  "MCP sunucusu chat geçmişini OTOMATİK görmez.",
  "Agent (sen) chat geçmişini görürsün — think çağırırken conversation_context'e ÖZET geçmek ZORUNLU.",
  "Kullanıcı sadece 'max de düşün' dediyse soruyu tekrar sorma; bağlamı kendin aktar.",
  "",
  "KULLANICI DOĞAL DİL İLE MOD SEÇER:",
  '• "düşünme modu mcp easy/medium/more/max de düşün" (+ isteğe bağlı soru)',
  "",
  "Kullanıcı mod + düşün dediğinde HEMEN think çağır.",
  "Modu mesajdan çıkar. Hangi mod diye sorma.",
  "",
  "EXECUTION (agent workspace — MCP'de write/read tool YOK):",
  "• Read pass → Read/Grep/SemanticSearch ile gerçek dosyaları oku",
  "• Write pass → Write/StrReplace/Delete ile uygula, mock yasak",
  "• Verify pass → Shell ile test/build, dosya özetini finalde ver",
  "",
  "MODLAR:",
  "• easy=3: taslak → read/eksik → write/final",
  "• medium=5: taslak → read → kod review → write/uygula → verify/final",
  "• more=7: medium + karşı argüman → write/yapı → verify/sentez",
  "• max=10: + derin review, uzman paneli, çoklu write/verify",
  "",
  "AKIŞ:",
  "1. think(user_message, conversation_context) → Pass 1",
  "2. Pass işini bitir (Read/Write/Shell) → think_next(session_id, somut_özet)",
  "3. Bitene kadar tekrarla → kullanıcıya SADECE final cevap",
  "",
  "think_next KURALLARI (kesin):",
  "- answer = iş logu DEĞİL: 'Plan:', 'Read:', 'Kod review:' ile başlama.",
  "- answer = bu pass'te ne yapıldı + hangi dosya + ne değişti.",
  "- Her pass arasında gerçek iş yap; birden fazla think_next'i aynı turda çağırma.",
  "- ultra-thinking aktifken ctx_forge / başka implementation MCP ÇAĞIRMA.",
  "",
  "KURALLAR:",
  "- Chain-of-thought gösterme.",
  "- Anti-stagnation: her pass EN AZ 1 somut iyileştirme zorunlu.",
  "- Meta log think_next'e gönderilirse MCP RED eder, pass ilerlemez.",
].join("\n");

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
  const focus = getPassFocus(session.mode, nextPassNumber, session.taskKind);
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
      version: "1.6.0",
    },
    { instructions: SERVER_INSTRUCTIONS },
  );

  server.registerTool(
    "think",
    {
      description: [
        "Thinking başlatır. Mod: easy/medium/more/max.",
        "Kullanıcı sadece 'max de düşün' derse conversation_context ile chat özetini ZORUNLU geç.",
      ].join(" "),
      inputSchema: {
        user_message: z
          .string()
          .optional()
          .describe('Kullanıcının tam mesajı. Örn: "düşünme modu mcp max de düşün"'),
        conversation_context: z
          .string()
          .optional()
          .describe(
            "Chat geçmişi özeti. Kullanıcı konuyu tekrar yazmadıysa ZORUNLU — agent buraya özet geçer.",
          ),
        question: z.string().optional().describe("Soru (user_message yoksa)"),
        mode: z
          .union([MODE_SCHEMA, SHORT_MODE_SCHEMA])
          .optional()
          .describe("easy | medium | more | max"),
      },
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
    "think_next",
    {
      description:
        "Pass cevabını gönder. Bitmediyse sonraki pass direktifi, bittiyse final cevap.",
      inputSchema: {
        session_id: z.string(),
        answer: z
          .string()
          .describe(
            "Bu pass teslim özeti — iş logu değil: ne yapıldı, hangi dosya, ne değişti",
          ),
      },
    },
    async (args) => handleThinkNext(args.session_id, args.answer),
  );

  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("ultra-thinking MCP v1.6.0 — stdio");
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main().catch((err) => {
    console.error("Fatal:", err);
    process.exit(1);
  });
}
