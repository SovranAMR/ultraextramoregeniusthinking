import type { ThinkingMode } from "../modes.js";
import type { Locale } from "./index.js";
import { passKey } from "./pass-plans.js";

export type CreativePassTextEntry = { title: string; tasks: string[] };

const TR: Record<string, CreativePassTextEntry> = {
  "easy_thinking:1": {
    title: "İlk Taslak",
    tasks: [
      "İlk versiyonu Write ile oluştur — çalışan iskelet.",
      "Görsel/kompozisyon hedefini netleştir.",
    ],
  },
  "easy_thinking:2": {
    title: "Detay & Derinlik",
    tasks: [
      "Read ile dosyayı aç — eksik detayları bul.",
      "StrReplace ile görsel detayları artır (katman, renk, anatomi).",
    ],
  },
  "easy_thinking:3": {
    title: "Cilalama & Final",
    tasks: [
      "Son rötuşlar, gereksiz kod temizliği.",
      "Tarayıcıda açılabilir mi kontrol et. Final özeti + dosya yolu.",
    ],
  },
  "medium_thinking:1": {
    title: "İlk Taslak",
    tasks: ["Write ile ilk dosyayı oluştur.", "Temel kompozisyon ve yapı."],
  },
  "medium_thinking:2": {
    title: "Referans & Eksik",
    tasks: [
      "Read ile mevcut çıktıyı incele.",
      "Anatomi/kompozisyon eksiklerini listele (sessizce), koda yansıt.",
    ],
  },
  "medium_thinking:3": {
    title: "Detay Pass",
    tasks: [
      "StrReplace ile detay ekle: katmanlar, gradient, texture, animasyon.",
      "Önceki pass'ten EN AZ 3 somut görsel iyileştirme.",
    ],
  },
  "medium_thinking:4": {
    title: "İç Kontrol",
    tasks: [
      "Read ile tekrar oku — zayıf bölgeleri güçlendir.",
      "Write ile düzelt. Sadakat: kullanıcı ne istedi?",
    ],
  },
  "medium_thinking:5": {
    title: "Final & Doğrula",
    tasks: [
      "Shell/node ile dosya var mı, syntax bozuk mu kontrol et.",
      "Final teslim: dosya yolu + ne eklendi özeti.",
    ],
  },
  "more_thinking:6": {
    title: "Karşılaştırma & Alternatif",
    tasks: [
      "Başka yaklaşım (canvas vs SVG vs CSS) steel-man.",
      "Mevcut seçimin zayıf noktalarını Read+Write ile düzelt.",
    ],
  },
  "more_thinking:7": {
    title: "Final Sentez",
    tasks: ["En iyi detayları birleştir.", "Final + dosya özeti."],
  },
  "max_thinking:6": {
    title: "Derin Detay",
    tasks: ["Procedural/katmanlı detay ekle.", "Renk varyasyonu, texture."],
  },
  "max_thinking:7": {
    title: "Anatomi/Doğruluk",
    tasks: ["Referans doğruluğu kontrol.", "Read+Write ile düzelt."],
  },
  "max_thinking:8": {
    title: "Karşı Argüman",
    tasks: ["Alternatif teknikleri değerlendir.", "En iyi seçimi uygula."],
  },
  "max_thinking:9": {
    title: "Cilalama",
    tasks: ["Performans, erişilebilirlik, responsive.", "Son rötuşlar."],
  },
  "max_thinking:10": {
    title: "Doğrulama & Final",
    tasks: [
      "Smoke test çalıştır.",
      "KULLANICIYA GİDECEK ÖZET: dosya, satır sayısı, öne çıkan detaylar.",
    ],
  },
};

