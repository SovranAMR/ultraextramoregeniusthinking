import type { ThinkingSession } from "./session.js";
import { THINKING_MODES } from "./modes.js";
import {
  getPassFocus,
  formatPassRoadmap,
  getExecutionHint,
  ANTI_STAGNATION_RULE,
  EXECUTION_LAYER_RULE,
} from "./pass-focus.js";
import { SUBMIT_ANSWER_RULE } from "./answer-guard.js";

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

const OUTPUT_RULE_TR = [
  "**ÇIKTI KURALI (kesin):**",
  "- Sadece iyileştirilmiş cevabı döndür.",
  "- İç review sürecini dökme — sonucu ve dosya değişikliklerini göster.",
  "- 'Pass 3'te şunu düzelttim' gibi meta yasak.",
].join("\n");

function modeLabel(session: ThinkingSession): string {
  return THINKING_MODES[session.mode]?.buttonLabel ?? session.mode;
}

function contextBlock(session: ThinkingSession): string[] {
  if (!session.conversationContext?.trim()) return [];
  return [``, `## Chat bağlamı`, session.conversationContext.trim()];
}

function passFocusBlock(
  mode: ThinkingSession["mode"],
  passNumber: number,
  taskKind: ThinkingSession["taskKind"],
): string[] {
  const focus = getPassFocus(mode, passNumber, taskKind);
  if (!focus) return [];

  return [
    `## Bu pass'in odağı: ${focus.title}`,
    ``,
    getExecutionHint(focus.execution),
    ``,
    ...focus.tasks.map((t) => `- ${t}`),
    ``,
    ANTI_STAGNATION_RULE,
  ];
}

export function buildStartDirective(session: ThinkingSession): string {
  const total = session.totalPasses;
  const cfg = THINKING_MODES[session.mode];
  const focus = getPassFocus(session.mode, 1, session.taskKind);

  const taskKindNote =
    session.taskKind === "creative"
      ? "**Görev tipi:** yaratıcı/görsel — kod review pass'leri atlandı, görsel detay odaklı plan."
      : session.taskKind === "analysis"
        ? "**Görev tipi:** analiz — read/verify ağırlıklı."
        : "**Görev tipi:** kod — read/write/verify döngüsü.";

  return [
    `# ${modeLabel(session)} — Pass 1/${total}: ${focus?.title ?? "İlk Taslak"}`,
    ``,
    `**Konu:** ${session.question}`,
    `**Mod:** ${cfg.description}`,
    taskKindNote,
    ...contextBlock(session),
    ``,
    EXECUTION_LAYER_RULE,
    ``,
    `## Pass yol haritası`,
    formatPassRoadmap(session.mode, session.taskKind),
    ``,
    ...passFocusBlock(session.mode, 1, session.taskKind),
    ``,
    SUBMIT_ANSWER_RULE,
    ``,
    OUTPUT_RULE_TR,
    ``,
    `## Akış`,
    `1. Bu pass'i tamamla (gerekirse agent Read/Write kullan)`,
    `2. Somut özet → \`think_next\` (session_id: "${session.id}") — meta log YASAK`,
    `3. ${total} pass bitene kadar devam — pass'leri toplu/paralel gönderme`,
    ``,
    `Şimdi Pass 1'i uygula.`,
  ].join("\n");
}

export function buildRefinementDirective(session: ThinkingSession): string {
  const submittedPass = session.currentRound;
  const nextPass = session.currentRound + 1;
  const total = session.totalPasses;
  const lastAnswer = session.rounds[session.rounds.length - 1]?.answer ?? "";
  const remaining = total - submittedPass;
  const focus = getPassFocus(session.mode, nextPass, session.taskKind);

  return [
    `# ${modeLabel(session)} — Pass ${nextPass}/${total}: ${focus?.title ?? "İyileştirme"}`,
    ``,
    `**Konu:** ${session.question}`,
    ...contextBlock(session),
    ``,
    `## Pass ${submittedPass} özeti`,
    lastAnswer,
    ``,
    `---`,
    ``,
    ...passFocusBlock(session.mode, nextPass, session.taskKind),
    ``,
    SUBMIT_ANSWER_RULE,
    ``,
    OUTPUT_RULE_TR,
    ``,
    `## Sonraki adım`,
    remaining > 0
      ? `Önce Pass ${nextPass} işini yap (Read/Write/Shell), sonra \`think_next\`. Kalan: **${remaining}**. Paralel think_next YASAK.`
      : `Son pass — işi bitir → \`think_next\` çağır.`,
  ].join("\n");
}

export function buildCompletionDirective(session: ThinkingSession): string {
  const finalAnswer = session.rounds[session.rounds.length - 1]?.answer ?? "";

  return [
    `# ${modeLabel(session)} — TAMAMLANDI`,
    ``,
    `${session.totalPasses} pass tamamlandı. Kullanıcıya **sadece** final cevabı sun.`,
    ``,
    `## Kurallar`,
    `- Pass geçmişi, review süreci, MCP meta gösterme.`,
    `- Kod göreviyse: değişen/oluşan dosyaları final cevapta listele.`,
    `- Sadece temiz final cevap.`,
    ``,
    `## KULLANICIYA SUNULACAK CEVAP`,
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
