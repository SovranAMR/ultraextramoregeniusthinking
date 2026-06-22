import type { ThinkingMode } from "../modes.js";
import type { Locale } from "./index.js";

type PassTextEntry = { title: string; tasks: string[] };

export function passKey(mode: ThinkingMode, pass: number): string {
  return `${mode}:${pass}`;
}

const TR: Record<string, PassTextEntry> = {
  "easy_thinking:1": {
    title: "İlk Taslak",
    tasks: [
      "Soruya doğrudan, net, uygulanabilir ilk cevap ver.",
      "Kod göreviyse: hangi dosyalar etkilenecek kısaca planla.",
    ],
  },
  "easy_thinking:2": {
    title: "Eksik & Mantık Kontrolü",
    tasks: [
      "İlgili dosyaları Read/Grep ile oku — eksikleri gerçek koda göre bul.",
      "Mantık hatalarını, çelişkileri düzelt — gerekirse Write/StrReplace ile uygula.",
      "Kullanıcı isteğine sadık mı kontrol et.",
    ],
  },
  "easy_thinking:3": {
    title: "Doğrulama & Final",
    tasks: [
      "Pass 2'deki düzeltmeleri Shell ile test/build et — kırık bırakma.",
      "Eksik kod varsa Write/StrReplace ile tamamla, sonra tekrar doğrula.",
      "Final cevap + değişen dosya listesi + test/build özeti.",
    ],
  },
  "medium_thinking:1": {
    title: "İlk Taslak",
    tasks: ["İlk cevabı ve temel planı ver.", "Kod göreviyse etkilenecek dosyaları listele."],
  },
  "medium_thinking:2": {
    title: "Eksik Analizi",
    tasks: [
      "Read/Grep ile codebase'i tara — kullanıcı tam ne istiyor anla.",
      "Atlanan adım, dosya, bağımlılık var mı bul.",
    ],
  },
  "medium_thinking:3": {
    title: "Kod / Mantık Review",
    tasks: [
      "Read/Grep ile gerçek kodu oku — bug, güvenlik, edge case, performans.",
      "Kod yoksa mantık review: argüman zinciri, çıkarımlar.",
      "Review sonucunu cevaba yansıt (meta değil, düzeltme).",
    ],
  },
  "medium_thinking:4": {
    title: "Uygulama",
    tasks: [
      "Write/StrReplace/Delete ile değişiklikleri uygula.",
      "Yeni dosya oluştur, mevcut dosyayı düzenle veya sil — gerektiği gibi.",
      "Mock/placeholder yasak. Sessiz self-review yap, sonucu koda yansıt.",
    ],
  },
  "medium_thinking:5": {
    title: "Doğrulama & Final",
    tasks: [
      "Shell ile test/build çalıştır — kırık bırakma.",
      "Risk, varsayım, bilinmeyenleri belirt.",
      "Final cevap: net özet + değişen/oluşan dosya listesi.",
    ],
  },
  "more_thinking:5": {
    title: "Karşı Argüman",
    tasks: [
      "Steel-man karşı argüman kur.",
      "Read ile mevcut implementasyonu karşı argümanla test et.",
      "Gerekirse Write ile düzelt.",
    ],
  },
  "more_thinking:6": {
    title: "Yapı & Etkiler",
    tasks: [
      "Yapıyı optimize et — dosya organizasyonu, okunabilirlik.",
      "İkinci derece etkileri hesapla, gerekirse kodu güncelle.",
      "Edge case'leri koda yansıt.",
    ],
  },
  "more_thinking:7": {
    title: "Doğrulama & Final Sentez",
    tasks: [
      "Test/build çalıştır.",
      "Tüm pass'lerin en iyi halini birleştir.",
      "Final cevap + dosya değişiklik özeti.",
    ],
  },
  "max_thinking:1": {
    title: "İlk Taslak",
    tasks: ["İlk cevap, dosya planı."],
  },
  "max_thinking:2": {
    title: "Eksik Analizi",
    tasks: ["Read/Grep ile codebase keşfi.", "Atlanan konuları bul."],
  },
  "max_thinking:3": {
    title: "İlk Prensipler",
    tasks: ["Varsayımları sök.", "Read ile mevcut mimariyi doğrula."],
  },
  "max_thinking:4": {
    title: "Kod / Mantık Review",
    tasks: ["Read/Grep ile kod review.", "Bug, güvenlik, edge case."],
  },
  "max_thinking:5": {
    title: "Derin Kod Review",
    tasks: [
      "Satır satır Read ile incele.",
      "SSRF, auth, input validation, race condition.",
    ],
  },
  "max_thinking:6": {
    title: "Uygulama",
    tasks: [
      "Write/StrReplace/Delete ile tüm değişiklikleri uygula.",
      "İç muhakeme sessiz — şeytanın avukatı, sonucu koda yansıt.",
    ],
  },
  "max_thinking:7": {
    title: "Karşı Argüman & Alternatifler",
    tasks: ["Alternatif implementasyonları değerlendir.", "Gerekirse kodu güncelle."],
  },
  "max_thinking:8": {
    title: "Uzman Paneli",
    tasks: [
      "Mühendis/güvenlik/ürün perspektifi — Read ile kodu tekrar oku.",
      "Eksikleri Write ile kapat.",
    ],
  },
  "max_thinking:9": {
    title: "Yapı & Uygulanabilirlik",
    tasks: ["Dosya yapısını optimize et.", "Somut, uygulanabilir final kod hali."],
  },
  "max_thinking:10": {
    title: "Doğrulama & Final",
    tasks: [
      "Test, build, lint çalıştır.",
      "Risk/bilinmeyen haritası.",
      "Final cevap + tüm dosya değişiklikleri özeti.",
    ],
  },
};

