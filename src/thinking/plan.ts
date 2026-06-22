import { randomUUID } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import { join, resolve } from "node:path";
import { homedir } from "node:os";
import type { Locale } from "./locale/index.js";

/** Tek adım girdisi — başlık + kısa amaç. */
export interface PlanStepInput {
  title: string;
  purpose: string;
}

export type PlanStepStatus = "pending" | "in_progress" | "completed";

/** Plandaki tek adım — numaralı, amaçlı. */
export interface PlanStep {
  stepNumber: number;
  title: string;
  purpose: string;
  status: PlanStepStatus;
}

/**
 * Büyük iş orkestrasyon planı — tek soru oturumundan (ThinkingSession) ayrı.
 * Diske `plans/` altında kalıcı; F2+ adım oturumları bu id ile bağlanır.
 */
export interface WorkPlan {
  id: string;
  title: string;
  steps: PlanStep[];
  language: Locale;
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

function normalizeStepInputs(steps: PlanStepInput[]): PlanStep[] {
  if (steps.length === 0) {
    throw new Error("Plan en az bir adım içermeli.");
  }
  return steps.map((s, i) => {
    const title = s.title.trim();
    const purpose = s.purpose.trim();
    if (!title) throw new Error(`Adım ${i + 1}: başlık gerekli.`);
    if (!purpose) throw new Error(`Adım ${i + 1}: amaç gerekli.`);
    return {
      stepNumber: i + 1,
      title,
      purpose,
      status: "pending" as const,
    };
  });
}

/** Plan oluştur, diske yaz, id döndür. */
export function createPlan(
  title: string,
  steps: PlanStepInput[],
  language: Locale = "tr",
): WorkPlan {
  const trimmedTitle = title.trim();
  if (!trimmedTitle) {
    throw new Error("Plan başlığı gerekli.");
  }

  ensurePlanDir();
  const now = new Date().toISOString();
  const plan: WorkPlan = {
    id: randomUUID(),
    title: trimmedTitle,
    steps: normalizeStepInputs(steps),
    language,
    createdAt: now,
    updatedAt: now,
  };
  writeFileSync(planPath(plan.id), JSON.stringify(plan, null, 2), "utf8");
  return plan;
}

export function loadPlan(id: string): WorkPlan | null {
  const path = planPath(id);
  if (!existsSync(path)) return null;
  try {
    return JSON.parse(readFileSync(path, "utf8")) as WorkPlan;
  } catch {
    return null;
  }
}

export function savePlan(plan: WorkPlan): void {
  ensurePlanDir();
  plan.updatedAt = new Date().toISOString();
  writeFileSync(planPath(plan.id), JSON.stringify(plan, null, 2), "utf8");
}

export function getPlanDir(): string {
  return resolvePlanDir();
}
