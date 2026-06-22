export type SupportedLocale = "tr" | "en" | "de" | "ar";

export type LocaleModeKey =
  | "easy_thinking"
  | "medium_thinking"
  | "more_thinking"
  | "max_thinking";

export interface UseCaseSnippet {
  domain: string;
  trigger: string;
  mode: "easy" | "medium" | "more" | "max";
}

export interface LocaleBundle {
  locale: SupportedLocale;
  modeAliases: Record<string, LocaleModeKey>;
  nlPatterns: RegExp[];
  stripPatterns: RegExp[];
  useCases: UseCaseSnippet[];
}

const MODE_KEYS = ["easy", "medium", "more", "max"] as const;

function aliasMap(
  easy: string,
  medium: string,
  more: string,
  max: string,
): Record<string, LocaleModeKey> {
  return {
    easy: "easy_thinking",
    easy_thinking: "easy_thinking",
    [easy]: "easy_thinking",
    medium: "medium_thinking",
    medium_thinking: "medium_thinking",
    [medium]: "medium_thinking",
    more: "more_thinking",
    more_thinking: "more_thinking",
    [more]: "more_thinking",
    max: "max_thinking",
    max_thinking: "max_thinking",
    [max]: "max_thinking",
  };
}

export const LOCALES: Record<SupportedLocale, LocaleBundle> = {
  tr: {
    locale: "tr",
    modeAliases: aliasMap("kolay", "orta", "ileri", "maksimum"),
    nlPatterns: [
      /düşünme\s+modu\s+mcp\s+(easy|medium|more|max|kolay|orta|ileri|maksimum)/i,
      /mcp\s+(easy|medium|more|max|kolay|orta|ileri|maksimum)\s*(?:de\s+)?düşün/i,
      /(?:^|\s)(easy|medium|more|max)\s*(?:de\s+)?düşün/i,
      /(?:^|\s)(easy|medium|more|max)\s+thinking/i,
      /(?:^|\s)(easy|medium|more|max)\s+modda\s+düşün/i,
      /(?:^|\s)(kolay|orta|ileri|maksimum)\s+modda\s+düşün/i,
      /(?:^|\s)(easy|medium|more|max)\s+da\s+düşünerek/i,
      /(?:^|\s)(kolay|orta|ileri|maksimum)\s+da\s+düşünerek/i,
    ],
    stripPatterns: [
      /düşünme\s+modu\s+mcp\s+(?:easy|medium|more|max|kolay|orta|ileri|maksimum)\s*(?:de\s+)?düşün[:\s]*/gi,
      /mcp\s+(?:easy|medium|more|max|kolay|orta|ileri|maksimum)\s*(?:de\s+)?düşün[:\s]*/gi,
      /(?:^|\s)(?:easy|medium|more|max)\s*(?:de\s+)?düşün[:\s]*/gi,
      /(?:^|\s)(?:easy|medium|more|max)\s+thinking[:\s]*/gi,
      /(?:^|\s)(?:kolay|orta|ileri|maksimum)\s*(?:de\s+)?düşün[:\s]*/gi,
      /(?:^|\s)(?:easy|medium|more|max)\s+modda\s+düşün[:\s]*/gi,
      /(?:^|\s)(?:kolay|orta|ileri|maksimum)\s+modda\s+düşün[:\s]*/gi,
      /(?:^|\s)(?:easy|medium|more|max)\s+da\s+düşünerek[:\s]*/gi,
      /(?:^|\s)(?:kolay|orta|ileri|maksimum)\s+da\s+düşünerek[:\s]*/gi,
    ],
    useCases: [
      { domain: "bug_fix", trigger: "bu test neden fail", mode: "medium" },
      { domain: "refactor", trigger: "bu modülü toparla", mode: "more" },
      { domain: "migration", trigger: "postgres jsonb geçiş", mode: "max" },
      { domain: "review", trigger: "auth bypass var mı", mode: "max" },
      { domain: "incident", trigger: "prod 500 root cause", mode: "max" },
      { domain: "feature", trigger: "webhook retry ekle", mode: "medium" },
      { domain: "analysis", trigger: "monolith mi micro mu", mode: "more" },
    ],
  },
  en: {
    locale: "en",
    modeAliases: aliasMap("simple", "moderate", "advanced", "maximum"),
    nlPatterns: [
      /(?:^|\s)(easy|medium|more|max)\s+mode\s+think/i,
      /think\s+in\s+(easy|medium|more|max)\s+mode/i,
      /(?:^|\s)(easy|medium|more|max)\s+thinking/i,
      /mcp\s+(easy|medium|more|max)\s+think/i,
      /thinking\s+mode\s+mcp\s+(easy|medium|more|max)/i,
      /(?:^|\s)(easy|medium|more|max)\s+think/i,
    ],
    stripPatterns: [
      /(?:^|\s)(?:easy|medium|more|max)\s+mode\s+think[:\s]*/gi,
      /think\s+in\s+(?:easy|medium|more|max)\s+mode[:\s]*/gi,
      /(?:^|\s)(?:easy|medium|more|max)\s+thinking[:\s]*/gi,
      /mcp\s+(?:easy|medium|more|max)\s+think[:\s]*/gi,
      /thinking\s+mode\s+mcp\s+(?:easy|medium|more|max)[:\s]*/gi,
      /(?:^|\s)(?:easy|medium|more|max)\s+think[:\s]*/gi,
    ],
    useCases: [
      { domain: "bug_fix", trigger: "why does this test fail", mode: "medium" },
      { domain: "refactor", trigger: "clean up this module", mode: "more" },
      { domain: "migration", trigger: "postgres jsonb migration", mode: "max" },
      { domain: "review", trigger: "is there an auth bypass", mode: "max" },
      { domain: "incident", trigger: "prod 500 root cause", mode: "max" },
      { domain: "feature", trigger: "add webhook retry", mode: "medium" },
      { domain: "analysis", trigger: "monolith or microservices", mode: "more" },
    ],
  },
  de: {
    locale: "de",
    modeAliases: aliasMap("einfach", "mittel", "fortgeschritten", "maximal"),
    nlPatterns: [
      /(?:^|\s)(easy|medium|more|max)\s+modus\s+denken/i,
      /denke\s+im\s+(easy|medium|more|max)\s+modus/i,
      /mcp\s+(easy|medium|more|max)\s+denken/i,
      /denkmodus\s+mcp\s+(easy|medium|more|max)/i,
      /(?:^|\s)(easy|medium|more|max)\s+denken/i,
    ],
    stripPatterns: [
      /(?:^|\s)(?:easy|medium|more|max)\s+modus\s+denken[:\s]*/gi,
      /denke\s+im\s+(?:easy|medium|more|max)\s+modus[:\s]*/gi,
      /mcp\s+(?:easy|medium|more|max)\s+denken[:\s]*/gi,
      /denkmodus\s+mcp\s+(?:easy|medium|more|max)[:\s]*/gi,
      /(?:^|\s)(?:easy|medium|more|max)\s+denken[:\s]*/gi,
    ],
    useCases: [
      { domain: "bug_fix", trigger: "warum schlägt dieser test fehl", mode: "medium" },
      { domain: "refactor", trigger: "dieses modul aufräumen", mode: "more" },
      { domain: "migration", trigger: "postgres jsonb migration", mode: "max" },
      { domain: "review", trigger: "gibt es einen auth bypass", mode: "max" },
      { domain: "incident", trigger: "prod 500 ursache", mode: "max" },
      { domain: "feature", trigger: "webhook retry hinzufügen", mode: "medium" },
      { domain: "analysis", trigger: "monolith oder microservices", mode: "more" },
    ],
  },
  ar: {
    locale: "ar",
    modeAliases: aliasMap("سهل", "متوسط", "متقدم", "أقصى"),
    nlPatterns: [
      /(?:^|\s)(easy|medium|more|max)\s+وضع\s+فكر/i,
      /فكر\s+في\s+وضع\s+(easy|medium|more|max)/i,
      /(?:^|\s)(easy|medium|more|max)\s+التفكير/i,
      /mcp\s+(easy|medium|more|max)\s+فكر/i,
      /وضع\s+التفكير\s+mcp\s+(easy|medium|more|max)/i,
    ],
    stripPatterns: [
      /(?:^|\s)(?:easy|medium|more|max)\s+وضع\s+فكر[:\s]*/gi,
      /فكر\s+في\s+وضع\s+(?:easy|medium|more|max)[:\s]*/gi,
      /(?:^|\s)(?:easy|medium|more|max)\s+التفكير[:\s]*/gi,
      /mcp\s+(?:easy|medium|more|max)\s+فكر[:\s]*/gi,
      /وضع\s+التفكير\s+mcp\s+(?:easy|medium|more|max)[:\s]*/gi,
    ],
    useCases: [
      { domain: "bug_fix", trigger: "لماذا يفشل هذا الاختبار", mode: "medium" },
      { domain: "refactor", trigger: "رتب هذا الوحدة", mode: "more" },
      { domain: "migration", trigger: "postgres jsonb ترحيل", mode: "max" },
      { domain: "review", trigger: "هل يوجد auth bypass", mode: "max" },
      { domain: "incident", trigger: "prod 500 السبب الجذري", mode: "max" },
      { domain: "feature", trigger: "أضف webhook retry", mode: "medium" },
      { domain: "analysis", trigger: "monolith أم microservices", mode: "more" },
    ],
  },
};

