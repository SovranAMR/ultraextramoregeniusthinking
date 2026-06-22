import { randomUUID } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import { join, resolve } from "node:path";
import { homedir } from "node:os";
import type { ThinkingMode } from "./modes.js";
import { resolveMode } from "./modes.js";
import type { TaskKind } from "./task-kind.js";
import { detectTaskKind } from "./task-kind.js";
import { resolveServerLocale, type Locale } from "./locale/index.js";

export interface ThinkingRound {
  round: number;
  answer: string;
  submittedAt: string;
}

export interface ThinkingSession {
  id: string;
  question: string;
  conversationContext?: string;
  taskKind: TaskKind;
  mode: ThinkingMode;
  totalPasses: number;
  currentRound: number;
  rounds: ThinkingRound[];
  language: Locale;
  createdAt: string;
  updatedAt: string;
  completed: boolean;
  /** Orkestrasyon: plan adım oturumu */
  planId?: string;
  planStep?: number;
}

function resolveSessionDir(): string {
  const root = process.env.ULTRA_THINKING_ROOT?.trim();
  if (root) return join(resolve(root), "sessions");
  return join(homedir(), ".ultra-thinking", "sessions");
}

function ensureSessionDir(): void {
  mkdirSync(resolveSessionDir(), { recursive: true });
}

function sessionPath(id: string): string {
  return join(resolveSessionDir(), `${id}.json`);
}

export function createSession(
  question: string,
  mode: ThinkingMode,
  language: Locale = "tr",
  conversationContext?: string,
): ThinkingSession {
  ensureSessionDir();
  const config = resolveMode(mode);
  const now = new Date().toISOString();
  const session: ThinkingSession = {
    id: randomUUID(),
    question,
    conversationContext,
    taskKind: detectTaskKind(question),
    mode: config.mode,
    totalPasses: config.totalPasses,
    currentRound: 0,
    rounds: [],
    language,
    createdAt: now,
    updatedAt: now,
    completed: false,
  };
  writeFileSync(sessionPath(session.id), JSON.stringify(session, null, 2), "utf8");
  return session;
}

export function loadSession(id: string): ThinkingSession | null {
  const path = sessionPath(id);
  if (!existsSync(path)) return null;
  try {
    const raw = JSON.parse(readFileSync(path, "utf8")) as ThinkingSession & {
      totalRounds?: number;
    };
    if (!raw.totalPasses && raw.totalRounds) {
      raw.totalPasses = raw.totalRounds;
    }
    if (!raw.taskKind) {
      raw.taskKind = detectTaskKind(raw.question);
    }
    return raw;
  } catch {
    return null;
  }
}

export function saveSession(session: ThinkingSession): void {
  ensureSessionDir();
  session.updatedAt = new Date().toISOString();
  writeFileSync(sessionPath(session.id), JSON.stringify(session, null, 2), "utf8");
}

export function submitAnswer(session: ThinkingSession, answer: string): ThinkingSession {
  const nextRound = session.currentRound + 1;
  session.rounds.push({
    round: nextRound,
    answer: answer.trim(),
    submittedAt: new Date().toISOString(),
  });
  session.currentRound = nextRound;
  if (session.currentRound >= session.totalPasses) {
    session.completed = true;
  }
  saveSession(session);
  return session;
}

export function getSessionDir(): string {
  return resolveSessionDir();
}

/** MCP server instructions locale: session.language öncelikli, yoksa question detect. */
export function resolveSessionInstructionsLocale(
  session?: Pick<ThinkingSession, "language" | "question">,
  question?: string,
): Locale {
  return resolveServerLocale({
    sessionLanguage: session?.language,
    question: question ?? session?.question,
  });
}
