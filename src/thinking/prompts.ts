import type { ThinkingSession } from "./session.js";
import { THINKING_MODES } from "./modes.js";
import { getPassFocus, formatPassRoadmap } from "./pass-focus.js";
import {
  getPromptBundle,
  getBasiretHintForLocale,
  type ExecutionKindKey,
} from "./locale/index.js";

export const QUALITY_CHECKLIST_TR = [
  "Önceki cevaptaki eksikleri bul ve kapat.",
  "Mantık hatalarını bul ve düzelt.",
  "Kullanıcının istediği şeye tam sadık mı kontrol et.",
  "Gereksiz uzatma, yuvarlama, boş cümle var mı kontrol et — varsa temizle.",
  "Teknik doğruluk kontrolü yap.",
  "Daha iyi yapı kur.",
  "Daha net, daha direkt, daha uygulanabilir hale getir.",
  "Varsa riskleri, varsayımları, bilinmeyenleri açıkça belirt.",
  "Cevabı bir üst kalite seviyesine çıkar.",
];

function modeLabel(session: ThinkingSession): string {
  return THINKING_MODES[session.mode]?.buttonLabel ?? session.mode;
}

function contextBlock(session: ThinkingSession, chatHeader: string): string[] {
  if (!session.conversationContext?.trim()) return [];
  return [``, chatHeader, session.conversationContext.trim()];
}

function passFocusBlock(
  session: ThinkingSession,
  passNumber: number,
): string[] {
  const p = getPromptBundle(session.language);
  const focus = getPassFocus(session.mode, passNumber, session.taskKind);
  if (!focus) return [];

  const execution = focus.execution as ExecutionKindKey;

  return [
    p.passFocusHeader(focus.title),
    ``,
    p.executionHints[execution],
    ``,
    ...focus.tasks.map((t) => `- ${t}`),
    ``,
    getBasiretHintForLocale(session.language, session.taskKind, execution),
    ``,
    p.antiStagnationRule,
  ];
}

function taskKindNote(session: ThinkingSession): string {
  const p = getPromptBundle(session.language);
  if (session.taskKind === "creative") return p.taskKind.creative;
  if (session.taskKind === "analysis") return p.taskKind.analysis;
  return p.taskKind.code;
}

export function buildStartDirective(session: ThinkingSession): string {
  const p = getPromptBundle(session.language);
  const total = session.totalPasses;
  const cfg = THINKING_MODES[session.mode];
  const focus = getPassFocus(session.mode, 1, session.taskKind);

  return [
    `# ${modeLabel(session)} — Pass 1/${total}: ${focus?.title ?? p.firstDraftTitle}`,
    ``,
    `${p.topicLabel} ${session.question}`,
    `${p.modeLabel} ${cfg.description}`,
    taskKindNote(session),
    ...contextBlock(session, p.chatContextHeader),
    ``,
    p.executionLayerRule,
    ``,
    p.passRoadmapHeader,
    formatPassRoadmap(session.mode, session.taskKind),
    ``,
    ...passFocusBlock(session, 1),
    ``,
    p.submitAnswerRule,
    ``,
    p.outputRule,
    ``,
    p.flowHeader,
    p.flowStep1,
    p.flowStep2(session.id),
    p.flowStep3(total),
    ``,
    p.applyPassNow,
  ].join("\n");
}

export function buildRefinementDirective(session: ThinkingSession): string {
  const p = getPromptBundle(session.language);
  const submittedPass = session.currentRound;
  const nextPass = session.currentRound + 1;
  const total = session.totalPasses;
  const lastAnswer = session.rounds[session.rounds.length - 1]?.answer ?? "";
  const remaining = total - submittedPass;
  const focus = getPassFocus(session.mode, nextPass, session.taskKind);

  return [
    `# ${modeLabel(session)} — Pass ${nextPass}/${total}: ${focus?.title ?? p.refinementTitle}`,
    ``,
    `${p.topicLabel} ${session.question}`,
    ...contextBlock(session, p.chatContextHeader),
    ``,
    p.passSummaryHeader(submittedPass),
    lastAnswer,
    ``,
    `---`,
    ``,
    ...passFocusBlock(session, nextPass),
    ``,
    p.submitAnswerRule,
    ``,
    p.outputRule,
    ``,
    p.nextStepHeader,
    remaining > 0 ? p.nextStepContinue(nextPass, remaining) : p.nextStepFinal,
  ].join("\n");
}

export function buildCompletionDirective(session: ThinkingSession): string {
  const p = getPromptBundle(session.language);
  const finalAnswer = session.rounds[session.rounds.length - 1]?.answer ?? "";

  return [
    `# ${modeLabel(session)} — ${p.completionTitle}`,
    ``,
    p.completionIntro(session.totalPasses),
    ``,
    p.completionRulesHeader,
    ...p.completionRules,
    ``,
    p.finalAnswerHeader,
    ``,
    finalAnswer,
  ].join("\n");
}

export function buildOneClickPrompt(
  question: string,
  mode: ThinkingSession["mode"],
  sessionId: string,
): string {
  const cfg = THINKING_MODES[mode];
  return [
    `${cfg.buttonLabel} ile cevapla.`,
    ``,
    `Soru: ${question}`,
    ``,
    `${cfg.totalPasses} pass — read/write/verify pass'leri agent workspace araçlarıyla.`,
    `session_id: ${sessionId}`,
  ].join("\n");
}
