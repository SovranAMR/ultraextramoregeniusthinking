export interface AnswerValidation {
  valid: boolean;
  isMeta: boolean;
  reasons: string[];
}

const META_STARTERS = [
  /^plan:/i,
  /^read:/i,
  /^kod review:/i,
  /^derin review:/i,
  /^ilk prensipler:/i,
  /^uygulandı:/i,
  /^doğrulama:/i,
  /^karşı argüman:/i,
  /^uzman paneli/i,
  /^yapı:/i,
];

const META_PHRASES = [
  /düzeltme planı:/i,
  /eksikler tespit:/i,
  /sessizce/i,
  /think_next çağır/i,
  /pass \d+ tamamlandı/i,
];

/** Agent'ın think_next'e gönderdiği meta log mu, gerçek teslim özeti mi? */
export function validatePassAnswer(
  answer: string,
  passNumber: number,
  execution: string,
): AnswerValidation {
  const trimmed = answer.trim();
  const reasons: string[] = [];

  let tooShort = false;
  if (trimmed.length < 40 && !(passNumber === 1 && execution === "none")) {
    tooShort = true;
    reasons.push("Cevap çok kısa — somut değişiklik veya teslim özeti yok.");
  }

  for (const re of META_STARTERS) {
    if (re.test(trimmed)) {
      reasons.push(`Meta log formatı tespit edildi (${re.source}).`);
      break;
    }
  }

  let metaPhraseHits = 0;
  for (const re of META_PHRASES) {
    if (re.test(trimmed)) metaPhraseHits++;
  }
  if (metaPhraseHits >= 2) {
    reasons.push("Birden fazla meta ifade — iş logu gibi görünüyor.");
  }

  // Write/verify pass'lerde dosya yolu veya somut çıktı beklenir
  let artifactMissing = false;
  if (execution === "write" || execution === "verify") {
    const hasArtifact =
      /\.(html|ts|tsx|js|py|css|json|md)\b/i.test(trimmed) ||
      /dosya|file|oluşturuldu|güncellendi|satır/i.test(trimmed);
    if (!hasArtifact) {
      artifactMissing = true;
      reasons.push("Write/verify pass'te dosya/artifact referansı yok.");
    }
  }

  const isMeta =
    reasons.some((r) => r.includes("Meta log")) ||
    (reasons.length >= 2 && trimmed.length < 200);

  return {
    valid:
      reasons.length === 0 ||
      (!isMeta && !artifactMissing && !tooShort && reasons.length <= 1),
    isMeta,
    reasons,
  };
}

export const SUBMIT_ANSWER_RULE = [
  "**think_next answer formatı (kesin):**",
  "- İş logu YASAK: 'Plan:', 'Read:', 'Kod review:', 'İlk prensipler:' ile BAŞLAMA.",
  "- Bu pass'te NE YAPILDI + NE DEĞİŞTİ + hangi dosya — somut özet.",
  "- Örnek: 'test/foo.html oluşturuldu (320 satır). 3 katman SVG train, 58 ocellus eklendi.'",
  "- Önce pass işini bitir (Read/Write/Shell), SONRA think_next çağır.",
  "- Aynı anda birden fazla think_next YASAK — her pass arasında gerçek iş yap.",
  "- ultra-thinking aktifken başka MCP (forge, inspect) ÇAĞIRMA.",
].join("\n");

export function buildMetaRejectionMessage(
  validation: AnswerValidation,
  passNumber: number,
): string {
  return [
    `# RED — Pass ${passNumber} cevabı kabul edilmedi`,
    ``,
    `Gönderdiğin metin **iş logu/meta** gibi görünüyor, teslim özeti değil.`,
    ``,
    `Sorunlar:`,
    ...validation.reasons.map((r) => `- ${r}`),
    ``,
    SUBMIT_ANSWER_RULE,
    ``,
    `**Şimdi:** Bu pass'in işini yap (gerekirse Read/Write/Shell), sonra think_next'i **somut özet** ile tekrar çağır.`,
  ].join("\n");
}
