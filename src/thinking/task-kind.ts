import type { ThinkingMode } from "./modes.js";
import type { PassFocus, ExecutionKind } from "./pass-focus.js";
import type { Locale } from "./locale/index.js";
import { getCreativePassText } from "./locale/creative-plans.js";
import { getAnalysisPassText } from "./locale/analysis-plans.js";

export type TaskKind = "creative" | "code" | "analysis";

const CREATIVE_RE =
  /\b(çiz|çizim|illüstrasyon|svg|html yap|landing|tavus|kuş|görsel|ui|tasarım|draw|illustrat|paint|render)\b/i;

const CODE_RE =
  /\b(kod|refactor|bug|fix|api|typescript|javascript|python|fonksiyon|class|migrate|implement|dosya oluştur|yaz ve düzelt)\b/i;

const ANALYSIS_RE =
  /\b(analiz|analysis|analyze|analyse|artı eksileri|advantages and disadvantages|strengths and weaknesses|karşılaştır|compare|değerlendir|evaluate|assess|mimari karar|architectural decision|trade-?offs?|pros and cons|why should|which is better|should we choose|hangisi daha|tercih etmeli|weigh (?:the )?options|cost-?benefit|impact analysis|versus|\bvs\.?\b)\b/i;

/** Görsel görevde yanlışlıkla code planına düşüren zayıf sinyaller (dosya oluştur, implement vb.) */
const STRONG_CODE_RE =
  /\b(kod|refactor|bug|fix|api|typescript|javascript|python|fonksiyon|class|migrate)\b/i;

export function detectTaskKind(question: string): TaskKind {
  const q = question.toLowerCase();
  if (CREATIVE_RE.test(q) && !STRONG_CODE_RE.test(q)) return "creative";
  if (CODE_RE.test(q)) return "code";
  if (ANALYSIS_RE.test(q)) return "analysis";
  return "code";
}

interface CreativePassSkeleton {
  pass: number;
  lens: string;
  execution: ExecutionKind;
}

const CREATIVE_EASY: CreativePassSkeleton[] = [
  { pass: 1, lens: "draft", execution: "write" },
  { pass: 2, lens: "outcome_judgment", execution: "read" },
  { pass: 3, lens: "verify_final", execution: "verify" },
];

const CREATIVE_MEDIUM: CreativePassSkeleton[] = [
  { pass: 1, lens: "draft", execution: "write" },
  { pass: 2, lens: "gap_analysis", execution: "read" },
  { pass: 3, lens: "outcome_judgment", execution: "read" },
  { pass: 4, lens: "apply_judgment", execution: "write" },
  { pass: 5, lens: "verify_final", execution: "verify" },
];

const CREATIVE_MORE_EXTRA: CreativePassSkeleton[] = [
  { pass: 6, lens: "plain_baseline", execution: "read" },
  { pass: 7, lens: "verify_final", execution: "verify" },
];

const CREATIVE_MAX_EXTRA: CreativePassSkeleton[] = [
  { pass: 6, lens: "outcome_judgment", execution: "read" },
  { pass: 7, lens: "plain_baseline", execution: "read" },
  { pass: 8, lens: "apply_judgment", execution: "write" },
  { pass: 9, lens: "trim_polish", execution: "write" },
  { pass: 10, lens: "verify_final", execution: "verify" },
];

interface AnalysisPassSkeleton {
  pass: number;
  lens: string;
  execution: ExecutionKind;
}

const ANALYSIS_EASY: AnalysisPassSkeleton[] = [
  { pass: 1, lens: "draft", execution: "none" },
  { pass: 2, lens: "gap_logic", execution: "read" },
  { pass: 3, lens: "verify_final", execution: "verify" },
];

const ANALYSIS_MEDIUM: AnalysisPassSkeleton[] = [
  { pass: 1, lens: "draft", execution: "none" },
  { pass: 2, lens: "gap_analysis", execution: "read" },
  { pass: 3, lens: "evidence_review", execution: "read" },
  { pass: 4, lens: "synthesis", execution: "read" },
  { pass: 5, lens: "verify_final", execution: "verify" },
];

const ANALYSIS_MORE_EXTRA: AnalysisPassSkeleton[] = [
  { pass: 6, lens: "structure_ripple", execution: "read" },
  { pass: 7, lens: "verify_final", execution: "verify" },
];

const ANALYSIS_MAX_EXTRA: AnalysisPassSkeleton[] = [
  { pass: 6, lens: "synthesis", execution: "read" },
  { pass: 7, lens: "counter_argument", execution: "read" },
  { pass: 8, lens: "expert_panel", execution: "read" },
  { pass: 9, lens: "actionable_conclusions", execution: "read" },
  { pass: 10, lens: "verify_final", execution: "verify" },
];

const ANALYSIS_MAX_BASE: AnalysisPassSkeleton[] = [
  { pass: 1, lens: "draft", execution: "none" },
  { pass: 2, lens: "gap_analysis", execution: "read" },
  { pass: 3, lens: "first_principles", execution: "read" },
  { pass: 4, lens: "evidence_review", execution: "read" },
  { pass: 5, lens: "deep_evidence_review", execution: "read" },
];

function localizeCreativeSkeleton(
  mode: ThinkingMode,
  skeleton: CreativePassSkeleton[],
  locale: Locale,
): PassFocus[] {
  return skeleton.map((s) => {
    const text = getCreativePassText(locale, mode, s.pass);
    return { ...s, title: text.title, tasks: text.tasks };
  });
}

function localizeAnalysisSkeleton(
  mode: ThinkingMode,
  skeleton: AnalysisPassSkeleton[],
  locale: Locale,
): PassFocus[] {
  return skeleton.map((s) => {
    const text = getAnalysisPassText(locale, mode, s.pass);
    return { ...s, title: text.title, tasks: text.tasks };
  });
}

/** Yaratıcı görevlerde kod review pass'leri gereksiz — görsel odaklı plan */
export function getCreativePassPlan(
  mode: ThinkingMode,
  locale: Locale = "tr",
): PassFocus[] {
  switch (mode) {
    case "easy_thinking":
      return localizeCreativeSkeleton(mode, CREATIVE_EASY, locale);
    case "medium_thinking":
      return localizeCreativeSkeleton(mode, CREATIVE_MEDIUM, locale);
    case "more_thinking":
      return localizeCreativeSkeleton(mode, [...CREATIVE_MEDIUM, ...CREATIVE_MORE_EXTRA], locale);
    case "max_thinking":
      return localizeCreativeSkeleton(mode, [...CREATIVE_MEDIUM, ...CREATIVE_MAX_EXTRA], locale);
  }
}

/** Analiz görevlerinde write pass yok — read/verify ağırlıklı plan */
export function getAnalysisPassPlan(
  mode: ThinkingMode,
  locale: Locale = "tr",
): PassFocus[] {
  switch (mode) {
    case "easy_thinking":
      return localizeAnalysisSkeleton(mode, ANALYSIS_EASY, locale);
    case "medium_thinking":
      return localizeAnalysisSkeleton(mode, ANALYSIS_MEDIUM, locale);
    case "more_thinking":
      return localizeAnalysisSkeleton(mode, [...ANALYSIS_MEDIUM, ...ANALYSIS_MORE_EXTRA], locale);
    case "max_thinking":
      return localizeAnalysisSkeleton(mode, [...ANALYSIS_MAX_BASE, ...ANALYSIS_MAX_EXTRA], locale);
  }
}