const EN: Record<string, CreativePassTextEntry> = {
  "easy_thinking:1": {
    title: "First Draft",
    tasks: [
      "Create the first version with Write — working skeleton.",
      "Clarify visual/composition target.",
    ],
  },
  "easy_thinking:2": {
    title: "Detail & Depth",
    tasks: [
      "Open the file with Read — find missing details.",
      "Increase visual detail with StrReplace (layer, color, anatomy).",
    ],
  },
  "easy_thinking:3": {
    title: "Polish & Final",
    tasks: [
      "Final touches, remove unnecessary code.",
      "Check if it opens in browser. Final summary + file path.",
    ],
  },
  "medium_thinking:1": {
    title: "First Draft",
    tasks: ["Create the first file with Write.", "Basic composition and structure."],
  },
  "medium_thinking:2": {
    title: "Reference & Gaps",
    tasks: [
      "Inspect current output with Read.",
      "List anatomy/composition gaps (silently), reflect in code.",
    ],
  },
  "medium_thinking:3": {
    title: "Detail Pass",
    tasks: [
      "Add detail with StrReplace: layers, gradient, texture, animation.",
      "At least 3 concrete visual improvements from the previous pass.",
    ],
  },
  "medium_thinking:4": {
    title: "Internal Review",
    tasks: [
      "Re-read with Read — strengthen weak areas.",
      "Fix with Write. Fidelity: what did the user ask for?",
    ],
  },
  "medium_thinking:5": {
    title: "Final & Verify",
    tasks: [
      "Check file exists and syntax is valid via Shell/node.",
      "Final delivery: file path + summary of what was added.",
    ],
  },
  "more_thinking:6": {
    title: "Comparison & Alternatives",
    tasks: [
      "Steel-man another approach (canvas vs SVG vs CSS).",
      "Fix weak points of current choice with Read+Write.",
    ],
  },
  "more_thinking:7": {
    title: "Final Synthesis",
    tasks: ["Merge the best details.", "Final + file summary."],
  },
  "max_thinking:6": {
    title: "Deep Detail",
    tasks: ["Add procedural/layered detail.", "Color variation, texture."],
  },
  "max_thinking:7": {
    title: "Anatomy/Accuracy",
    tasks: ["Check reference accuracy.", "Fix with Read+Write."],
  },
  "max_thinking:8": {
    title: "Counter-Argument",
    tasks: ["Evaluate alternative techniques.", "Apply the best choice."],
  },
  "max_thinking:9": {
    title: "Polish",
    tasks: ["Performance, accessibility, responsive.", "Final touches."],
  },
  "max_thinking:10": {
    title: "Verification & Final",
    tasks: [
      "Run smoke test.",
      "USER-FACING SUMMARY: file, line count, standout details.",
    ],
  },
};

const DE: Record<string, CreativePassTextEntry> = {
  "easy_thinking:1": {
    title: "Erster Entwurf",
    tasks: [
      "Erste Version mit Write erstellen — funktionierendes Gerüst.",
      "Visuelles/Kompositionsziel klären.",
    ],
  },
  "easy_thinking:2": {
    title: "Detail & Tiefe",
    tasks: [
      "Datei mit Read öffnen — fehlende Details finden.",
      "Visuelle Details mit StrReplace erhöhen (Ebene, Farbe, Anatomie).",
    ],
  },
  "easy_thinking:3": {
    title: "Feinschliff & Final",
    tasks: [
      "Letzte Retuschen, unnötigen Code entfernen.",
      "Im Browser öffenbar prüfen. Finale Zusammenfassung + Dateipfad.",
    ],
  },
  "medium_thinking:1": {
    title: "Erster Entwurf",
    tasks: ["Erste Datei mit Write erstellen.", "Basis-Komposition und Struktur."],
  },
  "medium_thinking:2": {
    title: "Referenz & Lücken",
    tasks: [
      "Aktuelle Ausgabe mit Read prüfen.",
      "Anatomie/Kompositionslücken listen (still), in Code widerspiegeln.",
    ],
  },
  "medium_thinking:3": {
    title: "Detail-Pass",
    tasks: [
      "Detail mit StrReplace hinzufügen: Ebenen, Gradient, Textur, Animation.",
      "Mindestens 3 konkrete visuelle Verbesserungen gegenüber vorherigem Pass.",
    ],
  },
  "medium_thinking:4": {
    title: "Interne Kontrolle",
    tasks: [
      "Erneut mit Read lesen — schwache Bereiche stärken.",
      "Mit Write korrigieren. Treue: was wollte der Nutzer?",
    ],
  },
  "medium_thinking:5": {
    title: "Final & Verifizieren",
    tasks: [
      "Mit Shell/node prüfen: Datei vorhanden, Syntax ok.",
      "Finale Lieferung: Dateipfad + Zusammenfassung der Ergänzungen.",
    ],
  },
  "more_thinking:6": {
    title: "Vergleich & Alternativen",
    tasks: [
      "Steel-man anderer Ansatz (Canvas vs SVG vs CSS).",
      "Schwachstellen der aktuellen Wahl mit Read+Write beheben.",
    ],
  },
  "more_thinking:7": {
    title: "Finale Synthese",
    tasks: ["Beste Details zusammenführen.", "Final + Dateiübersicht."],
  },
  "max_thinking:6": {
    title: "Tiefes Detail",
    tasks: ["Prozedurale/mehrschichtige Details hinzufügen.", "Farbvariation, Textur."],
  },
  "max_thinking:7": {
    title: "Anatomie/Genauigkeit",
    tasks: ["Referenzgenauigkeit prüfen.", "Mit Read+Write korrigieren."],
  },
  "max_thinking:8": {
    title: "Gegenargument",
    tasks: ["Alternative Techniken bewerten.", "Beste Wahl anwenden."],
  },
  "max_thinking:9": {
    title: "Feinschliff",
    tasks: ["Performance, Barrierefreiheit, Responsive.", "Letzte Retuschen."],
  },
  "max_thinking:10": {
    title: "Verifikation & Final",
    tasks: [
      "Smoke-Test ausführen.",
      "NUTZER-ZUSAMMENFASSUNG: Datei, Zeilenanzahl, Highlights.",
    ],
  },
};

