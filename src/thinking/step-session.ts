import type { ThinkingMode } from "./modes.js";
import { resolveMode } from "./modes.js";
import type { Locale } from "./locale/index.js";
import { detectLocale } from "./locale/index.js";
import { loadPlan, savePlan, type Plan, type PlanStep } from "./plan.js";
import { createSession, saveSession, type ThinkingSession } from "./session.js";

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
