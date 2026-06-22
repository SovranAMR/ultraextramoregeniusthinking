import type { ThinkingMode } from "../modes.js";
import type { Locale } from "./index.js";
import { passKey } from "./pass-plans.js";

type CreativePassTextEntry = { title: string; tasks: string[] };

const TR: Record<string, CreativePassTextEntry> = {
  "easy_thinking:1": {
    title: "İlk Taslak",
    tasks: [
      "İlk versiyonu Write ile oluştur — çalışan iskelet.",
      "Görsel/kompozisyon hedefini netleştir.",
    ],
  },
  "easy_thinking:2": {
    title: "Sonuç Değerlendirme",
    tasks: [
      "Read ile dosyayı aç — tarayıcıda gör veya SVG/CSS incele.",
      "Eksik mi, fazla mı? Düz tek tur yeter miydi? Bulguyu not et (henüz ekleme zorunluluğu yok).",
    ],
  },
  "easy_thinking:3": {
    title: "Doğrulama & Final",
    tasks: [
      "Görsel sonucu doğrula (browser veya Read). Gereksiz katman varsa sil.",
      "Final: dosya yolu + ne düzeltildi/sadeleştirildi (sadece ekleme değil).",
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
    title: "Sonuç Değerlendirme",
    tasks: [
      "Çıktıyı GÖR (browser_snapshot veya Read) — anatomi, kompozisyon, okunurluk.",
      "Eksikleri ve FAZLALIKları listele. Düz mod daha temiz olur muydu?",
    ],
  },
  "medium_thinking:4": {
    title: "Uygula (ekle veya sil)",
    tasks: [
      "Pass 3 bulgusuna göre Write/StrReplace — düzelt, sadeleştir veya gereksiz katman sil.",
      "Kör detay ekleme yasak. Kullanıcı brief'ine sadık kal.",
    ],
  },
  "medium_thinking:5": {
    title: "Görsel Doğrulama & Final",
    tasks: [
      "Tarayıcıda son hali aç. Syntax + görsel kalite birlikte.",
      "Final: dosya yolu + net değişiklik özeti (silinen/eklenen).",
    ],
  },
  "more_thinking:6": {
    title: "Plain Kıyas",
    tasks: [
      "Steel-man: düz tek tur aynı brief ne üretirdi?",
      "Mevcut çıktı gerçekten daha iyi mi — dürüst cevap. Gerekirse Write ile sadeleştir.",
    ],
  },
  "more_thinking:7": {
    title: "Final Doğrulama",
    tasks: [
      "Görsel son kontrol. Plain'den iyi değilse son sadeleştirme pass'i.",
      "Final + dosya özeti.",
    ],
  },
  "max_thinking:6": {
    title: "Sonuç Değerlendirme",
    tasks: [
      "Read/browser — tam çıktıyı incele: oran, ocellus/train, noise, overlap.",
      "Fazlalık ve eksik ayrı listele.",
    ],
  },
  "max_thinking:7": {
    title: "Plain Kıyas",
    tasks: [
      "Düz tek tur hipotezi: daha az katmanla aynı kalite mümkün mü?",
      "Evetse sonraki pass sadeleştirme odaklı.",
    ],
  },
  "max_thinking:8": {
    title: "Uygula (düzelt / sadeleştir)",
    tasks: [
      "Bulguya göre Write — ekle, düzelt VEYA filter/katman/dekor sil.",
      "Satır sayısı artırmak hedef değil.",
    ],
  },
  "max_thinking:9": {
    title: "Son Sadeleştirme",
    tasks: [
      "Gereksiz gradient, filter, tekrar eden eleman temizliği.",
      "Performans, erişilebilirlik, responsive son kontrol.",
    ],
  },
  "max_thinking:10": {
    title: "Doğrulama & Final",
    tasks: [
      "Görsel doğrulama (browser). Plain'den iyi mi — dürüst yaz.",
      "KULLANICIYA: dosya yolu + kalite özeti (satır sayısı övünme metriği değil).",
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
    title: "Outcome Review",
    tasks: [
      "Open with Read — view in browser or inspect SVG/CSS.",
      "Missing or excess? Would a single plain pass suffice? Note findings (no forced additions).",
    ],
  },
  "easy_thinking:3": {
    title: "Verify & Final",
    tasks: [
      "Verify visual result (browser or Read). Remove unnecessary layers.",
      "Final: file path + what was fixed/simplified (not add-only).",
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
    title: "Outcome Review",
    tasks: [
      "SEE output (browser_snapshot or Read) — anatomy, composition, readability.",
      "List gaps AND bloat. Would plain mode be cleaner?",
    ],
  },
  "medium_thinking:4": {
    title: "Apply (add or remove)",
    tasks: [
      "Write/StrReplace from pass 3 — fix, simplify, or remove layers.",
      "Blind detail stacking forbidden. Stay faithful to the brief.",
    ],
  },
  "medium_thinking:5": {
    title: "Visual Verify & Final",
    tasks: [
      "Open final in browser. Syntax + visual quality together.",
      "Final: file path + clear change summary (removed/added).",
    ],
  },
  "more_thinking:6": {
    title: "Plain Comparison",
    tasks: [
      "Steel-man: what would one plain pass produce?",
      "Is current output truly better — honest answer. Simplify with Write if not.",
    ],
  },
  "more_thinking:7": {
    title: "Final Verification",
    tasks: [
      "Final visual check. Last simplification pass if not beating plain.",
      "Final + file summary.",
    ],
  },
  "max_thinking:6": {
    title: "Outcome Review",
    tasks: [
      "Read/browser — full output: proportions, noise, overlap.",
      "Separate excess from gaps.",
    ],
  },
  "max_thinking:7": {
    title: "Plain Comparison",
    tasks: [
      "Plain single-pass hypothesis: same quality with fewer layers?",
      "If yes, next pass focuses on simplification.",
    ],
  },
  "max_thinking:8": {
    title: "Apply (fix / simplify)",
    tasks: [
      "Write from findings — fix, OR remove filters/layers/decor.",
      "Line count is not the goal.",
    ],
  },
  "max_thinking:9": {
    title: "Final Simplification",
    tasks: [
      "Remove redundant gradients, filters, duplicate elements.",
      "Performance, a11y, responsive final check.",
    ],
  },
  "max_thinking:10": {
    title: "Verification & Final",
    tasks: [
      "Visual verify (browser). Honestly state if better than plain.",
      "USER: file path + quality summary (line count is not a boast metric).",
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
    title: "Ergebnis-Bewertung",
    tasks: [
      "Mit Read öffnen — im Browser ansehen oder SVG/CSS prüfen.",
      "Fehlt etwas oder ist zu viel? Würde ein plain Pass reichen? Befunde notieren.",
    ],
  },
  "easy_thinking:3": {
    title: "Verifizieren & Final",
    tasks: [
      "Visuelles Ergebnis prüfen (Browser oder Read). Unnötige Ebenen entfernen.",
      "Final: Dateipfad + was vereinfacht/korrigiert wurde.",
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
    title: "Ergebnis-Bewertung",
    tasks: [
      "Ausgabe SEHEN (browser_snapshot oder Read) — Anatomie, Komposition.",
      "Lücken UND Ballast listen. Wäre plain sauberer?",
    ],
  },
  "medium_thinking:4": {
    title: "Anwenden (hinzufügen oder entfernen)",
    tasks: [
      "Write/StrReplace aus Pass 3 — korrigieren, vereinfachen oder Ebenen löschen.",
      "Blindes Detail-Stapeln verboten.",
    ],
  },
  "medium_thinking:5": {
    title: "Visuelle Verifizierung & Final",
    tasks: [
      "Endstand im Browser öffnen. Syntax + visuelle Qualität.",
      "Final: Dateipfad + Änderungsübersicht.",
    ],
  },
  "more_thinking:6": {
    title: "Plain-Vergleich",
    tasks: [
      "Steel-man: was würde ein plain Pass liefern?",
      "Ehrlich: ist die Ausgabe wirklich besser? Ggf. vereinfachen.",
    ],
  },
  "more_thinking:7": {
    title: "Finale Verifizierung",
    tasks: ["Visueller Endcheck.", "Final + Dateiübersicht."],
  },
  "max_thinking:6": {
    title: "Ergebnis-Bewertung",
    tasks: ["Read/Browser — vollständige Ausgabe prüfen.", "Ballast und Lücken trennen."],
  },
  "max_thinking:7": {
    title: "Plain-Vergleich",
    tasks: [
      "Plain-Ein-Pass-Hypothese: gleiche Qualität mit weniger Ebenen?",
      "Wenn ja: nächster Pass = Vereinfachung.",
    ],
  },
  "max_thinking:8": {
    title: "Anwenden (fix / vereinfachen)",
    tasks: [
      "Write aus Befunden — korrigieren ODER Filter/Ebenen entfernen.",
      "Zeilenanzahl ist kein Ziel.",
    ],
  },
  "max_thinking:9": {
    title: "Finale Vereinfachung",
    tasks: [
      "Redundante Gradienten, Filter, Duplikate entfernen.",
      "Performance, A11y, Responsive.",
    ],
  },
  "max_thinking:10": {
    title: "Verifikation & Final",
    tasks: [
      "Visuelle Verifizierung (Browser). Ehrlich vs. plain.",
      "NUTZER: Dateipfad + Qualitätsübersicht.",
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
    title: "مراجعة النتيجة",
    tasks: [
      "افتح بـ Read — اعرض في المتصفح أو افحص SVG/CSS.",
      "ناقص أم زائد؟ هل يكفي pass واحد plain؟ دوّن الملاحظات.",
    ],
  },
  "easy_thinking:3": {
    title: "تحقق ونهائي",
    tasks: [
      "تحقق بصري (browser أو Read). أزل الطبقات غير الضرورية.",
      "نهائي: مسار الملف + ما بُسّط/صُحّح.",
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
    title: "مراجعة النتيجة",
    tasks: [
      "اعرض المخرجات (browser_snapshot أو Read) — تشريح وتركيب.",
      "اذكر النقص والزيادة. هل plain أنظف؟",
    ],
  },
  "medium_thinking:4": {
    title: "تطبيق (إضافة أو حذف)",
    tasks: [
      "Write/StrReplace حسب pass 3 — صحّح، بسّط أو احذف طبقات.",
      "إضافة تفاصيل عمياء ممنوعة.",
    ],
  },
  "medium_thinking:5": {
    title: "تحقق بصري ونهائي",
    tasks: [
      "افتح النهائي في المتصفح. syntax + جودة بصرية.",
      "نهائي: مسار الملف + ملخص التغييرات.",
    ],
  },
  "more_thinking:6": {
    title: "مقارنة Plain",
    tasks: [
      "Steel-man: ماذا كان plain pass واحد لينتج؟",
      "هل المخرجات أفضل فعلاً — بصراحة. بسّط إن لزم.",
    ],
  },
  "more_thinking:7": {
    title: "تحقق نهائي",
    tasks: ["فحص بصري أخير.", "نهائي + ملخص الملف."],
  },
  "max_thinking:6": {
    title: "مراجعة النتيجة",
    tasks: ["Read/browser — المخرجات كاملة.", "افصل الزيادة عن النقص."],
  },
  "max_thinking:7": {
    title: "مقارنة Plain",
    tasks: [
      "فرضية plain pass واحد: نفس الجودة بطبقات أقل؟",
      "إن نعم: pass التالي = تبسيط.",
    ],
  },
  "max_thinking:8": {
    title: "تطبيق (إصلاح / تبسيط)",
    tasks: [
      "Write من الملاحظات — أصلح أو احذف filters/طبقات.",
      "عدد الأسطر ليس هدفاً.",
    ],
  },
  "max_thinking:9": {
    title: "تبسيط نهائي",
    tasks: [
      "أزل gradients/filters/عناصر مكررة.",
      "أداء، إمكانية وصول، responsive.",
    ],
  },
  "max_thinking:10": {
    title: "تحقق ونهائي",
    tasks: [
      "تحقق بصري (browser). هل أفضل من plain — بصراحة.",
      "للمستخدم: مسار الملف + ملخص الجودة.",
    ],
  },
};

const CREATIVE_PASS_TEXTS: Record<Locale, Record<string, CreativePassTextEntry>> = {
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