const EN: Record<string, PassTextEntry> = {
  "easy_thinking:1": {
    title: "First Draft",
    tasks: [
      "Give a direct, clear, actionable first answer.",
      "For code tasks: briefly plan which files will be affected.",
    ],
  },
  "easy_thinking:2": {
    title: "Gap & Logic Check",
    tasks: [
      "Read relevant files with Read/Grep — find gaps against real code.",
      "Fix logic errors and contradictions — apply with Write/StrReplace if needed.",
      "Check fidelity to the user's request.",
    ],
  },
  "easy_thinking:3": {
    title: "Verification & Final",
    tasks: [
      "Run test/build via Shell for Pass 2 fixes — do not leave broken state.",
      "Complete missing code with Write/StrReplace, then verify again.",
      "Final answer + changed file list + test/build summary.",
    ],
  },
  "medium_thinking:1": {
    title: "First Draft",
    tasks: ["Give the first answer and basic plan.", "For code tasks: list affected files."],
  },
  "medium_thinking:2": {
    title: "Gap Analysis",
    tasks: [
      "Scan codebase with Read/Grep — understand exactly what the user wants.",
      "Find missed steps, files, dependencies.",
    ],
  },
  "medium_thinking:3": {
    title: "Code / Logic Review",
    tasks: [
      "Read real code with Read/Grep — bugs, security, edge cases, performance.",
      "If no code: logic review — argument chain, inferences.",
      "Reflect review in the answer (not meta, actual fixes).",
    ],
  },
  "medium_thinking:4": {
    title: "Implementation",
    tasks: [
      "Apply changes with Write/StrReplace/Delete.",
      "Create new files, edit or delete existing ones as needed.",
      "No mock/placeholder. Silent self-review, reflect in code.",
    ],
  },
  "medium_thinking:5": {
    title: "Verification & Final",
    tasks: [
      "Run test/build via Shell — do not leave broken state.",
      "State risks, assumptions, unknowns.",
      "Final answer: clear summary + changed/created file list.",
    ],
  },
  "more_thinking:5": {
    title: "Counter-Argument",
    tasks: [
      "Build a steel-man counter-argument.",
      "Test current implementation against it with Read.",
      "Fix with Write if needed.",
    ],
  },
  "more_thinking:6": {
    title: "Structure & Ripple Effects",
    tasks: [
      "Optimize structure — file organization, readability.",
      "Calculate second-order effects, update code if needed.",
      "Reflect edge cases in code.",
    ],
  },
  "more_thinking:7": {
    title: "Verification & Final Synthesis",
    tasks: [
      "Run test/build.",
      "Merge the best of all passes.",
      "Final answer + file change summary.",
    ],
  },
  "max_thinking:1": {
    title: "First Draft",
    tasks: ["First answer, file plan."],
  },
  "max_thinking:2": {
    title: "Gap Analysis",
    tasks: ["Explore codebase with Read/Grep.", "Find missed topics."],
  },
  "max_thinking:3": {
    title: "First Principles",
    tasks: ["Strip assumptions.", "Validate current architecture with Read."],
  },
  "max_thinking:4": {
    title: "Code / Logic Review",
    tasks: ["Code review with Read/Grep.", "Bugs, security, edge cases."],
  },
  "max_thinking:5": {
    title: "Deep Code Review",
    tasks: [
      "Line-by-line review with Read.",
      "SSRF, auth, input validation, race conditions.",
    ],
  },
  "max_thinking:6": {
    title: "Implementation",
    tasks: [
      "Apply all changes with Write/StrReplace/Delete.",
      "Silent internal debate — devil's advocate, reflect in code.",
    ],
  },
  "max_thinking:7": {
    title: "Counter-Argument & Alternatives",
    tasks: ["Evaluate alternative implementations.", "Update code if needed."],
  },
  "max_thinking:8": {
    title: "Expert Panel",
    tasks: [
      "Engineer/security/product perspective — re-read code with Read.",
      "Close gaps with Write.",
    ],
  },
  "max_thinking:9": {
    title: "Structure & Actionability",
    tasks: ["Optimize file structure.", "Concrete, actionable final code state."],
  },
  "max_thinking:10": {
    title: "Verification & Final",
    tasks: [
      "Run test, build, lint.",
      "Risk/unknown map.",
      "Final answer + summary of all file changes.",
    ],
  },
};

