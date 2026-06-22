import type { ThinkingMode } from "./modes.js";
import type { PassFocus, ExecutionKind } from "./pass-focus.js";
import type { Locale } from "./locale/index.js";
import { getCreativePassText } from "./locale/creative-plans.js";

export type TaskKind = "creative" | "code" | "analysis";

const CREATIVE_RE =
  /\b(çiz|çizim|illüstrasyon|svg|html yap|landing|tavus|kuş|görsel|ui|tasarım|draw|illustrat|paint|render)\b/i;

const CODE_RE =
  /\b(kod|refactor|bug|fix|api|typescript|javascript|python|fonksiyon|class|migrate|implement|dosya oluştur|yaz ve düzelt)\b/i;

/** Görsel görevde yanlışlıkla code planına düşüren zayıf sinyaller (dosya oluştur, implement vb.) */
const STRONG_CODE_RE =
  /\b(kod|refactor|bug|fix|api|typescript|javascript|python|fonksiyon|class|migrate)\b/i;

export function detectTaskKind(question: string): TaskKind {
  const q = question.toLowerCase();
  if (CREATIVE_RE.test(q) && !STRONG_CODE_RE.test(q)) return "creative";
  if (CODE_RE.test(q)) return "code";
  return "analysis";
}

interface CreativePassSkeleton {
  pass: number;
  lens: string;
  execution: ExecutionKind;
}

const CREATIVE_EASY: CreativePassSkeleton[] = [
  { pass: 1, lens: "draft", execution: "write" },
  { pass: 2, lens: "detail", execution: "read" },
  { pass: 3, lens: "polish", execution: "verify" },
];

const CREATIVE_MEDIUM: CreativePassSkeleton[] = [
  { pass: 1, lens: "draft", execution: "write" },
  { pass: 2, lens: "gap_analysis", execution: "read" },
  { pass: 3, lens: "detail", execution: "write" },
  { pass: 4, lens: "internal_critique", execution: "read" },
  { pass: 5, lens: "verify_final", execution: "verify" },
];

const CREATIVE_MORE_EXTRA: CreativePassSkeleton[] = [
  { pass: 6, lens: "counter_argument", execution: "read" },
  { pass: 7, lens: "verify_final", execution: "verify" },
];

const CREATIVE_MAX_EXTRA: CreativePassSkeleton[] = [
  { pass: 6, lens: "deep_detail", execution: "write" },
  { pass: 7, lens: "accuracy", execution: "read" },
  { pass: 8, lens: "counter_argument", execution: "write" },
  { pass: 9, lens: "polish", execution: "write" },
  { pass: 10, lens: "verify_final", execution: "verify" },
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
