import type { ThinkingMode } from "../modes.js";
import type { Locale } from "./index.js";
import { passKey } from "./pass-plans.js";

type AnalysisPassTextEntry = { title: string; tasks: string[] };

const TR: Record<string, AnalysisPassTextEntry> = {
  "easy_thinking:1": {
    title: "İlk Taslak",
    tasks: [
      "Soruya doğrudan, net ilk analiz cevabı ver.",
      "Varsayımları ve bilinen/bilinmeyen sınırları kısaca belirt.",
    ],
  },
  "easy_thinking:2": {
    title: "Eksik & Kanıt Kontrolü",
    tasks: [
      "Read/Grep ile kaynakları oku — argüman boşluklarını bul.",
      "Mantık hataları, çelişkiler, zayıf çıkarımları düzelt.",
    ],
  },
  "easy_thinking:3": {
    title: "Doğrulama & Final",
    tasks: [
      "Sonuçları kanıtlarla çapraz kontrol et — iddia-kanıt eşleşmesi.",
      "Final cevap: net özet + kalan belirsizlikler.",
    ],
  },
  "medium_thinking:1": {
    title: "İlk Taslak",
    tasks: ["İlk analiz cevabı ve temel argüman iskeleti.", "Ana varsayımları listele."],
  },
  "medium_thinking:2": {
    title: "Eksik Analizi",
    tasks: [
      "Read/Grep ile ilgili kaynakları tara — kullanıcı tam ne istiyor anla.",
      "Atlanan perspektif, kanıt veya bağımlılık var mı bul.",
    ],
  },
  "medium_thinking:3": {
    title: "Kanıt & Mantık Review",
    tasks: [
      "Read/Grep ile kaynakları oku — iddia-kanıt zincirini test et.",
      "Zayıf çıkarım, alternatif açıklama, eksik veri bul.",
    ],
  },
  "medium_thinking:4": {
    title: "Sentez",
    tasks: [
      "Bulguları birleştir — tutarlı argüman ve net sonuç çıkar.",
      "Önceki pass'lerden en güçlü kanıtları seç, zayıf iddiaları düşür veya işaretle.",
    ],
  },
  "medium_thinking:5": {
    title: "Doğrulama & Final",
    tasks: [
      "Sonuçları kanıtlarla son kez doğrula — çelişki bırakma.",
      "Risk, varsayım, bilinmeyenleri belirt.",
      "Final cevap: net özet + güven seviyesi.",
    ],
  },
  "more_thinking:6": {
    title: "Yapı & Etkiler",
    tasks: [
      "Analiz yapısını optimize et — okunabilirlik, argüman akışı.",
      "İkinci derece etkileri ve edge case'leri değerlendir.",
    ],
  },
  "more_thinking:7": {
    title: "Doğrulama & Final Sentez",
    tasks: [
      "Tüm pass'lerin en iyi halini birleştir.",
      "Final cevap + kalan belirsizlikler özeti.",
    ],
  },
  "max_thinking:1": {
    title: "İlk Taslak",
    tasks: ["İlk analiz cevabı, argüman iskeleti."],
  },
  "max_thinking:2": {
    title: "Eksik Analizi",
    tasks: ["Read/Grep ile kaynak keşfi.", "Atlanan konuları bul."],
  },
  "max_thinking:3": {
    title: "İlk Prensipler",
    tasks: ["Varsayımları sök.", "Read ile mevcut kanıtları doğrula."],
  },
  "max_thinking:4": {
    title: "Kanıt Review",
    tasks: ["Read/Grep ile kaynak review.", "Zayıf iddia, eksik veri, alternatif açıklama."],
  },
  "max_thinking:5": {
    title: "Derin Kanıt Review",
    tasks: [
      "Satır satır Read ile kaynakları incele.",
      "Alternatif açıklamalar, gizli varsayımlar, veri boşlukları.",
    ],
  },
  "max_thinking:6": {
    title: "Sentez & Karar",
    tasks: [
      "Bulguları birleştir — net karar veya öneri çıkar.",
      "Zayıf iddiaları işaretle veya düşür.",
    ],
  },
  "max_thinking:7": {
    title: "Karşı Argüman & Alternatifler",
    tasks: ["Steel-man karşı argüman kur.", "Mevcut analizi karşı argümanla test et."],
  },
  "max_thinking:8": {
    title: "Uzman Paneli",
    tasks: [
      "Mühendis/güvenlik/ürün perspektifi — Read ile kaynakları tekrar oku.",
      "Eksik perspektifleri kapat.",
    ],
  },
  "max_thinking:9": {
    title: "Uygulanabilir Sonuç",
    tasks: ["Somut, uygulanabilir final analiz hali.", "Net öneriler ve sınırlar."],
  },
  "max_thinking:10": {
    title: "Doğrulama & Final",
    tasks: [
      "İddia-kanıt eşleşmesini son kez doğrula.",
      "Risk/bilinmeyen haritası.",
      "Final cevap + güven seviyesi özeti.",
    ],
  },
};

