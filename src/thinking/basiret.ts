import type { ExecutionKind, PassFocus } from "./pass-focus.js";
import type { TaskKind } from "./task-kind.js";

/** Kod görevlerinde pass sonrası adaptif yargı — sabit tek yön yok */
export const CODE_BASIRET_RULE = [
  "**Basiret (adaptif yargı):** Pass bittikten sonra durup değerlendir.",
  "- Eksik, hata veya edge case → genişlet veya düzelt.",
  "- Gereksiz abstraction veya şişkin diff → sadeleştir.",
  "- Scope creep veya fazla dosya → azalt.",
  "Yön bu pass'in bulgusundan çıkar — önceden 'her zaman ekle' veya 'her zaman çıkar' yok.",
].join("\n");

export const VERIFY_BEFORE_NEXT = [
  "**Verify-before-next (kesin):** Shell ile test/build çalıştır; çıktıyı özetle, sonra think_next.",
  "Sayısız 'test geçti/build ok' yeterli değil — kaç test, hangi dosya, ne doğrulandı yaz.",
].join("\n");

export const READ_BEFORE_NEXT = [
  "**Read-before-next:** Etkilenen dosyaları Read/Grep ile oku; diske bakmadan think_next çağırma.",
].join("\n");

/** Yaratıcı/görsel kenar — kod review basireti uygulanmaz */
export const CREATIVE_BASIRET_RULE = [
  "**Basiret (görsel):** Çıktıyı Read ile aç, gör/oku — detay eksik mi, fazla mı; bulguya göre karar ver.",
].join("\n");

/** Analiz görevlerinde write/shell verify basireti uygulanmaz */
export const ANALYSIS_BASIRET_RULE = [
  "**Basiret (analiz):** Pass bittikten sonra durup değerlendir.",
  "- Argüman boşluğu, zayıf kanıt veya mantık hatası → derinleştir veya düzelt.",
  "- Gereksiz tekrar veya şişkin açıklama → sadeleştir.",
  "- Scope creep veya konu dışı sapma → azalt.",
  "Yön bu pass'in bulgusundan çıkar — geliştir / sadeleştir / azalt.",
].join("\n");

export const ANALYSIS_VERIFY_BEFORE_NEXT = [
  "**Verify-before-next (analiz):** Argüman tutarlılığı, eksik kanıt ve mantık hatasını kontrol et; sonra think_next.",
  "Somut: hangi iddia doğrulandı, hangi zayıflık kaldı, sonraki pass yönü.",
].join("\n");

const EVALUATION_LENSES = new Set([
  "gap_analysis",
  "gap_logic",
  "code_logic_review",
  "deep_code_review",
  "deep_evidence_review",
  "evidence_review",
  "synthesis",
  "counter_argument",
  "expert_panel",
  "internal_critique",
  "actionable_conclusions",
]);

export function getBasiretHint(taskKind: TaskKind, execution: ExecutionKind): string {
  if (taskKind === "creative") {
    return CREATIVE_BASIRET_RULE;
  }
  if (taskKind === "analysis") {
    if (execution === "verify") {
      return `${ANALYSIS_BASIRET_RULE}\n${ANALYSIS_VERIFY_BEFORE_NEXT}`;
    }
    return ANALYSIS_BASIRET_RULE;
  }
  if (execution === "verify") {
    return `${CODE_BASIRET_RULE}\n${VERIFY_BEFORE_NEXT}`;
  }
  if (execution === "read") {
    return `${CODE_BASIRET_RULE}\n${READ_BEFORE_NEXT}`;
  }
  if (execution === "write") {
    return [
      CODE_BASIRET_RULE,
      "**Write basiret:** Diff'i değerlendir — gerekli mi, yoksa sadeleştirilebilir mi?",
    ].join("\n");
  }
  return CODE_BASIRET_RULE;
}

export function isEvaluationPass(focus: PassFocus | null): boolean {
  if (!focus) return false;
  return EVALUATION_LENSES.has(focus.lens);
}

export function planMeetsCodeBasiretRequirements(plan: PassFocus[]): {
  hasVerify: boolean;
  hasEvaluation: boolean;
} {
  return {
    hasVerify: plan.some((p) => p.execution === "verify"),
    hasEvaluation: plan.some((p) => isEvaluationPass(p)),
  };
}

/** Analiz planları da verify + değerlendirme pass'i içermeli */
export const planMeetsAnalysisBasiretRequirements = planMeetsCodeBasiretRequirements;
