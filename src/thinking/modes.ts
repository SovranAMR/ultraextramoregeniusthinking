import {
  allNlModePatterns,
  allStripPatterns,
  detectLocale,
  mergeModeAliases,
  suggestModeFromUseCase,
} from "./locale/index.js";

export type ThinkingMode =
  | "easy_thinking"
  | "medium_thinking"
  | "more_thinking"
  | "max_thinking";

export { detectLocale, suggestModeFromUseCase } from "./locale/index.js";
export type { Locale } from "./locale/index.js";

export interface ModeConfig {
  mode: ThinkingMode;
  totalPasses: number;
  extraRefinements: number;
  label: string;
  buttonLabel: string;
  shortName: string;
  description: string;
  useCase: string;
}

export const THINKING_MODES: Record<ThinkingMode, ModeConfig> = {
  easy_thinking: {
    mode: "easy_thinking",
    totalPasses: 3,
    extraRefinements: 2,
    label: "Easy Thinking",
    buttonLabel: "Kolay Düşün",
    shortName: "easy",
    description: "3 pass — ilk cevap + 2 iyileştirme",
    useCase: "Basit ama kaliteli cevap istenen işler",
  },
  medium_thinking: {
    mode: "medium_thinking",
    totalPasses: 5,
    extraRefinements: 4,
    label: "Medium Thinking",
    buttonLabel: "Orta Düşün",
    shortName: "medium",
    description: "5 pass — ilk cevap + 4 iyileştirme",
    useCase: "Teknik açıklama, kod inceleme, strateji, ürün fikri, iş planı",
  },
  more_thinking: {
    mode: "more_thinking",
    totalPasses: 7,
    extraRefinements: 6,
    label: "More Thinking",
    buttonLabel: "İleri Düşün",
    shortName: "more",
    description: "7 pass — ilk cevap + 6 iyileştirme",
    useCase: "Karmaşık mimari, uzun analiz, prompt tasarımı, hata ayıklama, ticari karar",
  },
  max_thinking: {
    mode: "max_thinking",
    totalPasses: 10,
    extraRefinements: 9,
    label: "Max Thinking",
    buttonLabel: "Maksimum Düşün",
    shortName: "max",
    description: "10 pass — ilk cevap + 9 iyileştirme",
    useCase:
      "Kritik kod değişikliği, yüksek riskli mimari karar, kapsamlı doküman, önemli strateji, detaylı plan",
  },
};

const MODE_ALIASES: Record<string, ThinkingMode> = mergeModeAliases();

/** Kullanıcı mesajından mod tetikleyicisini yakala — TR/EN/DE/AR locale bundle */
const NL_MODE_PATTERNS: RegExp[] = [
  ...allNlModePatterns(),
  /(?:^|\s)(easy|medium|more|max)\s+thinking/i,
  /(?:^|\s)(easy|medium|more|max)\s+modda\s+düşün/i,
];

const STRIP_PATTERNS: RegExp[] = [
  ...allStripPatterns(),
  /(?:^|\s)(?:easy|medium|more|max)\s+thinking[:\s]*/gi,
  /(?:^|\s)(?:easy|medium|more|max)\s+modda\s+düşün[:\s]*/gi,
];

export function resolveMode(mode?: string): ModeConfig {
  const key = (mode ?? "easy_thinking").toLowerCase().trim();
  const resolved = MODE_ALIASES[key] ?? "easy_thinking";
  return THINKING_MODES[resolved];
}

export function isValidMode(mode: string): mode is ThinkingMode {
  return mode in THINKING_MODES;
}

export const MODE_ENUM = [
  "easy_thinking",
  "medium_thinking",
  "more_thinking",
  "max_thinking",
] as const;

export const SHORT_MODE_ENUM = ["easy", "medium", "more", "max"] as const;

export interface ParsedThinkingRequest {
  mode: ThinkingMode;
  question: string;
  detectedFromText: boolean;
  matchedTrigger?: string;
}

/** Kullanıcı sadece mod tetikledi, somut soru yazmadı */
export function isModeOnlyTrigger(text: string): boolean {
  const parsed = parseThinkingRequest(text);
  if (!parsed.detectedFromText) return false;
  const q = parsed.question.trim().toLowerCase();
  if (!q || q.length < 5) return true;
  return NL_MODE_PATTERNS.some((p) => {
    const m = q.match(p);
    return m !== null && q.replace(p, "").trim().length < 10;
  });
}

export function resolveQuestion(
  parsed: ParsedThinkingRequest,
  conversationContext?: string,
): string {
  if (conversationContext?.trim()) {
    if (isModeOnlyTrigger(parsed.question) || parsed.question === parsed.matchedTrigger) {
      return conversationContext.trim();
    }
    return `${parsed.question.trim()}\n\n---\nChat bağlamı:\n${conversationContext.trim()}`;
  }
  return parsed.question;
}

export function parseThinkingRequest(text: string): ParsedThinkingRequest {
  const trimmed = text.trim();
  let matchedMode: ThinkingMode | null = null;
  let matchedTrigger: string | undefined;

  for (const pattern of NL_MODE_PATTERNS) {
    const match = trimmed.match(pattern);
    if (match?.[1]) {
      const alias = match[1].toLowerCase();
      matchedMode = MODE_ALIASES[alias] ?? null;
      matchedTrigger = match[0].trim();
      if (matchedMode) break;
    }
  }

  let question = trimmed;
  for (const strip of STRIP_PATTERNS) {
    question = question.replace(strip, " ").trim();
  }
  question = question.replace(/^[:\-–—]\s*/, "").trim();

  if (!question) {
    question = trimmed;
  }

  const useCaseMode = matchedMode
    ? null
    : suggestModeFromUseCase(trimmed, detectLocale(trimmed));

  return {
    mode: matchedMode ?? useCaseMode ?? "easy_thinking",
    question,
    detectedFromText: matchedMode !== null,
    matchedTrigger,
  };
}

export function formatUserExamples(): string {
  return [
    "düşünme modu mcp easy de düşün: [soru]",
    "düşünme modu mcp medium de düşün: [soru]",
    "düşünme modu mcp more de düşün: [soru]",
    "düşünme modu mcp max de düşün: [soru]",
  ].join("\n");
}