const EN: Record<string, AnalysisPassTextEntry> = {
  "easy_thinking:1": {
    title: "First Draft",
    tasks: [
      "Give a direct, clear first analysis answer.",
      "Briefly state assumptions and known/unknown boundaries.",
    ],
  },
  "easy_thinking:2": {
    title: "Gap & Evidence Check",
    tasks: [
      "Read sources with Read/Grep — find argument gaps.",
      "Fix logic errors, contradictions, weak inferences.",
    ],
  },
  "easy_thinking:3": {
    title: "Verification & Final",
    tasks: [
      "Cross-check conclusions against evidence — claim-evidence match.",
      "Final answer: clear summary + remaining uncertainties.",
    ],
  },
  "medium_thinking:1": {
    title: "First Draft",
    tasks: ["First analysis answer and basic argument skeleton.", "List main assumptions."],
  },
  "medium_thinking:2": {
    title: "Gap Analysis",
    tasks: [
      "Scan relevant sources with Read/Grep — understand exactly what the user wants.",
      "Find missed perspectives, evidence, or dependencies.",
    ],
  },
  "medium_thinking:3": {
    title: "Evidence & Logic Review",
    tasks: [
      "Read sources with Read/Grep — test claim-evidence chain.",
      "Find weak inferences, alternative explanations, missing data.",
    ],
  },
  "medium_thinking:4": {
    title: "Synthesis",
    tasks: [
      "Merge findings — coherent argument and clear conclusion.",
      "Keep strongest evidence from prior passes; drop or flag weak claims.",
    ],
  },
  "medium_thinking:5": {
    title: "Verification & Final",
    tasks: [
      "Final cross-check of conclusions against evidence — no contradictions.",
      "State risks, assumptions, unknowns.",
      "Final answer: clear summary + confidence level.",
    ],
  },
  "more_thinking:6": {
    title: "Structure & Ripple Effects",
    tasks: [
      "Optimize analysis structure — readability, argument flow.",
      "Evaluate second-order effects and edge cases.",
    ],
  },
  "more_thinking:7": {
    title: "Verification & Final Synthesis",
    tasks: [
      "Merge the best of all passes.",
      "Final answer + remaining uncertainties summary.",
    ],
  },
  "max_thinking:1": {
    title: "First Draft",
    tasks: ["First analysis answer, argument skeleton."],
  },
  "max_thinking:2": {
    title: "Gap Analysis",
    tasks: ["Explore sources with Read/Grep.", "Find missed topics."],
  },
  "max_thinking:3": {
    title: "First Principles",
    tasks: ["Strip assumptions.", "Validate existing evidence with Read."],
  },
  "max_thinking:4": {
    title: "Evidence Review",
    tasks: ["Source review with Read/Grep.", "Weak claims, missing data, alternative explanations."],
  },
  "max_thinking:5": {
    title: "Deep Evidence Review",
    tasks: [
      "Line-by-line review of sources with Read.",
      "Alternative explanations, hidden assumptions, data gaps.",
    ],
  },
  "max_thinking:6": {
    title: "Synthesis & Decision",
    tasks: [
      "Merge findings — clear decision or recommendation.",
      "Flag or drop weak claims.",
    ],
  },
  "max_thinking:7": {
    title: "Counter-Argument & Alternatives",
    tasks: ["Build a steel-man counter-argument.", "Test current analysis against it."],
  },
  "max_thinking:8": {
    title: "Expert Panel",
    tasks: [
      "Engineer/security/product perspective — re-read sources with Read.",
      "Close missing perspectives.",
    ],
  },
  "max_thinking:9": {
    title: "Actionable Conclusion",
    tasks: ["Concrete, actionable final analysis.", "Clear recommendations and limits."],
  },
  "max_thinking:10": {
    title: "Verification & Final",
    tasks: [
      "Final claim-evidence match check.",
      "Risk/unknown map.",
      "Final answer + confidence summary.",
    ],
  },
};