const DE: Record<string, PassTextEntry> = {
  "easy_thinking:1": {
    title: "Erster Entwurf",
    tasks: [
      "Direkte, klare, umsetzbare erste Antwort geben.",
      "Bei Code-Aufgaben: betroffene Dateien kurz planen.",
    ],
  },
  "easy_thinking:2": {
    title: "Lücken- & Logikcheck",
    tasks: [
      "Relevante Dateien mit Read/Grep lesen — Lücken am echten Code finden.",
      "Logikfehler und Widersprüche beheben — ggf. Write/StrReplace.",
      "Treue zur Nutzeranfrage prüfen.",
    ],
  },
  "easy_thinking:3": {
    title: "Verifikation & Final",
    tasks: [
      "Pass-2-Fixes mit Shell test/build — nichts Kaputtes hinterlassen.",
      "Fehlenden Code mit Write/StrReplace ergänzen, erneut verifizieren.",
      "Finale Antwort + geänderte Dateien + Test/Build-Zusammenfassung.",
    ],
  },
  "medium_thinking:1": {
    title: "Erster Entwurf",
    tasks: ["Erste Antwort und Basisplan.", "Bei Code: betroffene Dateien listen."],
  },
  "medium_thinking:2": {
    title: "Lückenanalyse",
    tasks: [
      "Codebase mit Read/Grep scannen — genau verstehen, was der Nutzer will.",
      "Übersprungene Schritte, Dateien, Abhängigkeiten finden.",
    ],
  },
  "medium_thinking:3": {
    title: "Code- / Logik-Review",
    tasks: [
      "Echten Code mit Read/Grep lesen — Bugs, Sicherheit, Edge Cases, Performance.",
      "Ohne Code: Logik-Review — Argumentkette, Schlussfolgerungen.",
      "Review in Antwort widerspiegeln (kein Meta, echte Korrekturen).",
    ],
  },
  "medium_thinking:4": {
    title: "Implementierung",
    tasks: [
      "Änderungen mit Write/StrReplace/Delete anwenden.",
      "Neue Dateien anlegen, bestehende bearbeiten oder löschen.",
      "Kein Mock/Placeholder. Stilles Self-Review, in Code widerspiegeln.",
    ],
  },
  "medium_thinking:5": {
    title: "Verifikation & Final",
    tasks: [
      "Test/Build via Shell — nichts Kaputtes hinterlassen.",
      "Risiken, Annahmen, Unbekanntes nennen.",
      "Finale Antwort: klare Zusammenfassung + geänderte/neue Dateien.",
    ],
  },
  "more_thinking:5": {
    title: "Gegenargument",
    tasks: [
      "Steel-man Gegenargument aufbauen.",
      "Implementierung mit Read gegen Gegenargument testen.",
      "Ggf. mit Write korrigieren.",
    ],
  },
  "more_thinking:6": {
    title: "Struktur & Nebenwirkungen",
    tasks: [
      "Struktur optimieren — Dateiorganisation, Lesbarkeit.",
      "Zweitrangige Effekte berechnen, Code ggf. aktualisieren.",
      "Edge Cases im Code widerspiegeln.",
    ],
  },
  "more_thinking:7": {
    title: "Verifikation & finale Synthese",
    tasks: [
      "Test/Build ausführen.",
      "Bestes aller Pässe zusammenführen.",
      "Finale Antwort + Dateiänderungsübersicht.",
    ],
  },
  "max_thinking:1": {
    title: "Erster Entwurf",
    tasks: ["Erste Antwort, Dateiplan."],
  },
  "max_thinking:2": {
    title: "Lückenanalyse",
    tasks: ["Codebase mit Read/Grep erkunden.", "Übersprungene Themen finden."],
  },
  "max_thinking:3": {
    title: "Erste Prinzipien",
    tasks: ["Annahmen abtragen.", "Architektur mit Read validieren."],
  },
  "max_thinking:4": {
    title: "Code- / Logik-Review",
    tasks: ["Code-Review mit Read/Grep.", "Bugs, Sicherheit, Edge Cases."],
  },
  "max_thinking:5": {
    title: "Tiefes Code-Review",
    tasks: [
      "Zeile für Zeile mit Read prüfen.",
      "SSRF, Auth, Input-Validation, Race Conditions.",
    ],
  },
  "max_thinking:6": {
    title: "Implementierung",
    tasks: [
      "Alle Änderungen mit Write/StrReplace/Delete anwenden.",
      "Stille interne Debatte — Teufelsadvokat, in Code widerspiegeln.",
    ],
  },
  "max_thinking:7": {
    title: "Gegenargument & Alternativen",
    tasks: ["Alternative Implementierungen bewerten.", "Code ggf. aktualisieren."],
  },
  "max_thinking:8": {
    title: "Expertenpanel",
    tasks: [
      "Ingenieur/Sicherheit/Produkt-Perspektive — Code erneut mit Read lesen.",
      "Lücken mit Write schließen.",
    ],
  },
  "max_thinking:9": {
    title: "Struktur & Umsetzbarkeit",
    tasks: ["Dateistruktur optimieren.", "Konkreter, umsetzbarer finaler Code."],
  },
  "max_thinking:10": {
    title: "Verifikation & Final",
    tasks: [
      "Test, Build, Lint ausführen.",
      "Risiko/Unbekannt-Karte.",
      "Finale Antwort + Übersicht aller Dateiänderungen.",
    ],
  },
};

