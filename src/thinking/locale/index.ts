export type Locale = "tr" | "en" | "de" | "ar";

export type LocaleModeId =
  | "easy_thinking"
  | "medium_thinking"
  | "more_thinking"
  | "max_thinking";

export const SUPPORTED_LOCALES: Locale[] = ["tr", "en", "de", "ar"];

export interface UseCaseSnippet {
  id: string;
  trigger: RegExp;
  suggestedMode: LocaleModeId;
}

export interface LocaleBundle {
  code: Locale;
  modeAliases: Record<string, LocaleModeId>;
  nlModePatterns: RegExp[];
  stripPatterns: RegExp[];
  useCaseSnippets: UseCaseSnippet[];
  detectHints: RegExp[];
}

const USE_CASE_MATRIX: UseCaseSnippet[] = [
  { id: "bug_fix", trigger: /bu test neden fail|why (?:does )?this test fail/i, suggestedMode: "medium_thinking" },
  { id: "refactor", trigger: /bu modülü toparla|refactor this module/i, suggestedMode: "more_thinking" },
  {
    id: "migration",
    trigger: /postgres jsonb geçiş|postgres jsonb migration/i,
    suggestedMode: "max_thinking",
  },
  { id: "review", trigger: /auth bypass var mı|auth bypass/i, suggestedMode: "max_thinking" },
  { id: "incident", trigger: /prod 500 root cause|prod.*500.*root cause/i, suggestedMode: "max_thinking" },
  { id: "feature", trigger: /webhook retry ekle|add webhook retry/i, suggestedMode: "medium_thinking" },
  {
    id: "analysis",
    trigger: /monolith mi micro mu|monolith vs micro/i,
    suggestedMode: "more_thinking",
  },
];

export const LOCALE_BUNDLES: Record<Locale, LocaleBundle> = {
  tr: {
    code: "tr",
    modeAliases: {
      kolay: "easy_thinking",
      orta: "medium_thinking",
      ileri: "more_thinking",
      maksimum: "max_thinking",
    },
    nlModePatterns: [
      /düşünme\s+modu\s+mcp\s+(easy|medium|more|max|kolay|orta|ileri|maksimum)/i,
      /mcp\s+(easy|medium|more|max|kolay|orta|ileri|maksimum)\s*(?:de\s+)?düşün/i,
      /(?:^|\s)(easy|medium|more|max)\s*(?:de\s+)?düşün/i,
      /(?:^|\s)(kolay|orta|ileri|maksimum)\s+modda\s+düşün/i,
      /(?:^|\s)(easy|medium|more|max)\s+da\s+düşünerek/i,
      /(?:^|\s)(kolay|orta|ileri|maksimum)\s+da\s+düşünerek/i,
    ],
    stripPatterns: [
      /düşünme\s+modu\s+mcp\s+(?:easy|medium|more|max|kolay|orta|ileri|maksimum)\s*(?:de\s+)?düşün[:\s]*/gi,
      /mcp\s+(?:easy|medium|more|max|kolay|orta|ileri|maksimum)\s*(?:de\s+)?düşün[:\s]*/gi,
      /(?:^|\s)(?:easy|medium|more|max)\s*(?:de\s+)?düşün[:\s]*/gi,
      /(?:^|\s)(?:kolay|orta|ileri|maksimum)\s*(?:de\s+)?düşün[:\s]*/gi,
      /(?:^|\s)(?:easy|medium|more|max|kolay|orta|ileri|maksimum)\s+modda\s+düşün[:\s]*/gi,
      /(?:^|\s)(?:easy|medium|more|max|kolay|orta|ileri|maksimum)\s+da\s+düşünerek[:\s]*/gi,
    ],
    useCaseSnippets: USE_CASE_MATRIX.filter((s) =>
      /fail|toparla|geçiş|bypass|500|webhook|monolith/i.test(s.trigger.source),
    ),
    detectHints: [/düşün/i, /modu mcp/i, /kolay|orta|ileri|maksimum/i],
  },
  en: {
    code: "en",
    modeAliases: {},
    nlModePatterns: [
      /(?:^|\s)(easy|medium|more|max)\s+mode\s+think/i,
      /(?:^|\s)think\s+(?:in\s+)?(?:easy|medium|more|max)\s+mode/i,
      /(?:^|\s)(easy|medium|more|max)\s+thinking/i,
      /(?:^|\s)(easy|medium|more|max)\s+mode\s+thinking/i,
    ],
    stripPatterns: [
      /(?:^|\s)(?:easy|medium|more|max)\s+mode\s+think[:\s]*/gi,
      /(?:^|\s)think\s+(?:in\s+)?(?:easy|medium|more|max)\s+mode[:\s]*/gi,
      /(?:^|\s)(?:easy|medium|more|max)\s+thinking[:\s]*/gi,
      /(?:^|\s)(?:easy|medium|more|max)\s+mode\s+thinking[:\s]*/gi,
    ],
    useCaseSnippets: USE_CASE_MATRIX.filter((s) =>
      /why|refactor|migration|bypass|root cause|webhook|monolith vs/i.test(s.trigger.source),
    ),
    detectHints: [/\bthink\b/i, /\bmode\b/i, /\beasy thinking\b/i],
  },
  de: {
    code: "de",
    modeAliases: {
      einfach: "easy_thinking",
      mittel: "medium_thinking",
      mehr: "more_thinking",
      maximal: "max_thinking",
    },
    nlModePatterns: [
      /(?:^|\s)(einfach|mittel|mehr|maximal|easy|medium|more|max)\s+modus\s+denken/i,
      /(?:^|\s)im\s+(einfach|mittel|mehr|maximal|easy|medium|more|max)\s+modus\s+denken/i,
      /(?:^|\s)(easy|medium|more|max)\s+modus\s+denken/i,
    ],
    stripPatterns: [
      /(?:^|\s)(?:einfach|mittel|mehr|maximal|easy|medium|more|max)\s+modus\s+denken[:\s]*/gi,
      /(?:^|\s)im\s+(?:einfach|mittel|mehr|maximal|easy|medium|more|max)\s+modus\s+denken[:\s]*/gi,
    ],
    useCaseSnippets: [],
    detectHints: [/\bdenken\b/i, /\bmodus\b/i, /\beinfach\b/i, /\bmittel\b/i],
  },
  ar: {
    code: "ar",
    modeAliases: {
      سهل: "easy_thinking",
      متوسط: "medium_thinking",
      أكثر: "more_thinking",
      أقصى: "max_thinking",
    },
    nlModePatterns: [
      /(?:^|\s)(?:فكر|think)\s+(?:in\s+)?(easy|medium|more|max|سهل|متوسط|أكثر|أقصى)/i,
      /(?:^|\s)(easy|medium|more|max|سهل|متوسط|أكثر|أقصى)\s+(?:وضع\s+)?(?:فكر|think)/i,
    ],
    stripPatterns: [
      /(?:^|\s)(?:فكر|think)\s+(?:in\s+)?(?:easy|medium|more|max|سهل|متوسط|أكثر|أقصى)[:\s]*/gi,
      /(?:^|\s)(?:easy|medium|more|max|سهل|متوسط|أكثر|أقصى)\s+(?:وضع\s+)?(?:فكر|think)[:\s]*/gi,
    ],
    useCaseSnippets: [],
    detectHints: [/[\u0600-\u06FF]/, /فكر/],
  },
};