const DE: Record<string, AnalysisPassTextEntry> = {
  "easy_thinking:1": {
    title: "Erster Entwurf",
    tasks: [
      "Direkte, klare erste Analyseantwort geben.",
      "Annahmen und bekannte/unbekannte Grenzen kurz nennen.",
    ],
  },
  "easy_thinking:2": {
    title: "Lücken- & Evidenzcheck",
    tasks: [
      "Quellen mit Read/Grep lesen — Argumentlücken finden.",
      "Logikfehler, Widersprüche, schwache Schlussfolgerungen beheben.",
    ],
  },
  "easy_thinking:3": {
    title: "Verifikation & Final",
    tasks: [
      "Schlussfolgerungen gegen Evidenz prüfen — Behauptung-Evidenz-Match.",
      "Finale Antwort: klare Zusammenfassung + verbleibende Unsicherheiten.",
    ],
  },
  "medium_thinking:1": {
    title: "Erster Entwurf",
    tasks: ["Erste Analyseantwort und Argumentgerüst.", "Hauptannahmen listen."],
  },
  "medium_thinking:2": {
    title: "Lückenanalyse",
    tasks: [
      "Relevante Quellen mit Read/Grep scannen — genau verstehen, was der Nutzer will.",
      "Übersprungene Perspektiven, Evidenz oder Abhängigkeiten finden.",
    ],
  },
  "medium_thinking:3": {
    title: "Evidenz- & Logik-Review",
    tasks: [
      "Quellen mit Read/Grep lesen — Behauptung-Evidenz-Kette testen.",
      "Schwache Schlussfolgerungen, alternative Erklärungen, fehlende Daten finden.",
    ],
  },
  "medium_thinking:4": {
    title: "Synthese",
    tasks: [
      "Befunde zusammenführen — kohärentes Argument und klares Ergebnis.",
      "Stärkste Evidenz aus vorherigen Pässen behalten; schwache Behauptungen markieren.",
    ],
  },
  "medium_thinking:5": {
    title: "Verifikation & Final",
    tasks: [
      "Schlussfolgerungen final gegen Evidenz prüfen — keine Widersprüche.",
      "Risiken, Annahmen, Unbekanntes nennen.",
      "Finale Antwort: klare Zusammenfassung + Konfidenzniveau.",
    ],
  },
  "more_thinking:6": {
    title: "Struktur & Ripple-Effekte",
    tasks: [
      "Analysestruktur optimieren — Lesbarkeit, Argumentfluss.",
      "Zweiteffekte und Edge Cases bewerten.",
    ],
  },
  "more_thinking:7": {
    title: "Verifikation & Finale Synthese",
    tasks: [
      "Bestes aller Pässe zusammenführen.",
      "Finale Antwort + Zusammenfassung verbleibender Unsicherheiten.",
    ],
  },
  "max_thinking:1": {
    title: "Erster Entwurf",
    tasks: ["Erste Analyseantwort, Argumentgerüst."],
  },
  "max_thinking:2": {
    title: "Lückenanalyse",
    tasks: ["Quellen mit Read/Grep erkunden.", "Übersprungene Themen finden."],
  },
  "max_thinking:3": {
    title: "Erste Prinzipien",
    tasks: ["Annahmen abtragen.", "Vorhandene Evidenz mit Read validieren."],
  },
  "max_thinking:4": {
    title: "Evidenz-Review",
    tasks: ["Quellen-Review mit Read/Grep.", "Schwache Behauptungen, fehlende Daten, Alternativen."],
  },
  "max_thinking:5": {
    title: "Tiefes Evidenz-Review",
    tasks: [
      "Quellen Zeile für Zeile mit Read prüfen.",
      "Alternative Erklärungen, versteckte Annahmen, Datenlücken.",
    ],
  },
  "max_thinking:6": {
    title: "Synthese & Entscheidung",
    tasks: [
      "Befunde zusammenführen — klare Entscheidung oder Empfehlung.",
      "Schwache Behauptungen markieren oder streichen.",
    ],
  },
  "max_thinking:7": {
    title: "Gegenargument & Alternativen",
    tasks: ["Steel-man-Gegenargument aufbauen.", "Aktuelle Analyse dagegen testen."],
  },
  "max_thinking:8": {
    title: "Expertenpanel",
    tasks: [
      "Ingenieur/Sicherheit/Produkt-Perspektive — Quellen erneut mit Read lesen.",
      "Fehlende Perspektiven schließen.",
    ],
  },
  "max_thinking:9": {
    title: "Umsetzbares Ergebnis",
    tasks: ["Konkrete, umsetzbare finale Analyse.", "Klare Empfehlungen und Grenzen."],
  },
  "max_thinking:10": {
    title: "Verifikation & Final",
    tasks: [
      "Finale Behauptung-Evidenz-Prüfung.",
      "Risiko/Unbekannt-Karte.",
      "Finale Antwort + Konfidenz-Zusammenfassung.",
    ],
  },
};