const AR: Record<string, PassTextEntry> = {
  "easy_thinking:1": {
    title: "مسودة أولى",
    tasks: [
      "قدّم إجابة أولى مباشرة وواضحة وقابلة للتطبيق.",
      "لمهام الكود: خطّط باختصار للملفات المتأثرة.",
    ],
  },
  "easy_thinking:2": {
    title: "فحص الفجوات والمنطق",
    tasks: [
      "اقرأ الملفات ذات الصلة بـ Read/Grep — اعثر على الفجوات مقابل الكود الحقيقي.",
      "صحّح أخطاء المنطق والتناقضات — طبّق بـ Write/StrReplace إن لزم.",
      "تحقق من الالتزام بطلب المستخدم.",
    ],
  },
  "easy_thinking:3": {
    title: "التحقق والنهائي",
    tasks: [
      "شغّل test/build عبر Shell لتصحيحات Pass 2 — لا تترك حالة مكسورة.",
      "أكمل الكود الناقص بـ Write/StrReplace، ثم تحقق مرة أخرى.",
      "إجابة نهائية + قائمة الملفات المتغيرة + ملخص test/build.",
    ],
  },
  "medium_thinking:1": {
    title: "مسودة أولى",
    tasks: ["قدّم الإجابة الأولى والخطة الأساسية.", "لمهام الكود: اذكر الملفات المتأثرة."],
  },
  "medium_thinking:2": {
    title: "تحليل الفجوات",
    tasks: [
      "امسح codebase بـ Read/Grep — افهم بالضبط ما يريده المستخدم.",
      "اعثر على خطوات أو ملفات أو تبعيات فائتة.",
    ],
  },
  "medium_thinking:3": {
    title: "مراجعة الكود / المنطق",
    tasks: [
      "اقرأ الكود الحقيقي بـ Read/Grep — bugs، أمان، edge cases، أداء.",
      "بدون كود: مراجعة منطق — سلسلة الحجج والاستنتاجات.",
      "اعكس المراجعة في الإجابة (ليس meta، تصحيحات فعلية).",
    ],
  },
  "medium_thinking:4": {
    title: "التنفيذ",
    tasks: [
      "طبّق التغييرات بـ Write/StrReplace/Delete.",
      "أنشئ ملفات جديدة أو عدّل أو احذف الموجودة حسب الحاجة.",
      "لا mock ولا placeholder. مراجعة ذاتية صامتة، انعكس في الكود.",
    ],
  },
  "medium_thinking:5": {
    title: "التحقق والنهائي",
    tasks: [
      "شغّل test/build عبر Shell — لا تترك حالة مكسورة.",
      "اذكر المخاطر والافتراضات والمجهول.",
      "إجابة نهائية: ملخص واضح + قائمة الملفات المتغيرة/الجديدة.",
    ],
  },
  "more_thinking:5": {
    title: "حجة مضادة",
    tasks: [
      "ابنِ حجة مضادة steel-man.",
      "اختبر التنفيذ الحالي مقابلها بـ Read.",
      "صحّح بـ Write إن لزم.",
    ],
  },
  "more_thinking:6": {
    title: "البنية والآثار الجانبية",
    tasks: [
      "حسّن البنية — تنظيم الملفات، القراءة.",
      "احسب الآثار من الدرجة الثانية، حدّث الكود إن لزم.",
      "اعكس edge cases في الكود.",
    ],
  },
  "more_thinking:7": {
    title: "التحقق والتركيب النهائي",
    tasks: [
      "شغّل test/build.",
      "ادمج أفضل ما في كل passes.",
      "إجابة نهائية + ملخص تغييرات الملفات.",
    ],
  },
  "max_thinking:1": {
    title: "مسودة أولى",
    tasks: ["إجابة أولى، خطة ملفات."],
  },
  "max_thinking:2": {
    title: "تحليل الفجوات",
    tasks: ["استكشف codebase بـ Read/Grep.", "اعثر على مواضيع فائتة."],
  },
  "max_thinking:3": {
    title: "المبادئ الأولى",
    tasks: ["فكّك الافتراضات.", "تحقق من البنية الحالية بـ Read."],
  },
  "max_thinking:4": {
    title: "مراجعة الكود / المنطق",
    tasks: ["مراجعة كود بـ Read/Grep.", "Bugs، أمان، edge cases."],
  },
  "max_thinking:5": {
    title: "مراجعة كود عميقة",
    tasks: [
      "مراجعة سطر بسطر بـ Read.",
      "SSRF، auth، input validation، race conditions.",
    ],
  },
  "max_thinking:6": {
    title: "التنفيذ",
    tasks: [
      "طبّق كل التغييرات بـ Write/StrReplace/Delete.",
      "نقاش داخلي صامت — محامي الشيطان، انعكس في الكود.",
    ],
  },
  "max_thinking:7": {
    title: "حجة مضادة وبدائل",
    tasks: ["قيّم تنفيذات بديلة.", "حدّث الكود إن لزم."],
  },
  "max_thinking:8": {
    title: "لوحة خبراء",
    tasks: [
      "منظور مهندس/أمان/منتج — أعد قراءة الكود بـ Read.",
      "أغلق الفجوات بـ Write.",
    ],
  },
  "max_thinking:9": {
    title: "البنية وقابلية التطبيق",
    tasks: ["حسّن هيكل الملفات.", "حالة كود نهائية ملموسة وقابلة للتطبيق."],
  },
  "max_thinking:10": {
    title: "التحقق والنهائي",
    tasks: [
      "شغّل test و build و lint.",
      "خريطة مخاطر/مجهول.",
      "إجابة نهائية + ملخص كل تغييرات الملفات.",
    ],
  },
};

const PASS_TEXTS: Record<Locale, Record<string, PassTextEntry>> = {
  tr: TR,
  en: EN,
  de: DE,
  ar: AR,
};

/** more_thinking 1–4 medium ile aynı metinleri kullanır */
function resolvePassText(
  locale: Locale,
  mode: ThinkingMode,
  pass: number,
): PassTextEntry {
  const key = passKey(mode, pass);
  const bundle = PASS_TEXTS[locale];
  const fallback = PASS_TEXTS.tr;
  if (bundle[key]) return bundle[key];
  if (mode === "more_thinking" && pass <= 4) {
    return bundle[passKey("medium_thinking", pass)] ?? fallback[passKey("medium_thinking", pass)];
  }
  return fallback[key];
}

export function getPassText(
  locale: Locale,
  mode: ThinkingMode,
  pass: number,
): PassTextEntry {
  return resolvePassText(locale, mode, pass);
}