/** Metinden locale tahmin et — mod eşleşmesi yoksa script/heuristik */
export function detectLocale(text: string): SupportedLocale {
  if (/[\u0600-\u06FF]/.test(text)) return "ar";
  if (/\b(modus|denken|denkmodus)\b/i.test(text)) return "de";
  if (/\b(think|thinking|mode think)\b/i.test(text)) return "en";
  if (/düşün|modda|kolay|orta|ileri|maksimum/i.test(text)) return "tr";
  return "tr";
}

export function resolveModeAlias(alias: string, locale: SupportedLocale): LocaleModeKey | null {
  const key = alias.toLowerCase();
  return LOCALES[locale].modeAliases[key] ?? LOCALES.tr.modeAliases[key] ?? null;
}

export function getAllModePatterns(): Array<{
  locale: SupportedLocale;
  pattern: RegExp;
}> {
  const out: Array<{ locale: SupportedLocale; pattern: RegExp }> = [];
  for (const bundle of Object.values(LOCALES)) {
    for (const pattern of bundle.nlPatterns) {
      out.push({ locale: bundle.locale, pattern });
    }
  }
  return out;
}

export function getAllStripPatterns(): RegExp[] {
  return Object.values(LOCALES).flatMap((b) => b.stripPatterns);
}

export function getUseCaseSnippets(locale: SupportedLocale): UseCaseSnippet[] {
  return LOCALES[locale].useCases;
}

export { MODE_KEYS };
