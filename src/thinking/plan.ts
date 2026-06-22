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