const AR: Record<string, CreativePassTextEntry> = {
  "easy_thinking:1": {
    title: "مسودة أولى",
    tasks: [
      "أنشئ النسخة الأولى بـ Write — هيكل يعمل.",
      "وضّح هدف بصري/تركيبي.",
    ],
  },
  "easy_thinking:2": {
    title: "تفاصيل وعمق",
    tasks: [
      "افتح الملف بـ Read — اعثر على التفاصيل الناقصة.",
      "زِد التفاصيل البصرية بـ StrReplace (طبقة، لون، تشريح).",
    ],
  },
  "easy_thinking:3": {
    title: "صقل ونهائي",
    tasks: [
      "لمسات أخيرة، أزل الكود غير الضروري.",
      "تحقق من فتحه في المتصفح. ملخص نهائي + مسار الملف.",
    ],
  },
  "medium_thinking:1": {
    title: "مسودة أولى",
    tasks: ["أنشئ الملف الأول بـ Write.", "تركيب وبنية أساسية."],
  },
  "medium_thinking:2": {
    title: "مرجع وفجوات",
    tasks: [
      "افحص المخرجات الحالية بـ Read.",
      "اذكر فجوات التشريح/التركيب (بصمت)، انعكس في الكود.",
    ],
  },
  "medium_thinking:3": {
    title: "pass تفاصيل",
    tasks: [
      "أضف تفاصيل بـ StrReplace: طبقات، gradient، texture، animation.",
      "3 تحسينات بصرية ملموسة على الأقل من pass السابق.",
    ],
  },
  "medium_thinking:4": {
    title: "مراجعة داخلية",
    tasks: [
      "أعد القراءة بـ Read — قوِّ المناطق الضعيفة.",
      "صحّح بـ Write. الالتزام: ماذا طلب المستخدم؟",
    ],
  },
  "medium_thinking:5": {
    title: "نهائي وتحقق",
    tasks: [
      "تحقق من وجود الملف وصحة syntax عبر Shell/node.",
      "تسليم نهائي: مسار الملف + ملخص ما أُضيف.",
    ],
  },
  "more_thinking:6": {
    title: "مقارنة وبدائل",
    tasks: [
      "Steel-man نهج آخر (canvas vs SVG vs CSS).",
      "أصلح نقاط ضعف الاختيار الحالي بـ Read+Write.",
    ],
  },
  "more_thinking:7": {
    title: "تركيب نهائي",
    tasks: ["ادمج أفضل التفاصيل.", "نهائي + ملخص الملف."],
  },
  "max_thinking:6": {
    title: "تفاصيل عميقة",
    tasks: ["أضف تفاصيل procedural/طبقات.", "تنوع ألوان، texture."],
  },
  "max_thinking:7": {
    title: "تشريح/دقة",
    tasks: ["تحقق من دقة المرجع.", "صحّح بـ Read+Write."],
  },
  "max_thinking:8": {
    title: "حجة مضادة",
    tasks: ["قيّم تقنيات بديلة.", "طبّق أفضل اختيار."],
  },
  "max_thinking:9": {
    title: "صقل",
    tasks: ["أداء، إمكانية وصول، responsive.", "لمسات أخيرة."],
  },
  "max_thinking:10": {
    title: "تحقق ونهائي",
    tasks: [
      "شغّل smoke test.",
      "ملخص للمستخدم: الملف، عدد الأسطر، أبرز التفاصيل.",
    ],
  },
};

export const CREATIVE_PASS_TEXTS: Record<Locale, Record<string, CreativePassTextEntry>> = {
  tr: TR,
  en: EN,
  de: DE,
  ar: AR,
};

function resolveCreativePassText(
  locale: Locale,
  mode: ThinkingMode,
  pass: number,
): CreativePassTextEntry {
  const key = passKey(mode, pass);
  const bundle = CREATIVE_PASS_TEXTS[locale];
  const fallback = CREATIVE_PASS_TEXTS.tr;
  if (bundle[key]) return bundle[key];
  if (mode === "more_thinking" && pass <= 5) {
    return (
      bundle[passKey("medium_thinking", pass)] ??
      fallback[passKey("medium_thinking", pass)]
    );
  }
  if (mode === "max_thinking" && pass <= 5) {
    return (
      bundle[passKey("medium_thinking", pass)] ??
      fallback[passKey("medium_thinking", pass)]
    );
  }
  return fallback[key];
}

export function getCreativePassText(
  locale: Locale,
  mode: ThinkingMode,
  pass: number,
): CreativePassTextEntry {
  return resolveCreativePassText(locale, mode, pass);
}
