import type { ThinkingMode } from "./modes.js";
import { getCreativePassPlan, getAnalysisPassPlan, type TaskKind } from "./task-kind.js";
import type { Locale } from "./locale/index.js";
import { getPassText } from "./locale/pass-plans.js";

export type ExecutionKind = "none" | "read" | "write" | "verify";

export interface PassFocus {
  pass: number;
  title: string;
  lens: string;
  execution: ExecutionKind;
  tasks: string[];
}

interface PassSkeleton {
  pass: number;
  lens: string;
  execution: ExecutionKind;
}

const EASY_SKELETON: PassSkeleton[] = [
  { pass: 1, lens: "draft", execution: "none" },
  { pass: 2, lens: "gap_logic", execution: "read" },
  { pass: 3, lens: "verify_final", execution: "verify" },
];

const MEDIUM_SKELETON: PassSkeleton[] = [
  { pass: 1, lens: "draft", execution: "none" },
  { pass: 2, lens: "gap_analysis", execution: "read" },
  { pass: 3, lens: "code_logic_review", execution: "read" },
  { pass: 4, lens: "implement", execution: "write" },
  { pass: 5, lens: "verify_final", execution: "verify" },
];

const MORE_SKELETON: PassSkeleton[] = [
  ...MEDIUM_SKELETON.slice(0, 4),
  { pass: 5, lens: "counter_argument", execution: "read" },
  { pass: 6, lens: "structure_ripple", execution: "write" },
  { pass: 7, lens: "verify_final", execution: "verify" },
];

const MAX_SKELETON: PassSkeleton[] = [
  { pass: 1, lens: "draft", execution: "none" },
  { pass: 2, lens: "gap_analysis", execution: "read" },
  { pass: 3, lens: "first_principles", execution: "read" },
  { pass: 4, lens: "code_logic_review", execution: "read" },
  { pass: 5, lens: "deep_code_review", execution: "read" },
  { pass: 6, lens: "implement", execution: "write" },
  { pass: 7, lens: "counter_argument", execution: "write" },
  { pass: 8, lens: "expert_panel", execution: "read" },
  { pass: 9, lens: "structure_actionable", execution: "write" },
  { pass: 10, lens: "verify_final", execution: "verify" },
];

const PASS_SKELETONS: Record<ThinkingMode, PassSkeleton[]> = {
  easy_thinking: EASY_SKELETON,
  medium_thinking: MEDIUM_SKELETON,
  more_thinking: MORE_SKELETON,
  max_thinking: MAX_SKELETON,
};

function localizeSkeleton(
  mode: ThinkingMode,
  skeleton: PassSkeleton[],
  locale: Locale,
): PassFocus[] {
  return skeleton.map((s) => {
    const text = getPassText(locale, mode, s.pass);
    return { ...s, title: text.title, tasks: text.tasks };
  });
}

export function getPassPlan(
  mode: ThinkingMode,
  taskKind: TaskKind = "code",
  locale: Locale = "tr",
): PassFocus[] {
  if (taskKind === "creative") {
    return getCreativePassPlan(mode, locale);
  }
  if (taskKind === "analysis") {
    return getAnalysisPassPlan(mode, locale);
  }
  return localizeSkeleton(mode, PASS_SKELETONS[mode], locale);
}

export function getPassFocus(
  mode: ThinkingMode,
  passNumber: number,
  taskKind: TaskKind = "code",
  locale: Locale = "tr",
): PassFocus | null {
  const plan = getPassPlan(mode, taskKind, locale);
  return plan.find((p) => p.pass === passNumber) ?? null;
}

export function formatPassRoadmap(
  mode: ThinkingMode,
  taskKind: TaskKind = "code",
  locale: Locale = "tr",
): string {
  const plan = getPassPlan(mode, taskKind, locale);
  return plan
    .map((p) => {
      const exec =
        p.execution === "read"
          ? "📖 read"
          : p.execution === "write"
            ? "✏️ write"
            : p.execution === "verify"
              ? "✓ verify"
              : "💭 think";
      return `  Pass ${p.pass}: **${p.title}** [${exec}] — ${p.tasks[0]}`;
    })
    .join("\n");
}