const AR: Record<string, AnalysisPassTextEntry> = {
  "easy_thinking:1": {
    title: "المسودة الأولى",
    tasks: [
      "قدّم إجابة تحليلية أولى مباشرة وواضحة.",
      "اذكر الافتراضات وحدود المعروف/المجهول باختصار.",
    ],
  },
  "easy_thinking:2": {
    title: "فحص الفجوات والأدلة",
    tasks: [
      "اقرأ المصادر بـ Read/Grep — اعثر على فجوات الحجة.",
      "صحّح أخطاء المنطق والتناقضات والاستنتاجات الضعيفة.",
    ],
  },
  "easy_thinking:3": {
    title: "التحقق والنهائي",
    tasks: [
      "تحقق متقاطع للنتائج مع الأدلة — تطابق الادعاء والدليل.",
      "إجابة نهائية: ملخص واضح + الشكوك المتبقية.",
    ],
  },
  "medium_thinking:1": {
    title: "المسودة الأولى",
    tasks: ["إجابة تحليلية أولى وهيكل حجة أساسي.", "اذكر الافتراضات الرئيسية."],
  },
  "medium_thinking:2": {
    title: "تحليل الفجوات",
    tasks: [
      "امسح المصادر ذات الصلة بـ Read/Grep — افهم بالضبط ما يريده المستخدم.",
      "اعثر على منظورات أو أدلة أو تبعيات فائتة.",
    ],
  },
  "medium_thinking:3": {
    title: "مراجعة الأدلة والمنطق",
    tasks: [
      "اقرأ المصادر بـ Read/Grep — اختبر سلسلة الادعاء-الدليل.",
      "اعثر على استنتاجات ضعيفة وتفسيرات بديلة وبيانات ناقصة.",
    ],
  },
  "medium_thinking:4": {
    title: "التركيب",
    tasks: [
      "ادمج النتائج — حجة متماسكة واستنتاج واضح.",
      "احتفظ بأقوى الأدلة من المراحل السابقة؛ أزل أو علّم الادعاءات الضعيفة.",
    ],
  },
  "medium_thinking:5": {
    title: "التحقق والنهائي",
    tasks: [
      "تحقق نهائي من النتائج مع الأدلة — لا تناقضات.",
      "اذكر المخاطر والافتراضات والمجهول.",
      "إجابة نهائية: ملخص واضح + مستوى الثقة.",
    ],
  },
  "more_thinking:6": {
    title: "البنية والآثار المترتبة",
    tasks: [
      "حسّن بنية التحليل — قابلية القراءة وتدفق الحجة.",
      "قيّم الآثار من الدرجة الثانية وحالات الحافة.",
    ],
  },
  "more_thinking:7": {
    title: "التحقق والتركيب النهائي",
    tasks: [
      "ادمج أفضل ما في كل المراحل.",
      "إجابة نهائية + ملخص الشكوك المتبقية.",
    ],
  },
  "max_thinking:1": {
    title: "المسودة الأولى",
    tasks: ["إجابة تحليلية أولى، هيكل الحجة."],
  },
  "max_thinking:2": {
    title: "تحليل الفجوات",
    tasks: ["استكشف المصادر بـ Read/Grep.", "اعثر على مواضيع فائتة."],
  },
  "max_thinking:3": {
    title: "المبادئ الأولى",
    tasks: ["فكّك الافتراضات.", "تحقق من الأدلة الموجودة بـ Read."],
  },
  "max_thinking:4": {
    title: "مراجعة الأدلة",
    tasks: ["مراجعة المصادر بـ Read/Grep.", "ادعاءات ضعيفة، بيانات ناقصة، تفسيرات بديلة."],
  },
  "max_thinking:5": {
    title: "مراجعة أدلة عميقة",
    tasks: [
      "مراجعة المصادر سطراً بسطر بـ Read.",
      "تفسيرات بديلة وافتراضات مخفية وفجوات بيانات.",
    ],
  },
  "max_thinking:6": {
    title: "التركيب والقرار",
    tasks: [
      "ادمج النتائج — قرار أو توصية واضحة.",
      "علّم أو أزل الادعاءات الضعيفة.",
    ],
  },
  "max_thinking:7": {
    title: "حجة مضادة وبدائل",
    tasks: ["ابنِ حجة مضادة steel-man.", "اختبر التحليل الحالي ضدها."],
  },
  "max_thinking:8": {
    title: "لوحة خبراء",
    tasks: [
      "منظور مهندس/أمان/منتج — أعد قراءة المصادر بـ Read.",
      "أغلق المنظورات الناقصة.",
    ],
  },
  "max_thinking:9": {
    title: "استنتاج قابل للتطبيق",
    tasks: ["تحليل نهائي ملموس وقابل للتطبيق.", "توصيات وحدود واضحة."],
  },
  "max_thinking:10": {
    title: "التحقق والنهائي",
    tasks: [
      "فحص نهائي لتطابق الادعاء والدليل.",
      "خريطة مخاطر/مجهول.",
      "إجابة نهائية + ملخص الثقة.",
    ],
  },
};

const ANALYSIS_PASS_TEXTS: Record<Locale, Record<string, AnalysisPassTextEntry>> = {
  tr: TR,
  en: EN,
  de: DE,
  ar: AR,
};

function resolveAnalysisPassText(
  locale: Locale,
  mode: ThinkingMode,
  pass: number,
): AnalysisPassTextEntry {
  const key = passKey(mode, pass);
  const bundle = ANALYSIS_PASS_TEXTS[locale];
  const fallback = ANALYSIS_PASS_TEXTS.tr;
  if (bundle[key]) return bundle[key];
  if (mode === "more_thinking" && pass <= 5) {
    return (
      bundle[passKey("medium_thinking", pass)] ??
      fallback[passKey("medium_thinking", pass)]
    );
  }
  return fallback[key];
}

export function getAnalysisPassText(
  locale: Locale,
  mode: ThinkingMode,
  pass: number,
): AnalysisPassTextEntry {
  return resolveAnalysisPassText(locale, mode, pass);
}
