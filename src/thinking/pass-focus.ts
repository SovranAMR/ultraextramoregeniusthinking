import type { ThinkingMode } from "./modes.js";
import { getCreativePassPlan, type TaskKind } from "./task-kind.js";

export type ExecutionKind = "none" | "read" | "write" | "verify";

export interface PassFocus {
  pass: number;
  title: string;
  lens: string;
  execution: ExecutionKind;
  tasks: string[];
}

/** Agent workspace araçları — MCP'de write/read tool YOK, direktif agent'a gider */
export const EXECUTION_HINTS: Record<ExecutionKind, string> = {
  none: "Bu pass'te dosya değişikliği gerekmez — düşünme/cevap odaklı kal.",
  read: [
    "**Execution (agent):** Read / Grep / SemanticSearch ile gerçek dosyaları oku.",
    "Kodu veya config'i hayal etme — diskten oku, sonra think_next çağır.",
  ].join("\n"),
  write: [
    "**Execution (agent):** Write / StrReplace / Delete ile değişiklikleri uygula.",
    "Mock, placeholder, TODO yasak — gerçek kod/dosya. Sonra think_next çağır.",
  ].join("\n"),
  verify: [
    "**Execution (agent):** Shell ile test/build çalıştır (npm test, tsc, vb.).",
    "Kırık bırakma. Değişen dosyaları final cevapta özetle.",
  ].join("\n"),
};

const EASY_PASSES: PassFocus[] = [
  {
    pass: 1,
    title: "İlk Taslak",
    lens: "draft",
    execution: "none",
    tasks: [
      "Soruya doğrudan, net, uygulanabilir ilk cevap ver.",
      "Kod göreviyse: hangi dosyalar etkilenecek kısaca planla.",
    ],
  },
  {
    pass: 2,
    title: "Eksik & Mantık Kontrolü",
    lens: "gap_logic",
    execution: "read",
    tasks: [
      "İlgili dosyaları Read/Grep ile oku — eksikleri gerçek koda göre bul.",
      "Mantık hatalarını, çelişkileri düzelt.",
      "Kullanıcı isteğine sadık mı kontrol et.",
    ],
  },
  {
    pass: 3,
    title: "Uygulama & Final",
    lens: "implement_final",
    execution: "write",
    tasks: [
      "Görev kod/dosya gerektiriyorsa: Write/StrReplace ile uygula.",
      "Gereksiz uzatmayı temizle, yapıyı netleştir.",
      "Risk/bilinmeyen varsa belirt. Final cevap + yapılan dosya değişiklikleri.",
    ],
  },
];

const MEDIUM_PASSES: PassFocus[] = [
  {
    pass: 1,
    title: "İlk Taslak",
    lens: "draft",
    execution: "none",
    tasks: [
      "İlk cevabı ve temel planı ver.",
      "Kod göreviyse etkilenecek dosyaları listele.",
    ],
  },
  {
    pass: 2,
    title: "Eksik Analizi",
    lens: "gap_analysis",
    execution: "read",
    tasks: [
      "Read/Grep ile codebase'i tara — kullanıcı tam ne istiyor anla.",
      "Atlanan adım, dosya, bağımlılık var mı bul.",
    ],
  },
  {
    pass: 3,
    title: "Kod / Mantık Review",
    lens: "code_logic_review",
    execution: "read",
    tasks: [
      "Read/Grep ile gerçek kodu oku — bug, güvenlik, edge case, performans.",
      "Kod yoksa mantık review: argüman zinciri, çıkarımlar.",
      "Review sonucunu cevaba yansıt (meta değil, düzeltme).",
    ],
  },
  {
    pass: 4,
    title: "Uygulama",
    lens: "implement",
    execution: "write",
    tasks: [
      "Write/StrReplace/Delete ile değişiklikleri uygula.",
      "Yeni dosya oluştur, mevcut dosyayı düzenle veya sil — gerektiği gibi.",
      "Mock/placeholder yasak. Sessiz self-review yap, sonucu koda yansıt.",
    ],
  },
  {
    pass: 5,
    title: "Doğrulama & Final",
    lens: "verify_final",
    execution: "verify",
    tasks: [
      "Shell ile test/build çalıştır — kırık bırakma.",
      "Risk, varsayım, bilinmeyenleri belirt.",
      "Final cevap: net özet + değişen/oluşan dosya listesi.",
    ],
  },
];

const MORE_PASSES: PassFocus[] = [
  ...MEDIUM_PASSES.slice(0, 4),
  {
    pass: 5,
    title: "Karşı Argüman",
    lens: "counter_argument",
    execution: "read",
    tasks: [
      "Steel-man karşı argüman kur.",
      "Read ile mevcut implementasyonu karşı argümanla test et.",
      "Gerekirse Write ile düzelt.",
    ],
  },
  {
    pass: 6,
    title: "Yapı & Etkiler",
    lens: "structure_ripple",
    execution: "write",
    tasks: [
      "Yapıyı optimize et — dosya organizasyonu, okunabilirlik.",
      "İkinci derece etkileri hesapla, gerekirse kodu güncelle.",
      "Edge case'leri koda yansıt.",
    ],
  },
  {
    pass: 7,
    title: "Doğrulama & Final Sentez",
    lens: "verify_final",
    execution: "verify",
    tasks: [
      "Test/build çalıştır.",
      "Tüm pass'lerin en iyi halini birleştir.",
      "Final cevap + dosya değişiklik özeti.",
    ],
  },
];