export function detectLocale(text: string): Locale {
  if (/[\u0600-\u06FF]/.test(text)) return "ar";
  if (/\b(denken|modus|einfach|mittel|mehr|maximal)\b/i.test(text)) return "de";
  if (/\b(think|thinking)\b/i.test(text) && !/düşün/i.test(text)) return "en";
  return "tr";
}

export function getLocaleBundle(locale: Locale): LocaleBundle {
  return LOCALE_BUNDLES[locale];
}

export function mergeModeAliases(): Record<string, LocaleModeId> {
  const merged: Record<string, LocaleModeId> = {
    easy: "easy_thinking",
    easy_thinking: "easy_thinking",
    medium: "medium_thinking",
    medium_thinking: "medium_thinking",
    more: "more_thinking",
    more_thinking: "more_thinking",
    max: "max_thinking",
    max_thinking: "max_thinking",
  };
  for (const bundle of Object.values(LOCALE_BUNDLES)) {
    Object.assign(merged, bundle.modeAliases);
  }
  return merged;
}

export function allNlModePatterns(): RegExp[] {
  const seen = new Set<string>();
  const patterns: RegExp[] = [];
  for (const bundle of Object.values(LOCALE_BUNDLES)) {
    for (const p of bundle.nlModePatterns) {
      const key = p.source;
      if (!seen.has(key)) {
        seen.add(key);
        patterns.push(p);
      }
    }
  }
  return patterns;
}

export function allStripPatterns(): RegExp[] {
  const seen = new Set<string>();
  const patterns: RegExp[] = [];
  for (const bundle of Object.values(LOCALE_BUNDLES)) {
    for (const p of bundle.stripPatterns) {
      const key = p.source + p.flags;
      if (!seen.has(key)) {
        seen.add(key);
        patterns.push(p);
      }
    }
  }
  return patterns;
}

export function suggestModeFromUseCase(text: string, locale: Locale = "tr"): LocaleModeId | null {
  const bundles = locale === "tr" ? [LOCALE_BUNDLES.tr] : [LOCALE_BUNDLES[locale], LOCALE_BUNDLES.tr];
  for (const bundle of bundles) {
    for (const snippet of bundle.useCaseSnippets) {
      if (snippet.trigger.test(text)) return snippet.suggestedMode;
    }
  }
  for (const snippet of USE_CASE_MATRIX) {
    if (snippet.trigger.test(text)) return snippet.suggestedMode;
  }
  return null;
}
