import type { ThinkingMode } from "./modes.js";
import { resolveMode } from "./modes.js";
import type { Locale } from "./locale/index.js";
import { detectLocale } from "./locale/index.js";
import { loadPlan, savePlan, type Plan, type PlanStep } from "./plan.js";
import { createSession, saveSession, submitAnswer, type ThinkingSession } from "./session.js";

const FILE_REF_PATTERN =
  /\b(?:[\w.-]+\/)+[\w.-]+\.(?:ts|tsx|js|jsx|mjs|py|go|rs|json|yaml|yml|md|css|html)\b/gi;

function extractFileRefs(...texts: string[]): string[] {
  const files = new Set<string>();
  for (const text of texts) {
    for (const match of text.matchAll(FILE_REF_PATTERN)) {
      files.add(match[0]);
    }
  }
  return [...files];
}

/** F3: adım oturumu final cevabından karar özeti üretir */
export function buildStepSummary(session: ThinkingSession): string {
  const finalAnswer = session.rounds.at(-1)?.answer.trim() ?? "";
  if (!finalAnswer) return "Tamamlandı — karar özeti yok.";

  if (/seçilen\s*:/i.test(finalAnswer) || /reddedilen\s*:/i.test(finalAnswer)) {
    return finalAnswer;
  }

  const fileRefs = extractFileRefs(...session.rounds.map((r) => r.answer));
  const parts = [`Seçilen: ${finalAnswer}`];
  if (fileRefs.length > 0) {
    parts.push(`Etkilenen: ${fileRefs.join(", ")}`);
  }
  return parts.join(". ");
}

/** F3: tamamlanan adım oturumunun karar özetini plana yazar */
export function completePlanStep(
  session: ThinkingSession,
): { plan: Plan; step: PlanStep } | null {
  if (!session.planId || !session.planStep || !session.completed) return null;

  const plan = loadPlan(session.planId);
  if (!plan) return null;

  const step = plan.steps.find((s) => s.step === session.planStep);
  if (!step) return null;

  step.summary = buildStepSummary(session);
  step.status = "completed";
  savePlan(plan);

  return { plan, step };
}

export type StepSessionError = "plan_not_found" | "step_not_found";

export interface StepSessionResult {
  session: ThinkingSession;
  plan: Plan;
  step: PlanStep;
}

export function buildStepQuestion(plan: Plan, step: PlanStep): string {
  return [
    `${plan.title} — Adım ${step.step}/${plan.steps.length}: ${step.title}`,
    ``,
    step.purpose,
    ``,
    `Bu plan adımını derin düşünme ile tasarla: mimari, edge case, trade-off ve uygulanabilir karar.`,
  ].join("\n");
}

export function buildPriorStepContext(plan: Plan, stepNumber: number): string {
  const prior = plan.steps.filter((s) => s.step < stepNumber);
  if (prior.length === 0) return "";

  const lines = [
    `## Plan bağlamı`,
    `Plan: ${plan.title}`,
    `Toplam adım: ${plan.steps.length}`,
    `Şu anki adım: ${stepNumber}`,
    ``,
    `## Önceki adım kararları`,
  ];

  for (const s of prior) {
    lines.push(`### Adım ${s.step}: ${s.title} (${s.status})`);
    if (s.summary?.trim()) {
      lines.push(s.summary.trim());
    } else if (s.status === "completed") {
      lines.push(`Tamamlandı — karar özeti henüz kaydedilmedi. Amaç: ${s.purpose}`);
    } else {
      lines.push(`Amaç: ${s.purpose}`);
    }
    lines.push(``);
  }

  return lines.join("\n").trim();
}

export function createStepSession(
  planId: string,
  stepNumber: number,
  mode: ThinkingMode | string,
  language?: Locale,
): StepSessionResult | { error: StepSessionError } {
  const plan = loadPlan(planId);
  if (!plan) return { error: "plan_not_found" };

  const step = plan.steps.find((s) => s.step === stepNumber);
  if (!step) return { error: "step_not_found" };

  const cfg = resolveMode(mode);
  const question = buildStepQuestion(plan, step);
  const priorContext = buildPriorStepContext(plan, stepNumber);
  const lang = language ?? detectLocale(question);

  const session = createSession(question, cfg.mode, lang, priorContext || undefined);
  session.planId = planId;
  session.planStep = stepNumber;
  saveSession(session);

  step.status = "in_progress";
  savePlan(plan);

  return { session, plan, step };
}
