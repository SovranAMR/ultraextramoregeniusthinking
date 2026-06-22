import { randomUUID } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import { join, resolve } from "node:path";
import { homedir } from "node:os";

export type PlanStepStatus = "pending" | "in_progress" | "completed";

export interface PlanStepInput {
  title: string;
  purpose: string;
}

export interface PlanStep {
  step: number;
  title: string;
  purpose: string;
  status: PlanStepStatus;
  /** F3: adım tamamlanınca karar özeti; F2 bağlamında önceki adımlar için okunur */
  summary?: string;
}

export interface Plan {
  id: string;
  title: string;
  steps: PlanStep[];
  createdAt: string;
  updatedAt: string;
}

function resolvePlanDir(): string {
  const root = process.env.ULTRA_THINKING_ROOT?.trim();
  if (root) return join(resolve(root), "plans");
  return join(homedir(), ".ultra-thinking", "plans");
}

function ensurePlanDir(): void {
  mkdirSync(resolvePlanDir(), { recursive: true });
}

function planPath(id: string): string {
  return join(resolvePlanDir(), `${id}.json`);
}

export function getPlanDir(): string {
  return resolvePlanDir();
}

export function createPlan(title: string, stepInputs: PlanStepInput[]): Plan {
  ensurePlanDir();
  const now = new Date().toISOString();
  const plan: Plan = {
    id: randomUUID(),
    title: title.trim(),
    steps: stepInputs.map((input, index) => ({
      step: index + 1,
      title: input.title.trim(),
      purpose: input.purpose.trim(),
      status: "pending" as const,
    })),
    createdAt: now,
    updatedAt: now,
  };
  writeFileSync(planPath(plan.id), JSON.stringify(plan, null, 2), "utf8");
  return plan;
}

export function loadPlan(id: string): Plan | null {
  const path = planPath(id);
  if (!existsSync(path)) return null;
  try {
    return JSON.parse(readFileSync(path, "utf8")) as Plan;
  } catch {
    return null;
  }
}

export function savePlan(plan: Plan): void {
  ensurePlanDir();
  plan.updatedAt = new Date().toISOString();
  writeFileSync(planPath(plan.id), JSON.stringify(plan, null, 2), "utf8");
}

export interface PlanProgressSnapshot {
  totalSteps: number;
  completedCount: number;
  completedSteps: Array<{ step: number; title: string }>;
  inProgressStep: { step: number; title: string } | null;
  nextStep: { step: number; title: string; purpose: string } | null;
  allComplete: boolean;
}

/** F4: hangi adım bitti, sırada ne — yapısal ilerleme özeti */
export function getPlanProgress(plan: Plan): PlanProgressSnapshot {
  const completed = plan.steps.filter((s) => s.status === "completed");
  const inProgress = plan.steps.find((s) => s.status === "in_progress");
  const nextPending = plan.steps.find((s) => s.status === "pending");
  const allComplete = plan.steps.length > 0 && completed.length === plan.steps.length;

  let nextStep: PlanProgressSnapshot["nextStep"] = null;
  if (!allComplete) {
    if (inProgress) {
      nextStep = {
        step: inProgress.step,
        title: inProgress.title,
        purpose: inProgress.purpose,
      };
    } else if (nextPending) {
      nextStep = {
        step: nextPending.step,
        title: nextPending.title,
        purpose: nextPending.purpose,
      };
    }
  }

  return {
    totalSteps: plan.steps.length,
    completedCount: completed.length,
    completedSteps: completed.map((s) => ({ step: s.step, title: s.title })),
    inProgressStep: inProgress
      ? { step: inProgress.step, title: inProgress.title }
      : null,
    nextStep,
    allComplete,
  };
}

/** F4: insan okunur plan ilerlemesi — tamamlanan, devam eden, sıradaki adım */
export function formatPlanProgress(plan: Plan): string {
  const progress = getPlanProgress(plan);
  const lines: string[] = [];

  if (progress.allComplete) {
    lines.push(`Plan tamamlandı (${progress.completedCount}/${progress.totalSteps})`);
  } else {
    lines.push(`Plan ilerlemesi (${progress.completedCount}/${progress.totalSteps})`);
  }

  for (const step of plan.steps) {
    if (step.status === "completed") {
      lines.push(`✓ Adım ${step.step}: ${step.title}`);
    } else if (step.status === "in_progress") {
      lines.push(`▶ Adım ${step.step}: ${step.title} (devam ediyor)`);
    } else {
      lines.push(`○ Adım ${step.step}: ${step.title}`);
    }
  }

  if (progress.allComplete) {
    lines.push("", "Tüm adımlar tamamlandı.");
  } else if (progress.inProgressStep) {
    lines.push(
      "",
      `Devam eden: Adım ${progress.inProgressStep.step} — ${progress.inProgressStep.title}`,
    );
    const afterCurrent = plan.steps.find((s) => s.status === "pending");
    if (afterCurrent) {
      lines.push(`Sonra: Adım ${afterCurrent.step} — ${afterCurrent.title}`);
    }
  } else if (progress.nextStep) {
    lines.push("", `Sırada: Adım ${progress.nextStep.step} — ${progress.nextStep.title}`);
    lines.push(`Amaç: ${progress.nextStep.purpose}`);
  }

  return lines.join("\n");
}
