import type { ThinkingMode } from "./modes.js";

export type OrchestrationIntent = "create_plan" | "run_step" | "plan_progress" | "none";

export interface ParsedOrchestrationRequest {
  intent: OrchestrationIntent;
  /** Görev açıklaması — tetikleyiciler strip edildikten sonra */
  taskDescription: string;
  /** Adım oturumları için mod (create_plan / run_step) */
  stepMode: ThinkingMode;
  /** run_step: hedef adım numarası */
  stepNumber?: number;
  matchedTrigger?: string;
  originalText: string;
}

const MODE_ALIASES: Record<string, ThinkingMode> = {
  easy: "easy_thinking",
  easy_thinking: "easy_thinking",
  medium: "medium_thinking",
  medium_thinking: "medium_thinking",
  more: "more_thinking",
  more_thinking: "more_thinking",
  max: "max_thinking",
  max_thinking: "max_thinking",
  kolay: "easy_thinking",
  orta: "medium_thinking",
  ileri: "more_thinking",
  maksimum: "max_thinking",
};

/** Kategori-nötr büyük iş plan tetikleyicileri — TR */
const PLAN_CREATE_TR: RegExp[] = [
  /plan\s+(?:çıkar|oluştur|hazırla|yap)/i,
  /önce\s+plan/i,
  /fazlara\s+böl/i,
  /faz\s+faz\s+(?:götür|kur|tasarla|plan)/i,
  /adım\s+adım\s+(?:plan|götür|tasarla|kur|düşün)/i,
  /işi\s+parçalara\s+böl/i,
  /(?:sıfırdan|baştan)\s+(?:kur|tasarla|inşa)/i,
  /planla\s+ve\s+(?:her|adım|faz)/i,
  /her\s+adımı\s+(?:en\s+)?(?:derin|max)\s+düşün/i,
];

/** Kategori-nötr büyük iş plan tetikleyicileri — EN */
const PLAN_CREATE_EN: RegExp[] = [
  /create\s+a\s+plan/i,
  /make\s+a\s+plan/i,
  /plan\s+first/i,
  /break\s+(?:it|this|the\s+\w+)\s+into\s+(?:steps|phases)/i,
  /phase\s+by\s+phase/i,
  /step\s+by\s+step\s+(?:plan|design|build)/i,
  /\borchestrate\b/i,
  /design\s+from\s+scratch/i,
  /build\s+from\s+scratch/i,
  /deep\s+think\s+each\s+step/i,
  /think\s+deeply\s+(?:on\s+)?each\s+step/i,
];

const PLAN_CREATE_PATTERNS: RegExp[] = [...PLAN_CREATE_TR, ...PLAN_CREATE_EN];

const PLAN_PROGRESS_TR: RegExp[] = [
  /plan\s+(?:ilerlemesi|durumu|nerede)/i,
  /sırada\s+ne\s+(?:var|adım)/i,
  /hangi\s+adım\s+bitti/i,
];

