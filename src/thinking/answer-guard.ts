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

function isMeaninglessPadding(text: string): boolean {
  const compact = text.replace(/\s/g, "");
  if (compact.length < 40) return false;
  return new Set(compact.toLowerCase()).size <= 5;
}

function hasReadArtifactReference(text: string): boolean {
  return (
    /\.(html|ts|tsx|js|jsx|mjs|py|css|json|md|yaml|yml)\b/i.test(text) ||
    /\/[\w.-]+/i.test(text) ||
    /\b\d+\s*satır\b/i.test(text)
  );
}

function hasWriteVerifyArtifactReference(text: string): boolean {
  return (
    /\.(html|ts|tsx|js|jsx|mjs|py|css|json|md)\b/i.test(text) ||
    /dosya|file|oluşturuldu|güncellendi|satır/i.test(text)
  );
}

/** Dosya adı var ama ne değiştiği yok — düşük kaliteli write/verify özeti */
function hasWriteVerifyChangeDetail(text: string): boolean {
  if (/\d+\s*satır/i.test(text)) return true;
  if (/\d+\s*(test|pass|fail|suite|paket)/i.test(text)) return true;
  if (/\b(build|test).{0,40}(başarı|geçti|ok|success)/i.test(text)) return true;
  if (/\d+\s+\w+.*(eklendi|silindi|düzeltildi|refactor|genişletildi|azaltıldı|çıkarıldı)/i.test(text))
    return true;
  if (/(eklendi|silindi|düzeltildi|refactor|guard|check).*\d+/i.test(text)) return true;
  if (/\([^)]{8,}\)/.test(text)) return true;
  if (/[`'"]?\w+[\`'"]?\s*[:→].{5,}/i.test(text)) return true;
  return false;
}

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

  let padding = false;
  if (isMeaninglessPadding(trimmed)) {
    padding = true;
    reasons.push("Cevap anlamsız tekrar/padding — somut okuma özeti gerekli.");
  }

  // Write/verify pass'lerde dosya yolu + somut değişiklik detayı beklenir
  let artifactMissing = false;
  let changeDetailMissing = false;
  if (execution === "write" || execution === "verify") {
    if (!hasWriteVerifyArtifactReference(trimmed)) {
      artifactMissing = true;
      reasons.push("Write/verify pass'te dosya/artifact referansı yok.");
    } else if (!hasWriteVerifyChangeDetail(trimmed)) {
      changeDetailMissing = true;
      reasons.push("Write/verify pass'te dosya var ama somut değişiklik detayı yok.");
    }
  }

  let readContextMissing = false;
  if (execution === "read" && !hasReadArtifactReference(trimmed)) {
    readContextMissing = true;
    reasons.push("Read pass'te dosya/kaynak referansı yok.");
  }

  const isMeta =
    reasons.some((r) => r.includes("Meta log")) ||
    (reasons.length >= 2 && trimmed.length < 200);

  return {
    valid:
      reasons.length === 0 ||
      (!isMeta &&
        !artifactMissing &&
        !changeDetailMissing &&
        !tooShort &&
        !padding &&
        !readContextMissing &&
        reasons.length <= 1),
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
