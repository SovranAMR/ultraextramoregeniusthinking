import { z } from "zod";
import { MODE_ENUM, SHORT_MODE_ENUM } from "./thinking/modes.js";

/**
 * MCP tool schema — stability contract.
 *
 * Surface: exactly two tools — `think`, `think_next`. No resources, no prompts.
 * Within the same semver MAJOR, tool names and input field names stay fixed.
 * Required input combinations (see below) are part of the public contract.
 * Additive optional fields may ship in MINOR; renames/removals require MAJOR bump.
 *
 * `think` input (at least one path):
 *   - user_message (+ optional conversation_context, mode)
 *   - question (+ optional conversation_context, mode)
 *   - conversation_context alone (+ optional mode)
 *
 * `think_next` input: session_id + answer (both required).
 *
 * Response: MCP text content only — start/refinement/completion directives or errors.
 */
export const MCP_TOOL_SCHEMA_VERSION = "1.0.0" as const;

export const MCP_TOOL_NAMES = {
  think: "think",
  think_next: "think_next",
} as const;

const MODE_SCHEMA = z.enum(MODE_ENUM);
const SHORT_MODE_SCHEMA = z.enum(SHORT_MODE_ENUM);

/** Stable `think` tool registration payload — keep in sync with MCP_TOOL_SCHEMA_VERSION. */
export const THINK_TOOL = {
  name: MCP_TOOL_NAMES.think,
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
} as const;

/** Stable `think_next` tool registration payload — keep in sync with MCP_TOOL_SCHEMA_VERSION. */
export const THINK_NEXT_TOOL = {
  name: MCP_TOOL_NAMES.think_next,
  description:
    "Pass cevabını gönder. Bitmediyse sonraki pass direktifi, bittiyse final cevap.",
  inputSchema: {
    session_id: z.string().describe("think yanıtındaki session_id"),
    answer: z
      .string()
      .describe(
        "Bu pass teslim özeti — iş logu değil: ne yapıldı, hangi dosya, ne değişti",
      ),
  },
} as const;