const PLAN_PROGRESS_EN: RegExp[] = [
  /plan\s+progress/i,
  /what(?:'s| is)\s+next\s+(?:in\s+the\s+)?plan/i,
  /which\s+step\s+(?:is\s+)?(?:done|complete|finished)/i,
];

const PLAN_PROGRESS_PATTERNS: RegExp[] = [...PLAN_PROGRESS_TR, ...PLAN_PROGRESS_EN];

const RUN_STEP_PATTERNS: RegExp[] = [
  /adım\s+(\d+)\s*(?:i\s+)?(?:(easy|medium|more|max|kolay|orta|ileri|maksimum)\s*(?:de\s+)?düşün|düşün)/i,
  /think\s+(?:through\s+)?step\s+(\d+)(?:\s+(?:in\s+)?(easy|medium|more|max))?/i,
  /step\s+(\d+)\s+(?:in\s+)?(easy|medium|more|max)\s+(?:mode\s+)?think/i,
];

const STEP_MODE_PATTERNS: RegExp[] = [
  /her\s+adımı\s+(easy|medium|more|max|kolay|orta|ileri|maksimum)\s*(?:de\s+)?düşün/i,
  /each\s+step\s+(?:in\s+)?(easy|medium|more|max)\s+(?:mode\s+)?think/i,
  /think\s+(?:through\s+)?each\s+step\s+(?:in\s+)?(easy|medium|more|max)/i,
  /(easy|medium|more|max)\s+mode\s+for\s+each\s+step/i,
  /(easy|medium|more|max)\s+for\s+each\s+step/i,
];

const DEEP_STEP_DEFAULT: ThinkingMode = "max_thinking";

const STRIP_PATTERNS: RegExp[] = [
  /plan\s+(?:çıkar|oluştur|hazırla|yap)[:\s,]*/gi,
  /önce\s+plan[:\s,]*/gi,
  /fazlara\s+böl[:\s,]*/gi,
  /faz\s+faz\s+(?:götür|kur|tasarla|plan)[:\s,]*/gi,
  /adım\s+adım\s+(?:plan|götür|tasarla|kur|düşün)[:\s,]*/gi,
  /işi\s+parçalara\s+böl[:\s,]*/gi,
  /planla\s+ve\s+(?:her|adım|faz)[:\s,]*/gi,
  /create\s+a\s+plan[:\s,]*/gi,
  /make\s+a\s+plan[:\s,]*/gi,
  /plan\s+first[:\s,]*/gi,
  /break\s+(?:it|this|the\s+\w+)\s+into\s+(?:steps|phases)[:\s,]*/gi,
  /phase\s+by\s+phase[:\s,]*/gi,
  /step\s+by\s+step\s+(?:plan|design|build)[:\s,]*/gi,
  /\borchestrate[:\s,]*/gi,
  /design\s+from\s+scratch[:\s,]*/gi,
  /build\s+from\s+scratch[:\s,]*/gi,
  /her\s+adımı\s+(?:en\s+)?(?:derin|max|easy|medium|more|kolay|orta|ileri|maksimum)\s*(?:de\s+)?düşün[:\s,]*/gi,
  /each\s+step\s+(?:in\s+)?(?:easy|medium|more|max)\s+(?:mode\s+)?think[:\s,]*/gi,
  /think\s+(?:through\s+)?each\s+step\s+(?:in\s+)?(?:easy|medium|more|max)[:\s,]*/gi,
  /deep\s+think\s+each\s+step[:\s,]*/gi,
  /think\s+deeply\s+(?:on\s+)?each\s+step[:\s,]*/gi,
  /(?:easy|medium|more|max)\s+mode\s+for\s+each\s+step[:\s,]*/gi,
  /(?:easy|medium|more|max)\s+for\s+each\s+step[:\s,]*/gi,
  /(?:sıfırdan|baştan)\s+(?:kur|tasarla|inşa)[:\s,]*/gi,
];

function resolveStepMode(alias?: string): ThinkingMode {
  if (!alias) return DEEP_STEP_DEFAULT;
  const key = alias.toLowerCase().trim();
  return MODE_ALIASES[key] ?? DEEP_STEP_DEFAULT;
}

function extractStepMode(text: string): ThinkingMode {
  for (const pattern of STEP_MODE_PATTERNS) {
    const match = text.match(pattern);
    if (match?.[1]) return resolveStepMode(match[1]);
  }
  if (/her\s+adımı\s+(?:en\s+)?(?:derin|max)\s+düşün/i.test(text)) return "max_thinking";
  if (/deep\s+think\s+each\s+step|think\s+deeply\s+(?:on\s+)?each\s+step/i.test(text)) {
    return "max_thinking";
  }
  return DEEP_STEP_DEFAULT;
}

function firstMatch(text: string, patterns: RegExp[]): { match: RegExpMatchArray; pattern: RegExp } | null {
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) return { match, pattern };
  }
  return null;
}

function stripTriggers(text: string): string {
  let result = text.trim();
  for (const pattern of STRIP_PATTERNS) {
    result = result.replace(pattern, " ").trim();
  }
  result = result.replace(/^[:\-–—,]\s*/, "").trim();
  result = result.replace(/\s{2,}/g, " ").trim();
  return result;
}

export function isOrchestrationTrigger(text: string): boolean {
  return parseOrchestrationRequest(text).intent !== "none";
}

/** F5: TR + EN doğal dil — büyük iş orkestrasyon tetikleyicileri (kategori-nötr) */
export function parseOrchestrationRequest(text: string): ParsedOrchestrationRequest {
  const trimmed = text.trim();
  const base: ParsedOrchestrationRequest = {
    intent: "none",
    taskDescription: trimmed,
    stepMode: DEEP_STEP_DEFAULT,
    originalText: trimmed,
  };

  if (!trimmed) return base;

  const progressHit = firstMatch(trimmed, PLAN_PROGRESS_PATTERNS);
  if (progressHit) {
    return {
      ...base,
      intent: "plan_progress",
      matchedTrigger: progressHit.match[0].trim(),
      taskDescription: stripTriggers(trimmed) || trimmed,
    };
  }

  const runStepHit = firstMatch(trimmed, RUN_STEP_PATTERNS);
  if (runStepHit) {
    const stepNum = Number.parseInt(runStepHit.match[1], 10);
    const modeAlias = runStepHit.match[2];
    return {
      ...base,
      intent: "run_step",
      stepNumber: stepNum,
      stepMode: resolveStepMode(modeAlias),
      matchedTrigger: runStepHit.match[0].trim(),
      taskDescription: stripTriggers(trimmed) || trimmed,
    };
  }

  const planHit = firstMatch(trimmed, PLAN_CREATE_PATTERNS);
  if (planHit) {
    return {
      ...base,
      intent: "create_plan",
      stepMode: extractStepMode(trimmed),
      matchedTrigger: planHit.match[0].trim(),
      taskDescription: stripTriggers(trimmed) || trimmed,
    };
  }

  return base;
}

/** Server instructions için kısa TR/EN örnek blok */
export function formatOrchestrationNlHints(locale: "tr" | "en" = "tr"): string {
  if (locale === "en") {
    return [
      "ORCHESTRATION (big jobs — category-neutral):",
      '• "create a plan, think each step in max mode: [project scope]"',
      '• "plan first, deep think each step: [system design]"',
      '• "think step 2 in max mode" / "plan progress"',
    ].join("\n");
  }
  return [
    "ORKESTRASYON (büyük iş — kategori-nötr):",
    '• "plan çıkar, her adımı max düşün: [proje kapsamı]"',
    '• "önce plan, her adımı derin düşün: [sistem tasarımı]"',
    '• "adım 2 max düşün" / "plan ilerlemesi"',
  ].join("\n");
}
