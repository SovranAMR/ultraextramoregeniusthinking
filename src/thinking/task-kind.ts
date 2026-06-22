import type { ThinkingMode } from "./modes.js";
import type { PassFocus } from "./pass-focus.js";

export type TaskKind = "creative" | "code" | "analysis";

const CREATIVE_RE =
  /\b(çiz|çizim|illüstrasyon|svg|html yap|landing|tavus|kuş|görsel|ui|tasarım|draw|illustrat|paint|render)\b/i;

const CODE_RE =
  /\b(kod|refactor|bug|fix|api|typescript|javascript|python|fonksiyon|class|migrate|implement|dosya oluştur|yaz ve düzelt)\b/i;

/** Görsel görevde yanlışlıkla code planına düşüren zayıf sinyaller (dosya oluştur, implement vb.) */
const STRONG_CODE_RE =
  /\b(kod|refactor|bug|fix|api|typescript|javascript|python|fonksiyon|class|migrate)\b/i;

export function detectTaskKind(question: string): TaskKind {
  const q = question.toLowerCase();
  if (CREATIVE_RE.test(q) && !STRONG_CODE_RE.test(q)) return "creative";
  if (CODE_RE.test(q)) return "code";
  return "analysis";
}

/** Yaratıcı görevlerde kod review pass'leri gereksiz — görsel odaklı plan */
export function getCreativePassPlan(mode: ThinkingMode): PassFocus[] {
  const plans: Record<ThinkingMode, PassFocus[]> = {
    easy_thinking: [
      {
        pass: 1,
        title: "İlk Taslak",
        lens: "draft",
        execution: "write",
        tasks: [
          "İlk versiyonu Write ile oluştur — çalışan iskelet.",
          "Görsel/kompozisyon hedefini netleştir.",
        ],
      },
      {
        pass: 2,
        title: "Detay & Derinlik",
        lens: "detail",
        execution: "read",
        tasks: [
          "Read ile dosyayı aç — eksik detayları bul.",
          "StrReplace ile görsel detayları artır (katman, renk, anatomi).",
        ],
      },
      {
        pass: 3,
        title: "Cilalama & Final",
        lens: "polish",
        execution: "verify",
        tasks: [
          "Son rötuşlar, gereksiz kod temizliği.",
          "Tarayıcıda açılabilir mi kontrol et. Final özeti + dosya yolu.",
        ],
      },
    ],
    medium_thinking: [
      {
        pass: 1,
        title: "İlk Taslak",
        lens: "draft",
        execution: "write",
        tasks: ["Write ile ilk dosyayı oluştur.", "Temel kompozisyon ve yapı."],
      },
      {
        pass: 2,
        title: "Referans & Eksik",
        lens: "gap_analysis",
        execution: "read",
        tasks: [
          "Read ile mevcut çıktıyı incele.",
          "Anatomi/kompozisyon eksiklerini listele (sessizce), koda yansıt.",
        ],
      },
      {
        pass: 3,
        title: "Detay Pass",
        lens: "detail",
        execution: "write",
        tasks: [
          "StrReplace ile detay ekle: katmanlar, gradient, texture, animasyon.",
          "Önceki pass'ten EN AZ 3 somut görsel iyileştirme.",
        ],
      },
      {
        pass: 4,
        title: "İç Kontrol",
        lens: "internal_critique",
        execution: "read",
        tasks: [
          "Read ile tekrar oku — zayıf bölgeleri güçlendir.",
          "Write ile düzelt. Sadakat: kullanıcı ne istedi?",
        ],
      },
      {
        pass: 5,
        title: "Final & Doğrula",
        lens: "verify_final",
        execution: "verify",
        tasks: [
          "Shell/node ile dosya var mı, syntax bozuk mu kontrol et.",
          "Final teslim: dosya yolu + ne eklendi özeti.",
        ],
      },
    ],
    more_thinking: [
      ...([] as PassFocus[]),
    ],
    max_thinking: [
      ...([] as PassFocus[]),
    ],
  };

  // more = medium + 2, max = medium + 5 creative passes
  const medium = plans.medium_thinking;
  plans.more_thinking = [
    ...medium,
    {
      pass: 6,
      title: "Karşılaştırma & Alternatif",
      lens: "counter_argument",
      execution: "read",
      tasks: [
        "Başka yaklaşım (canvas vs SVG vs CSS) steel-man.",
        "Mevcut seçimin zayıf noktalarını Read+Write ile düzelt.",
      ],
    },
    {
      pass: 7,
      title: "Final Sentez",
      lens: "verify_final",
      execution: "verify",
      tasks: ["En iyi detayları birleştir.", "Final + dosya özeti."],
    },
  ];

  plans.max_thinking = [
    ...medium,
    {
      pass: 6,
      title: "Derin Detay",
      lens: "deep_detail",
      execution: "write",
      tasks: ["Procedural/katmanlı detay ekle.", "Renk varyasyonu, texture."],
    },
    {
      pass: 7,
      title: "Anatomi/Doğruluk",
      lens: "accuracy",
      execution: "read",
      tasks: ["Referans doğruluğu kontrol.", "Read+Write ile düzelt."],
    },
    {
      pass: 8,
      title: "Karşı Argüman",
      lens: "counter_argument",
      execution: "write",
      tasks: ["Alternatif teknikleri değerlendir.", "En iyi seçimi uygula."],
    },
    {
      pass: 9,
      title: "Cilalama",
      lens: "polish",
      execution: "write",
      tasks: ["Performans, erişilebilirlik, responsive.", "Son rötuşlar."],
    },
    {
      pass: 10,
      title: "Doğrulama & Final",
      lens: "verify_final",
      execution: "verify",
      tasks: [
        "Smoke test çalıştır.",
        "KULLANICIYA GİDECEK ÖZET: dosya, satır sayısı, öne çıkan detaylar.",
      ],
    },
  ];

  return plans[mode];
}
