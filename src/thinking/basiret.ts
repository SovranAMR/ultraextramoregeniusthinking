import type { ExecutionKind, PassFocus } from "./pass-focus.js";
import type { TaskKind } from "./task-kind.js";

/** Tüm görevler — düz tek tur kıyas; görselde kötüyse kodda da aynı motor şişirir */
export const OUTCOME_BASELINE_RULE = [
  "**Sonuç basireti (kesin — tüm görevler):**",
  "- Sor: *Düz tek tur aynı brief ile daha temiz sonuç verir miydi?*",
  "- Düz daha iyiyse → sil/sadeleştir (ekleme yapma).",
  "- Eksik/hatalıysa → düzelt veya genişlet. Aynı kaliteyse → gereksiz diff yapma.",
  "- Satır/katman sayısı artışı = iyileştirme DEĞİL.",
].join("\n");

export const OUTCOME_BASELINE_EN = [
  "**Outcome judgment (mandatory — all tasks):**",
  "- Ask: *Would one plain pass on the same brief be cleaner?*",
  "- If plain wins → simplify/remove (do not add).",
  "- If missing/wrong → fix or extend. Same quality → no pointless diff.",
  "- More lines/layers is NOT improvement.",
].join("\n");

export const CODE_BASIRET_RULE = [
  "**Basiret (kod):** Pass sonrası diff + davranış.",
  "- Test/build geçse bile şişkin abstraction veya gereksiz dosya → sadeleştir.",
  "- Scope creep → azalt.",
].join("\n");

export const VERIFY_BEFORE_NEXT = [
  "**Verify-before-next (kesin):** Shell ile test/build çalıştır; çıktıyı özetle, sonra think_next.",
  "Sadece 'test geçti/build ok' yeterli değil — kaç test, hangi dosya, ne doğrulandı yaz.",
].join("\n");

export const READ_BEFORE_NEXT = [
  "**Read-before-next:** Etkilenen dosyaları Read/Grep ile oku; diske bakmadan think_next çağırma.",
].join("\n");

export const CREATIVE_OUTCOME_RULE = [
  "**Basiret (görsel):** Çıktıyı tarayıcıda aç veya Read ile incele — kod hayali yetmez.",
  "- Eksik anatomi/kompozisyon → düzelt. Dekor/filter/katman şişmesi → sil.",
  "- Plain tek tur daha temiz görünüyorsa → dürüstçe sadeleştir.",
].join("\n");

export const CREATIVE_VERIFY_RULE = [
  "**Görsel doğrulama:** HTML/SVG ise browser_snapshot veya Read ile sonucu GÖR.",
  "Syntax kontrolü tek başına yetmez. Plain kıyas notunu think_next'e yaz.",
].join("\n");

/** Analiz verify — shell test/build yerine kanıt/iddia çapraz doğrulama */
export const ANALYSIS_VERIFY_RULE = [
  "**Verify-before-next (analiz):** İddiaları kanıt, kaynak ve karşı argümanlarla son kez çapraz doğrula.",
  "Shell test/build yerine — hangi iddia doğrulandı, hangi kanıt veya çelişki bulundu yaz, sonra think_next.",
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
  "outcome_judgment",
  "plain_baseline",
  "apply_judgment",
  "trim_polish",
]);

export function getBasiretHint(
  taskKind: TaskKind,
  execution: ExecutionKind,
  locale: "tr" | "en" | "de" | "ar" = "tr",
): string {
  const base = locale === "en" ? OUTCOME_BASELINE_EN : OUTCOME_BASELINE_RULE;

  if (taskKind === "creative") {
    if (execution === "verify") {
      return `${base}\n${CREATIVE_OUTCOME_RULE}\n${CREATIVE_VERIFY_RULE}`;
    }
    return `${base}\n${CREATIVE_OUTCOME_RULE}`;
  }

  if (taskKind === "analysis" && execution === "verify") {
    return `${base}\n${ANALYSIS_VERIFY_RULE}`;
  }

  if (execution === "verify") {
    return `${base}\n${CODE_BASIRET_RULE}\n${VERIFY_BEFORE_NEXT}`;
  }
  if (execution === "read") {
    return `${base}\n${CODE_BASIRET_RULE}\n${READ_BEFORE_NEXT}`;
  }
  if (execution === "write") {
    return [
      base,
      CODE_BASIRET_RULE,
      "**Write basiret:** Diff gerekli mi? Düz mod yeter miydi? Gereksizse sil.",
    ].join("\n");
  }
  return `${base}\n${CODE_BASIRET_RULE}`;
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