const MAX_PASSES: PassFocus[] = [
  {
    pass: 1,
    title: "İlk Taslak",
    lens: "draft",
    execution: "none",
    tasks: ["İlk cevap, dosya planı."],
  },
  {
    pass: 2,
    title: "Eksik Analizi",
    lens: "gap_analysis",
    execution: "read",
    tasks: ["Read/Grep ile codebase keşfi.", "Atlanan konuları bul."],
  },
  {
    pass: 3,
    title: "İlk Prensipler",
    lens: "first_principles",
    execution: "read",
    tasks: ["Varsayımları sök.", "Read ile mevcut mimariyi doğrula."],
  },
  {
    pass: 4,
    title: "Kod / Mantık Review",
    lens: "code_logic_review",
    execution: "read",
    tasks: ["Read/Grep ile kod review.", "Bug, güvenlik, edge case."],
  },
  {
    pass: 5,
    title: "Derin Kod Review",
    lens: "deep_code_review",
    execution: "read",
    tasks: [
      "Satır satır Read ile incele.",
      "SSRF, auth, input validation, race condition.",
    ],
  },
  {
    pass: 6,
    title: "Uygulama",
    lens: "implement",
    execution: "write",
    tasks: [
      "Write/StrReplace/Delete ile tüm değişiklikleri uygula.",
      "İç muhakeme sessiz — şeytanın avukatı, sonucu koda yansıt.",
    ],
  },
  {
    pass: 7,
    title: "Karşı Argüman & Alternatifler",
    lens: "counter_argument",
    execution: "write",
    tasks: [
      "Alternatif implementasyonları değerlendir.",
      "Gerekirse kodu güncelle.",
    ],
  },
  {
    pass: 8,
    title: "Uzman Paneli",
    lens: "expert_panel",
    execution: "read",
    tasks: [
      "Mühendis/güvenlik/ürün perspektifi — Read ile kodu tekrar oku.",
      "Eksikleri Write ile kapat.",
    ],
  },
  {
    pass: 9,
    title: "Yapı & Uygulanabilirlik",
    lens: "structure_actionable",
    execution: "write",
    tasks: [
      "Dosya yapısını optimize et.",
      "Somut, uygulanabilir final kod hali.",
    ],
  },
  {
    pass: 10,
    title: "Doğrulama & Final",
    lens: "verify_final",
    execution: "verify",
    tasks: [
      "Test, build, lint çalıştır.",
      "Risk/bilinmeyen haritası.",
      "Final cevap + tüm dosya değişiklikleri özeti.",
    ],
  },
];

const PASS_PLANS: Record<ThinkingMode, PassFocus[]> = {
  easy_thinking: EASY_PASSES,
  medium_thinking: MEDIUM_PASSES,
  more_thinking: MORE_PASSES,
  max_thinking: MAX_PASSES,
};

export function getPassPlan(mode: ThinkingMode, taskKind: TaskKind = "code"): PassFocus[] {
  if (taskKind === "creative") {
    return getCreativePassPlan(mode);
  }
  return PASS_PLANS[mode];
}

export function getPassFocus(
  mode: ThinkingMode,
  passNumber: number,
  taskKind: TaskKind = "code",
): PassFocus | null {
  const plan = getPassPlan(mode, taskKind);
  return plan.find((p) => p.pass === passNumber) ?? null;
}

export function getExecutionHint(kind: ExecutionKind): string {
  return EXECUTION_HINTS[kind];
}

export function formatPassRoadmap(mode: ThinkingMode, taskKind: TaskKind = "code"): string {
  const plan = getPassPlan(mode, taskKind);
  return plan
    .map((p) => {
      const exec =
        p.execution === "read"
          ? "📖 read"
          : p.execution === "write"
            ? "✏️ write"
            : p.execution === "verify"
              ? "✓ verify"
              : "💭 think";
      return `  Pass ${p.pass}: **${p.title}** [${exec}] — ${p.tasks[0]}`;
    })
    .join("\n");
}

export const EXECUTION_LAYER_RULE = [
  "**Execution katmanı (kesin):**",
  "- MCP dosya okumaz/yazmaz — agent workspace araçlarını kullanır.",
  "- Read pass → Read/Grep/SemanticSearch",
  "- Write pass → Write/StrReplace/Delete",
  "- Verify pass → Shell (test/build)",
  "- İç review sessiz kalır; kullanıcıya sadece sonuç ve dosya özeti gider.",
].join("\n");

export const ANTI_STAGNATION_RULE = [
  "**Anti-stagnation (kesin):**",
  "- Önceki pass ile aynı cevabı kopyala-yapıştır YASAK.",
  "- Bu pass'in odağına göre EN AZ 1 somut iyileştirme zorunlu.",
  "- Write pass'te gerçek dosya değişikliği yoksa pass başarısız sayılır.",
].join("\n");
