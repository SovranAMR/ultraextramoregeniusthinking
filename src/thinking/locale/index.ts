export type Locale = "tr" | "en" | "de" | "ar";

export type LocaleModeId =
  | "easy_thinking"
  | "medium_thinking"
  | "more_thinking"
  | "max_thinking";

export const SUPPORTED_LOCALES: Locale[] = ["tr", "en", "de", "ar"];

export interface UseCaseSnippet {
  id: string;
  trigger: RegExp;
  suggestedMode: LocaleModeId;
}

export interface RejectionBundle {
  metaTitle: (pass: number) => string;
  metaIntro: string;
  problemsLabel: string;
  nowDo: string;
  stagnationTitle: (pass: number) => string;
  stagnationReadCopy: string;
  stagnationSame: string;
  stagnationResubmit: string;
}

export type ExecutionKindKey = "none" | "read" | "write" | "verify";

export interface PromptBundle {
  outputRule: string;
  taskKind: { creative: string; analysis: string; code: string };
  chatContextHeader: string;
  passFocusHeader: (title: string) => string;
  executionLayerRule: string;
  passRoadmapHeader: string;
  submitAnswerRule: string;
  flowHeader: string;
  flowStep1: string;
  flowStep2: (sessionId: string) => string;
  flowStep3: (total: number) => string;
  applyPassNow: string;
  passSummaryHeader: (pass: number) => string;
  nextStepHeader: string;
  nextStepContinue: (nextPass: number, remaining: number) => string;
  nextStepFinal: string;
  completionTitle: string;
  completionIntro: (total: number) => string;
  completionRulesHeader: string;
  completionRules: string[];
  finalAnswerHeader: string;
  executionHints: Record<ExecutionKindKey, string>;
  antiStagnationRule: string;
  basiret: {
    code: string;
    verifyBeforeNext: string;
    readBeforeNext: string;
    creative: string;
    writeExtra: string;
  };
  firstDraftTitle: string;
  refinementTitle: string;
  topicLabel: string;
  modeLabel: string;
}

export interface LocaleBundle {
  code: Locale;
  modeAliases: Record<string, LocaleModeId>;
  nlModePatterns: RegExp[];
  stripPatterns: RegExp[];
  useCaseSnippets: UseCaseSnippet[];
  detectHints: RegExp[];
  rejection: RejectionBundle;
  serverInstructions: string;
}

const USE_CASE_MATRIX: UseCaseSnippet[] = [
  {
    id: "bug_fix",
    trigger:
      /bu test neden fail|why (?:does )?this test fail|warum schlägt dieser test fehl|لماذا يفشل هذا الاختبار/i,
    suggestedMode: "medium_thinking",
  },
  {
    id: "refactor",
    trigger: /bu modülü toparla|refactor this module|dieses modul refaktorieren|أعد هيكلة هذا الوحدة/i,
    suggestedMode: "more_thinking",
  },
  {
    id: "migration",
    trigger: /postgres jsonb geçiş|postgres jsonb migration/i,
    suggestedMode: "max_thinking",
  },
  { id: "review", trigger: /auth bypass var mı|auth bypass|مراجعة auth/i, suggestedMode: "max_thinking" },
  {
    id: "incident",
    trigger: /prod 500 root cause|prod.*500.*root cause|prod.*500.*ursache/i,
    suggestedMode: "max_thinking",
  },
  {
    id: "feature",
    trigger: /webhook retry ekle|add webhook retry|webhook retry hinzufügen|إضافة webhook retry/i,
    suggestedMode: "medium_thinking",
  },
  {
    id: "analysis",
    trigger: /monolith mi micro mu|monolith vs micro|monolith oder micro/i,
    suggestedMode: "more_thinking",
  },
];

const SERVER_INSTRUCTIONS_TR = [
  "ULTRA THINKING MCP — cevap kalitesini pass pass artırır.",
  "",
  "CHAT BAĞLAMI (KRİTİK):",
  "MCP sunucusu chat geçmişini OTOMATİK görmez.",
  "Agent (sen) chat geçmişini görürsün — think çağırırken conversation_context'e ÖZET geçmek ZORUNLU.",
  "Kullanıcı sadece 'max de düşün' dediyse soruyu tekrar sorma; bağlamı kendin aktar.",
  "",
  "KULLANICI DOĞAL DİL İLE MOD SEÇER:",
  '• "düşünme modu mcp easy/medium/more/max de düşün" (+ isteğe bağlı soru)',
  "",
  "Kullanıcı mod + düşün dediğinde HEMEN think çağır.",
  "Modu mesajdan çıkar. Hangi mod diye sorma.",
  "",
  "EXECUTION (agent workspace — MCP'de write/read tool YOK):",
  "• Read pass → Read/Grep/SemanticSearch ile gerçek dosyaları oku",
  "• Write pass → Write/StrReplace/Delete ile uygula, mock yasak",
  "• Verify pass → Shell ile test/build, dosya özetini finalde ver",
  "",
  "MODLAR:",
  "• easy=3: taslak → read/eksik → write/final",
  "• medium=5: taslak → read → kod review → write/uygula → verify/final",
  "• more=7: medium + karşı argüman → write/yapı → verify/sentez",
  "• max=10: + derin review, uzman paneli, çoklu write/verify",
  "",
  "AKIŞ:",
  "1. think(user_message, conversation_context) → Pass 1",
  "2. Pass işini bitir (Read/Write/Shell) → think_next(session_id, somut_özet)",
  "3. Bitene kadar tekrarla → kullanıcıya SADECE final cevap",
  "",
  "think_next KURALLARI (kesin):",
  "- answer = iş logu DEĞİL: 'Plan:', 'Read:', 'Kod review:' ile başlama.",
  "- answer = bu pass'te ne yapıldı + hangi dosya + ne değişti.",
  "- Her pass arasında gerçek iş yap; birden fazla think_next'i aynı turda çağırma.",
  "- ultra-thinking aktifken ctx_forge / başka implementation MCP ÇAĞIRMA.",
  "",
  "KURALLAR:",
  "- Chain-of-thought gösterme.",
  "- Anti-stagnation: her pass EN AZ 1 somut iyileştirme zorunlu.",
  "- Meta log think_next'e gönderilirse MCP RED eder, pass ilerlemez.",
].join("\n");

const SERVER_INSTRUCTIONS_EN = [
  "ULTRA THINKING MCP — improves answer quality pass by pass.",
  "",
  "CHAT CONTEXT (CRITICAL):",
  "The MCP server does NOT see chat history automatically.",
  "You (the agent) see chat history — you MUST pass a SUMMARY in conversation_context when calling think.",
  "If the user only said 'think in max mode', do not re-ask the question; carry context yourself.",
  "",
  "USER SELECTS MODE IN NATURAL LANGUAGE:",
  '• "think in easy/medium/more/max mode" (+ optional question)',
  "",
  "When the user says mode + think, call think IMMEDIATELY.",
  "Extract mode from the message. Do not ask which mode.",
  "",
  "EXECUTION (agent workspace — MCP has NO write/read tools):",
  "• Read pass → read real files with Read/Grep/SemanticSearch",
  "• Write pass → apply with Write/StrReplace/Delete, no mocks",
  "• Verify pass → test/build via Shell, file summary in final answer",
  "",
  "MODES:",
  "• easy=3: draft → read/gaps → write/final",
  "• medium=5: draft → read → code review → write/apply → verify/final",
  "• more=7: medium + counter-argument → write/structure → verify/synthesis",
  "• max=10: + deep review, expert panel, multiple write/verify",
  "",
  "FLOW:",
  "1. think(user_message, conversation_context) → Pass 1",
  "2. Finish pass work (Read/Write/Shell) → think_next(session_id, concrete_summary)",
  "3. Repeat until done → present ONLY the final answer to the user",
  "",
  "think_next RULES (mandatory):",
  "- answer is NOT a work log: do NOT start with 'Plan:', 'Read:', 'Code review:'.",
  "- answer = what was done this pass + which file + what changed.",
  "- Real work between passes; do not call multiple think_next in one turn.",
  "- Do NOT call ctx_forge or other implementation MCPs while ultra-thinking is active.",
  "",
  "RULES:",
  "- Do not show chain-of-thought.",
  "- Anti-stagnation: each pass requires AT LEAST 1 concrete improvement.",
  "- Meta log sent to think_next is RED-rejected; pass does not advance.",
].join("\n");

const REJECTION_TR: RejectionBundle = {
  metaTitle: (pass) => `# RED — Pass ${pass} cevabı kabul edilmedi`,
  metaIntro: "Gönderdiğin metin **iş logu/meta** gibi görünüyor, teslim özeti değil.",
  problemsLabel: "Sorunlar:",
  nowDo:
    "**Şimdi:** Bu pass'in işini yap (gerekirse Read/Write/Shell), sonra think_next'i **somut özet** ile tekrar çağır.",
  stagnationTitle: (pass) => `# RED — Pass ${pass} cevabı öncekiyle aynı`,
  stagnationReadCopy:
    "Anti-stagnation: read pass önceki pass ile içerik tekrarı — dosya referansı yeterli değil.",
  stagnationSame: "Anti-stagnation: önceki pass ile birebir aynı cevap gönderilemez.",
  stagnationResubmit:
    "Bu pass'in odağına göre somut yeni iyileştirme yap, sonra think_next tekrar çağır.",
};

const REJECTION_EN: RejectionBundle = {
  metaTitle: (pass) => `# RED — Pass ${pass} answer rejected`,
  metaIntro: "Your text looks like a **work log/meta**, not a deliverable summary.",
  problemsLabel: "Issues:",
  nowDo:
    "**Now:** Complete this pass (Read/Write/Shell if needed), then call think_next again with a **concrete summary**.",
  stagnationTitle: (pass) => `# RED — Pass ${pass} answer identical to previous`,
  stagnationReadCopy:
    "Anti-stagnation: read pass repeats previous content — file reference alone is not enough.",
  stagnationSame: "Anti-stagnation: cannot submit the exact same answer as the previous pass.",
  stagnationResubmit:
    "Make a concrete new improvement for this pass focus, then call think_next again.",
};

const REJECTION_DE: RejectionBundle = {
  metaTitle: (pass) => `# RED — Pass ${pass} Antwort abgelehnt`,
  metaIntro: "Dein Text wirkt wie ein **Arbeitslog/Meta**, nicht wie eine Lieferzusammenfassung.",
  problemsLabel: "Probleme:",
  nowDo:
    "**Jetzt:** Pass abschließen (Read/Write/Shell falls nötig), dann think_next mit **konkreter Zusammenfassung** erneut aufrufen.",
  stagnationTitle: (pass) => `# RED — Pass ${pass} Antwort identisch mit vorheriger`,
  stagnationReadCopy:
    "Anti-stagnation: Read-Pass wiederholt vorherigen Inhalt — Dateireferenz allein reicht nicht.",
  stagnationSame: "Anti-stagnation: identische Antwort wie im vorherigen Pass ist nicht erlaubt.",
  stagnationResubmit:
    "Konkrete neue Verbesserung für diesen Pass-Fokus, dann think_next erneut aufrufen.",
};

const PROMPT_TR: PromptBundle = {
  outputRule: [
    "**ÇIKTI KURALI (kesin):**",
    "- Sadece iyileştirilmiş cevabı döndür.",
    "- İç review sürecini dökme — sonucu ve dosya değişikliklerini göster.",
    "- 'Pass 3'te şunu düzelttim' gibi meta yasak.",
  ].join("\n"),
  taskKind: {
    creative:
      "**Görev tipi:** yaratıcı/görsel — kod review pass'leri atlandı, görsel detay odaklı plan.",
    analysis: "**Görev tipi:** analiz — read/verify ağırlıklı.",
    code: "**Görev tipi:** kod — read/write/verify döngüsü.",
  },
  chatContextHeader: "## Chat bağlamı",
  passFocusHeader: (title) => `## Bu pass'in odağı: ${title}`,
  executionLayerRule: [
    "**Execution katmanı (kesin):**",
    "- MCP dosya okumaz/yazmaz — agent workspace araçlarını kullanır.",
    "- Read pass → Read/Grep/SemanticSearch",
    "- Write pass → Write/StrReplace/Delete",
    "- Verify pass → Shell (test/build)",
    "- İç review sessiz kalır; kullanıcıya sadece sonuç ve dosya özeti gider.",
  ].join("\n"),
  passRoadmapHeader: "## Pass yol haritası",
  submitAnswerRule: [
    "**think_next answer formatı (kesin):**",
    "- İş logu YASAK: 'Plan:', 'Read:', 'Kod review:', 'İlk prensipler:' ile BAŞLAMA.",
    "- Bu pass'te NE YAPILDI + NE DEĞİŞTİ + hangi dosya — somut özet.",
    "- Örnek: 'test/foo.html oluşturuldu (320 satır). 3 katman SVG train, 58 ocellus eklendi.'",
    "- Önce pass işini bitir (Read/Write/Shell), SONRA think_next çağır.",
    "- Aynı anda birden fazla think_next YASAK — her pass arasında gerçek iş yap.",
    "- ultra-thinking aktifken başka MCP (forge, inspect) ÇAĞIRMA.",
  ].join("\n"),
  flowHeader: "## Akış",
  flowStep1: "1. Bu pass'i tamamla (gerekirse agent Read/Write kullan)",
  flowStep2: (id) =>
    `2. Somut özet → \`think_next\` (session_id: "${id}") — meta log YASAK`,
  flowStep3: (total) =>
    `3. ${total} pass bitene kadar devam — pass'leri toplu/paralel gönderme`,
  applyPassNow: "Şimdi Pass 1'i uygula.",
  passSummaryHeader: (pass) => `## Pass ${pass} özeti`,
  nextStepHeader: "## Sonraki adım",
  nextStepContinue: (nextPass, remaining) =>
    `Önce Pass ${nextPass} işini yap (Read/Write/Shell), sonra \`think_next\`. Kalan: **${remaining}**. Paralel think_next YASAK.`,
  nextStepFinal: "Son pass — işi bitir → `think_next` çağır.",
  completionTitle: "TAMAMLANDI",
  completionIntro: (total) =>
    `${total} pass tamamlandı. Kullanıcıya **sadece** final cevabı sun.`,
  completionRulesHeader: "## Kurallar",
  completionRules: [
    "- Pass geçmişi, review süreci, MCP meta gösterme.",
    "- Kod göreviyse: değişen/oluşan dosyaları final cevapta listele.",
    "- Sadece temiz final cevap.",
  ],
  finalAnswerHeader: "## KULLANICIYA SUNULACAK CEVAP",
  executionHints: {
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
  },
  antiStagnationRule: [
    "**Anti-stagnation (kesin):**",
    "- Önceki pass ile aynı cevabı kopyala-yapıştır YASAK.",
    "- Bu pass'in odağına göre EN AZ 1 somut iyileştirme zorunlu.",
    "- Write pass'te gerçek dosya değişikliği yoksa pass başarısız sayılır.",
  ].join("\n"),
  basiret: {
    code: [
      "**Basiret (adaptif yargı):** Pass bittikten sonra durup değerlendir.",
      "- Eksik, hata veya edge case → genişlet veya düzelt.",
      "- Gereksiz abstraction veya şişkin diff → sadeleştir.",
      "- Scope creep veya fazla dosya → azalt.",
      "Yön bu pass'in bulgusundan çıkar — önceden 'her zaman ekle' veya 'her zaman çıkar' yok.",
    ].join("\n"),
    verifyBeforeNext: [
      "**Verify-before-next (kesin):** Shell ile test/build çalıştır; çıktıyı özetle, sonra think_next.",
      "Sayısız 'test geçti/build ok' yeterli değil — kaç test, hangi dosya, ne doğrulandı yaz.",
    ].join("\n"),
    readBeforeNext:
      "**Read-before-next:** Etkilenen dosyaları Read/Grep ile oku; diske bakmadan think_next çağırma.",
    creative:
      "**Basiret (görsel):** Çıktıyı Read ile aç, gör/oku — detay eksik mi, fazla mı; bulguya göre karar ver.",
    writeExtra:
      "**Write basiret:** Diff'i değerlendir — gerekli mi, yoksa sadeleştirilebilir mi?",
  },
  firstDraftTitle: "İlk Taslak",
  refinementTitle: "İyileştirme",
  topicLabel: "**Konu:**",
  modeLabel: "**Mod:**",
};

const PROMPT_EN: PromptBundle = {
  outputRule: [
    "**OUTPUT RULE (mandatory):**",
    "- Return only the improved answer.",
    "- Do not dump internal review — show results and file changes.",
    "- Meta like 'In Pass 3 I fixed…' is forbidden.",
  ].join("\n"),
  taskKind: {
    creative:
      "**Task kind:** creative/visual — code review passes skipped, visual detail plan.",
    analysis: "**Task kind:** analysis — read/verify heavy.",
    code: "**Task kind:** code — read/write/verify cycle.",
  },
  chatContextHeader: "## Chat context",
  passFocusHeader: (title) => `## This pass focus: ${title}`,
  executionLayerRule: [
    "**Execution layer (mandatory):**",
    "- MCP does not read/write files — use agent workspace tools.",
    "- Read pass → Read/Grep/SemanticSearch",
    "- Write pass → Write/StrReplace/Delete",
    "- Verify pass → Shell (test/build)",
    "- Internal review stays silent; user sees only results and file summary.",
  ].join("\n"),
  passRoadmapHeader: "## Pass roadmap",
  submitAnswerRule: [
    "**think_next answer format (mandatory):**",
    "- Work log FORBIDDEN: do NOT start with 'Plan:', 'Read:', 'Code review:', 'First principles:'.",
    "- WHAT was done + WHAT changed + which file — concrete summary.",
    "- Example: 'Created test/foo.html (320 lines). 3-layer SVG train, 58 ocelli added.'",
    "- Finish pass work (Read/Write/Shell) FIRST, then call think_next.",
    "- Multiple think_next in one turn FORBIDDEN — real work between passes.",
    "- Do NOT call other MCPs (forge, inspect) while ultra-thinking is active.",
  ].join("\n"),
  flowHeader: "## Flow",
  flowStep1: "1. Complete this pass (use agent Read/Write if needed)",
  flowStep2: (id) =>
    `2. Concrete summary → \`think_next\` (session_id: "${id}") — meta log FORBIDDEN`,
  flowStep3: (total) =>
    `3. Continue until ${total} passes done — do not batch/parallelize passes`,
  applyPassNow: "Apply Pass 1 now.",
  passSummaryHeader: (pass) => `## Pass ${pass} summary`,
  nextStepHeader: "## Next step",
  nextStepContinue: (nextPass, remaining) =>
    `Do Pass ${nextPass} work (Read/Write/Shell), then \`think_next\`. Remaining: **${remaining}**. Parallel think_next FORBIDDEN.`,
  nextStepFinal: "Final pass — finish work → call `think_next`.",
  completionTitle: "COMPLETED",
  completionIntro: (total) =>
    `${total} passes done. Present **only** the final answer to the user.`,
  completionRulesHeader: "## Rules",
  completionRules: [
    "- Do not show pass history, review process, or MCP meta.",
    "- For code tasks: list changed/created files in the final answer.",
    "- Clean final answer only.",
  ],
  finalAnswerHeader: "## ANSWER FOR THE USER",
  executionHints: {
    none: "No file changes needed this pass — stay focused on thinking/answer.",
    read: [
      "**Execution (agent):** Read real files with Read / Grep / SemanticSearch.",
      "Do not imagine code or config — read from disk, then call think_next.",
    ].join("\n"),
    write: [
      "**Execution (agent):** Apply changes with Write / StrReplace / Delete.",
      "No mock, placeholder, or TODO — real code/files. Then call think_next.",
    ].join("\n"),
    verify: [
      "**Execution (agent):** Run test/build via Shell (npm test, tsc, etc.).",
      "Do not leave broken state. Summarize changed files in the final answer.",
    ].join("\n"),
  },
  antiStagnationRule: [
    "**Anti-stagnation (mandatory):**",
    "- Copy-paste the same answer as the previous pass FORBIDDEN.",
    "- At least 1 concrete improvement required for this pass focus.",
    "- Write pass without real file change counts as failed pass.",
  ].join("\n"),
  basiret: {
    code: [
      "**Judgment (adaptive):** After the pass, pause and evaluate.",
      "- Missing piece, bug, or edge case → expand or fix.",
      "- Unnecessary abstraction or bloated diff → simplify.",
      "- Scope creep or too many files → reduce.",
      "Direction comes from this pass's findings — no preset 'always add' or 'always remove'.",
    ].join("\n"),
    verifyBeforeNext: [
      "**Verify-before-next (mandatory):** Run test/build via Shell; summarize output, then think_next.",
      "Vague 'tests passed/build ok' is not enough — state count, file, what was verified.",
    ].join("\n"),
    readBeforeNext:
      "**Read-before-next:** Read affected files with Read/Grep; do not call think_next without checking disk.",
    creative:
      "**Judgment (visual):** Open output with Read, inspect — missing or excess detail; decide from findings.",
    writeExtra:
      "**Write judgment:** Evaluate the diff — necessary, or can it be simplified?",
  },
  firstDraftTitle: "First Draft",
  refinementTitle: "Refinement",
  topicLabel: "**Topic:**",
  modeLabel: "**Mode:**",
};

const PROMPT_DE: PromptBundle = {
  outputRule: [
    "**AUSGABEREGEL (verbindlich):**",
    "- Nur die verbesserte Antwort zurückgeben.",
    "- Kein internes Review ausgeben — Ergebnis und Dateiänderungen zeigen.",
    "- Meta wie 'In Pass 3 habe ich…' ist verboten.",
  ].join("\n"),
  taskKind: {
    creative:
      "**Aufgabentyp:** kreativ/visual — Code-Review-Pässe übersprungen, visueller Detailplan.",
    analysis: "**Aufgabentyp:** Analyse — read/verify schwer.",
    code: "**Aufgabentyp:** Code — read/write/verify-Zyklus.",
  },
  chatContextHeader: "## Chat-Kontext",
  passFocusHeader: (title) => `## Fokus dieses Pass: ${title}`,
  executionLayerRule: [
    "**Execution-Schicht (verbindlich):**",
    "- MCP liest/schreibt keine Dateien — Agent-Workspace-Tools nutzen.",
    "- Read pass → Read/Grep/SemanticSearch",
    "- Write pass → Write/StrReplace/Delete",
    "- Verify pass → Shell (test/build)",
    "- Internes Review bleibt still; Nutzer sieht nur Ergebnis und Dateiübersicht.",
  ].join("\n"),
  passRoadmapHeader: "## Pass-Roadmap",
  submitAnswerRule: [
    "**think_next Antwortformat (verbindlich):**",
    "- Arbeitslog VERBOTEN: nicht mit 'Plan:', 'Read:', 'Code review:' beginnen.",
    "- WAS gemacht + WAS geändert + welche Datei — konkrete Zusammenfassung.",
    "- Pass-Arbeit zuerst (Read/Write/Shell), DANN think_next aufrufen.",
    "- Mehrere think_next in einem Zug VERBOTEN — echte Arbeit zwischen Pässen.",
    "- Keine anderen MCPs (forge, inspect) während ultra-thinking aktiv.",
  ].join("\n"),
  flowHeader: "## Ablauf",
  flowStep1: "1. Diesen Pass abschließen (ggf. Agent Read/Write nutzen)",
  flowStep2: (id) =>
    `2. Konkrete Zusammenfassung → \`think_next\` (session_id: "${id}") — Meta-Log VERBOTEN`,
  flowStep3: (total) =>
    `3. Weiter bis ${total} Pässe fertig — Pässe nicht bündeln/parallelisieren`,
  applyPassNow: "Pass 1 jetzt anwenden.",
  passSummaryHeader: (pass) => `## Pass ${pass} Zusammenfassung`,
  nextStepHeader: "## Nächster Schritt",
  nextStepContinue: (nextPass, remaining) =>
    `Pass ${nextPass} erledigen (Read/Write/Shell), dann \`think_next\`. Verbleibend: **${remaining}**. Paralleles think_next VERBOTEN.`,
  nextStepFinal: "Letzter Pass — Arbeit abschließen → `think_next` aufrufen.",
  completionTitle: "ABGESCHLOSSEN",
  completionIntro: (total) =>
    `${total} Pässe fertig. Dem Nutzer **nur** die finale Antwort präsentieren.`,
  completionRulesHeader: "## Regeln",
  completionRules: [
    "- Keine Pass-Historie, Review-Prozess oder MCP-Meta zeigen.",
    "- Bei Code-Aufgaben: geänderte/neue Dateien in der finalen Antwort listen.",
    "- Nur saubere finale Antwort.",
  ],
  finalAnswerHeader: "## ANTWORT FÜR DEN NUTZER",
  executionHints: {
    none: "Keine Dateiänderung nötig — Denken/Antwort im Fokus.",
    read: [
      "**Execution (Agent):** Echte Dateien mit Read / Grep / SemanticSearch lesen.",
      "Code nicht erfinden — von Disk lesen, dann think_next aufrufen.",
    ].join("\n"),
    write: [
      "**Execution (Agent):** Änderungen mit Write / StrReplace / Delete anwenden.",
      "Kein Mock, Placeholder, TODO — echter Code/Dateien. Dann think_next.",
    ].join("\n"),
    verify: [
      "**Execution (Agent):** Test/Build via Shell (npm test, tsc, etc.).",
      "Nichts Kaputtes hinterlassen. Geänderte Dateien in finaler Antwort zusammenfassen.",
    ].join("\n"),
  },
  antiStagnationRule: [
    "**Anti-stagnation (verbindlich):**",
    "- Gleiche Antwort wie vorheriger Pass kopieren VERBOTEN.",
    "- Mindestens 1 konkrete Verbesserung für diesen Pass-Fokus.",
    "- Write pass ohne echte Dateiänderung gilt als fehlgeschlagen.",
  ].join("\n"),
  basiret: {
    code: [
      "**Urteilsvermögen (adaptiv):** Nach dem Pass pausieren und bewerten.",
      "- Lücke, Bug oder Edge Case → erweitern oder korrigieren.",
      "- Unnötige Abstraktion oder aufgeblähter Diff → vereinfachen.",
      "- Scope creep oder zu viele Dateien → reduzieren.",
      "Richtung aus den Befunden dieses Pass — kein festes 'immer hinzufügen' oder 'immer entfernen'.",
    ].join("\n"),
    verifyBeforeNext: [
      "**Verify-before-next (verbindlich):** Test/Build via Shell; Ausgabe zusammenfassen, dann think_next.",
      "Vages 'Tests ok/build ok' reicht nicht — Anzahl, Datei, was verifiziert wurde.",
    ].join("\n"),
    readBeforeNext:
      "**Read-before-next:** Betroffene Dateien mit Read/Grep lesen; think_next ohne Disk-Check nicht aufrufen.",
    creative:
      "**Urteilsvermögen (visuell):** Ausgabe mit Read öffnen, prüfen — fehlende oder überflüssige Details; aus Befunden entscheiden.",
    writeExtra:
      "**Write-Urteil:** Diff bewerten — nötig oder vereinfachbar?",
  },
  firstDraftTitle: "Erster Entwurf",
  refinementTitle: "Verfeinerung",
  topicLabel: "**Thema:**",
  modeLabel: "**Modus:**",
};

const PROMPT_AR: PromptBundle = {
  outputRule: [
    "**قاعدة الإخراج (إلزامي):**",
    "- أعد الإجابة المحسّنة فقط.",
    "- لا تُظهر مراجعة داخلية — اعرض النتيجة وتغييرات الملفات.",
    "- meta مثل 'في Pass 3 أصلحت…' ممنوع.",
  ].join("\n"),
  taskKind: {
    creative: "**نوع المهمة:** إبداعي/مرئي — تخطّي passes مراجعة الكود، خطة تفاصيل مرئية.",
    analysis: "**نوع المهمة:** تحليل — read/verify بكثافة.",
    code: "**نوع المهمة:** كود — دورة read/write/verify.",
  },
  chatContextHeader: "## سياق المحادثة",
  passFocusHeader: (title) => `## تركيز هذا pass: ${title}`,
  executionLayerRule: [
    "**طبقة التنفيذ (إلزامي):**",
    "- MCP لا يقرأ/يكتب ملفات — استخدم أدوات workspace للوكيل.",
    "- Read pass → Read/Grep/SemanticSearch",
    "- Write pass → Write/StrReplace/Delete",
    "- Verify pass → Shell (test/build)",
    "- المراجعة الداخلية صامتة؛ المستخدم يرى النتيجة وملخص الملفات فقط.",
  ].join("\n"),
  passRoadmapHeader: "## خارطة passes",
  submitAnswerRule: [
    "**صيغة إجابة think_next (إلزامي):**",
    "- سجل عمل ممنوع: لا تبدأ بـ 'Plan:' أو 'Read:' أو 'Code review:'.",
    "- ماذا أُنجز + ماذا تغيّر + أي ملف — ملخص ملموس.",
    "- أنهِ عمل pass أولاً (Read/Write/Shell)، ثم استدعِ think_next.",
    "- عدة think_next في دورة واحدة ممنوع — عمل حقيقي بين passes.",
    "- لا تستدعِ MCPs أخرى أثناء ultra-thinking.",
  ].join("\n"),
  flowHeader: "## التدفق",
  flowStep1: "1. أكمل هذا pass (استخدم Read/Write للوكيل إن لزم)",
  flowStep2: (id) =>
    `2. ملخص ملموس → \`think_next\` (session_id: "${id}") — meta log ممنوع`,
  flowStep3: (total) => `3. تابع حتى ${total} passes — لا تجمّع passes بالتوازي`,
  applyPassNow: "طبّق Pass 1 الآن.",
  passSummaryHeader: (pass) => `## ملخص Pass ${pass}`,
  nextStepHeader: "## الخطوة التالية",
  nextStepContinue: (nextPass, remaining) =>
    `نفّذ Pass ${nextPass} (Read/Write/Shell)، ثم \`think_next\`. المتبقي: **${remaining}**. think_next متوازي ممنوع.`,
  nextStepFinal: "Pass الأخير — أنهِ العمل → استدعِ `think_next`.",
  completionTitle: "اكتمل",
  completionIntro: (total) => `${total} passes اكتملت. قدّم **فقط** الإجابة النهائية للمستخدم.`,
  completionRulesHeader: "## القواعد",
  completionRules: [
    "- لا تُظهر تاريخ passes أو عملية المراجعة أو meta MCP.",
    "- لمهام الكود: اذكر الملفات المتغيرة/الجديدة في الإجابة النهائية.",
    "- إجابة نهائية نظيفة فقط.",
  ],
  finalAnswerHeader: "## الإجابة للمستخدم",
  executionHints: {
    none: "لا حاجة لتغيير ملفات — ركّز على التفكير/الإجابة.",
    read: [
      "**Execution (agent):** اقرأ ملفات حقيقية بـ Read / Grep / SemanticSearch.",
      "لا تتخيّل الكود — اقرأ من القرص، ثم think_next.",
    ].join("\n"),
    write: [
      "**Execution (agent):** طبّق التغييرات بـ Write / StrReplace / Delete.",
      "لا mock ولا placeholder — كود/ملفات حقيقية. ثم think_next.",
    ].join("\n"),
    verify: [
      "**Execution (agent):** شغّل test/build عبر Shell (npm test, tsc, …).",
      "لا تترك حالة مكسورة. لخّص الملفات المتغيرة في الإجابة النهائية.",
    ].join("\n"),
  },
  antiStagnationRule: [
    "**Anti-stagnation (إلزامي):**",
    "- نسخ نفس إجابة pass السابق ممنوع.",
    "- تحسين ملموس واحد على الأقل مطلوب لهذا pass.",
    "- write pass بدون تغيير ملف حقيقي = pass فاشل.",
  ].join("\n"),
  basiret: {
    code: [
      "**Basiret (حكم تكيفي):** بعد pass توقّف وقيّم.",
      "- نقص أو خطأ أو edge case → وسّع أو صحّح.",
      "- abstraction زائد أو diff منتفخ → بسّط.",
      "- scope creep أو ملفات كثيرة → قلّل.",
      "الاتجاه من نتائج هذا pass — لا 'أضف دائماً' أو 'احذف دائماً'.",
    ].join("\n"),
    verifyBeforeNext: [
      "**Verify-before-next (إلزامي):** شغّل test/build؛ لخّص المخرجات، ثم think_next.",
      "'tests ok' غامض لا يكفي — اذكر العدد والملف وما تم التحقق منه.",
    ].join("\n"),
    readBeforeNext:
      "**Read-before-next:** اقرأ الملفات المتأثرة بـ Read/Grep؛ لا think_next بدون فحص القرص.",
    creative:
      "**Basiret (مرئي):** افتح المخرجات بـ Read — تفاصيل ناقصة أو زائدة؛ قرر من النتائج.",
    writeExtra: "**Write basiret:** قيّم diff — ضروري أم يمكن تبسيطه؟",
  },
  firstDraftTitle: "مسودة أولى",
  refinementTitle: "تحسين",
  topicLabel: "**الموضوع:**",
  modeLabel: "**الوضع:**",
};

const PROMPT_BUNDLES: Record<Locale, PromptBundle> = {
  tr: PROMPT_TR,
  en: PROMPT_EN,
  de: PROMPT_DE,
  ar: PROMPT_AR,
};

const REJECTION_AR: RejectionBundle = {
  metaTitle: (pass) => `# RED — تم رفض إجابة Pass ${pass}`,
  metaIntro: "يبدو أن النص **سجل عمل/وصف meta** وليس ملخص تسليم.",
  problemsLabel: "المشاكل:",
  nowDo:
    "**الآن:** أكمل هذا pass (Read/Write/Shell إن لزم)، ثم استدعِ think_next ب**ملخص ملموس**.",
  stagnationTitle: (pass) => `# RED — إجابة Pass ${pass} مطابقة للسابقة`,
  stagnationReadCopy:
    "Anti-stagnation: pass القراءة يكرر المحتوى السابق — مرجع الملف لا يكفي.",
  stagnationSame: "Anti-stagnation: لا يمكن إرسال نفس إجابة pass السابق.",
  stagnationResubmit: "تحسين ملموس جديد لهذا pass، ثم استدعِ think_next مرة أخرى.",
};

export const LOCALE_BUNDLES: Record<Locale, LocaleBundle> = {
  tr: {
    code: "tr",
    modeAliases: {
      kolay: "easy_thinking",
      orta: "medium_thinking",
      ileri: "more_thinking",
      maksimum: "max_thinking",
    },
    nlModePatterns: [
      /düşünme\s+modu\s+mcp\s+(easy|medium|more|max|kolay|orta|ileri|maksimum)/i,
      /mcp\s+(easy|medium|more|max|kolay|orta|ileri|maksimum)\s*(?:de\s+)?düşün/i,
      /(?:^|\s)(easy|medium|more|max)\s*(?:de\s+)?düşün/i,
      /(?:^|\s)(kolay|orta|ileri|maksimum)\s+modda\s+düşün/i,
      /(?:^|\s)(easy|medium|more|max)\s+da\s+düşünerek/i,
      /(?:^|\s)(kolay|orta|ileri|maksimum)\s+da\s+düşünerek/i,
    ],
    stripPatterns: [
      /düşünme\s+modu\s+mcp\s+(?:easy|medium|more|max|kolay|orta|ileri|maksimum)\s*(?:de\s+)?düşün[:\s]*/gi,
      /mcp\s+(?:easy|medium|more|max|kolay|orta|ileri|maksimum)\s*(?:de\s+)?düşün[:\s]*/gi,
      /(?:^|\s)(?:easy|medium|more|max)\s*(?:de\s+)?düşün[:\s]*/gi,
      /(?:^|\s)(?:kolay|orta|ileri|maksimum)\s*(?:de\s+)?düşün[:\s]*/gi,
      /(?:^|\s)(?:easy|medium|more|max|kolay|orta|ileri|maksimum)\s+modda\s+düşün[:\s]*/gi,
      /(?:^|\s)(?:easy|medium|more|max|kolay|orta|ileri|maksimum)\s+da\s+düşünerek[:\s]*/gi,
    ],
    useCaseSnippets: USE_CASE_MATRIX.filter((s) =>
      /fail|toparla|geçiş|bypass|500|webhook|monolith/i.test(s.trigger.source),
    ),
    detectHints: [/düşün/i, /modu mcp/i, /kolay|orta|ileri|maksimum/i],
    rejection: REJECTION_TR,
    serverInstructions: SERVER_INSTRUCTIONS_TR,
  },
  en: {
    code: "en",
    modeAliases: {},
    nlModePatterns: [
      /(?:^|\s)(easy|medium|more|max)\s+mode\s+think/i,
      /(?:^|\s)think\s+(?:in\s+)?(?:easy|medium|more|max)\s+mode/i,
      /(?:^|\s)(easy|medium|more|max)\s+thinking/i,
      /(?:^|\s)(easy|medium|more|max)\s+mode\s+thinking/i,
    ],
    stripPatterns: [
      /(?:^|\s)(?:easy|medium|more|max)\s+mode\s+think[:\s]*/gi,
      /(?:^|\s)think\s+(?:in\s+)?(?:easy|medium|more|max)\s+mode[:\s]*/gi,
      /(?:^|\s)(?:easy|medium|more|max)\s+thinking[:\s]*/gi,
      /(?:^|\s)(?:easy|medium|more|max)\s+mode\s+thinking[:\s]*/gi,
    ],
    useCaseSnippets: USE_CASE_MATRIX.filter((s) =>
      /why|refactor|migration|bypass|root cause|webhook|monolith vs/i.test(s.trigger.source),
    ),
    detectHints: [/\bthink\b/i, /\bmode\b/i, /\beasy thinking\b/i],
    rejection: REJECTION_EN,
    serverInstructions: SERVER_INSTRUCTIONS_EN,
  },
  de: {
    code: "de",
    modeAliases: {
      einfach: "easy_thinking",
      mittel: "medium_thinking",
      mehr: "more_thinking",
      maximal: "max_thinking",
    },
    nlModePatterns: [
      /(?:^|\s)(einfach|mittel|mehr|maximal|easy|medium|more|max)\s+modus\s+denken/i,
      /(?:^|\s)im\s+(einfach|mittel|mehr|maximal|easy|medium|more|max)\s+modus\s+denken/i,
      /(?:^|\s)(easy|medium|more|max)\s+modus\s+denken/i,
    ],
    stripPatterns: [
      /(?:^|\s)(?:einfach|mittel|mehr|maximal|easy|medium|more|max)\s+modus\s+denken[:\s]*/gi,
      /(?:^|\s)im\s+(?:einfach|mittel|mehr|maximal|easy|medium|more|max)\s+modus\s+denken[:\s]*/gi,
    ],
    useCaseSnippets: USE_CASE_MATRIX.filter((s) =>
      /schlägt|modul refaktor|migration|bypass|ursache|webhook|monolith oder/i.test(s.trigger.source),
    ),
    detectHints: [/\bdenken\b/i, /\bmodus\b/i, /\beinfach\b/i, /\bmittel\b/i],
    rejection: REJECTION_DE,
    serverInstructions: SERVER_INSTRUCTIONS_EN,
  },
  ar: {
    code: "ar",
    modeAliases: {
      سهل: "easy_thinking",
      متوسط: "medium_thinking",
      أكثر: "more_thinking",
      أقصى: "max_thinking",
    },
    nlModePatterns: [
      /(?:^|\s)(?:فكر|think)\s+(?:in\s+)?(easy|medium|more|max|سهل|متوسط|أكثر|أقصى)/i,
      /(?:^|\s)(easy|medium|more|max|سهل|متوسط|أكثر|أقصى)\s+(?:وضع\s+)?(?:فكر|think)/i,
    ],
    stripPatterns: [
      /(?:^|\s)(?:فكر|think)\s+(?:in\s+)?(?:easy|medium|more|max|سهل|متوسط|أكثر|أقصى)[:\s]*/gi,
      /(?:^|\s)(?:easy|medium|more|max|سهل|متوسط|أكثر|أقصى)\s+(?:وضع\s+)?(?:فكر|think)[:\s]*/gi,
    ],
    useCaseSnippets: USE_CASE_MATRIX.filter((s) =>
      /يفشل|هيكلة|مراجعة|webhook|الوحدة/i.test(s.trigger.source),
    ),
    detectHints: [/[\u0600-\u06FF]/, /فكر/],
    rejection: REJECTION_AR,
    serverInstructions: SERVER_INSTRUCTIONS_EN,
  },
};

export function detectLocale(text: string): Locale {
  if (/[\u0600-\u06FF]/.test(text)) return "ar";
  if (/\b(denken|modus|einfach|mittel|mehr|maximal)\b/i.test(text)) return "de";
  if (/\b(think|thinking)\b/i.test(text) && !/düşün/i.test(text)) return "en";
  return "tr";
}

export function getLocaleBundle(locale: Locale): LocaleBundle {
  return LOCALE_BUNDLES[locale];
}

export function getRejectionBundle(locale: Locale): RejectionBundle {
  return LOCALE_BUNDLES[locale].rejection;
}

export function getServerInstructions(locale: Locale = "tr"): string {
  return LOCALE_BUNDLES[locale].serverInstructions;
}

export function resolveServerLocale(): Locale {
  const env = process.env.ULTRA_THINKING_LOCALE?.toLowerCase();
  if (env && SUPPORTED_LOCALES.includes(env as Locale)) return env as Locale;
  return "tr";
}

export function getPromptBundle(locale: Locale): PromptBundle {
  return PROMPT_BUNDLES[locale];
}

export function getBasiretHintForLocale(
  locale: Locale,
  taskKind: "code" | "creative" | "analysis",
  execution: ExecutionKindKey,
): string {
  const p = PROMPT_BUNDLES[locale].basiret;
  if (taskKind === "creative") return p.creative;
  if (execution === "verify") return `${p.code}\n${p.verifyBeforeNext}`;
  if (execution === "read") return `${p.code}\n${p.readBeforeNext}`;
  if (execution === "write") return `${p.code}\n${p.writeExtra}`;
  return p.code;
}

export function mergeModeAliases(): Record<string, LocaleModeId> {
  const merged: Record<string, LocaleModeId> = {
    easy: "easy_thinking",
    easy_thinking: "easy_thinking",
    medium: "medium_thinking",
    medium_thinking: "medium_thinking",
    more: "more_thinking",
    more_thinking: "more_thinking",
    max: "max_thinking",
    max_thinking: "max_thinking",
  };
  for (const bundle of Object.values(LOCALE_BUNDLES)) {
    Object.assign(merged, bundle.modeAliases);
  }
  return merged;
}

export function allNlModePatterns(): RegExp[] {
  const seen = new Set<string>();
  const patterns: RegExp[] = [];
  for (const bundle of Object.values(LOCALE_BUNDLES)) {
    for (const p of bundle.nlModePatterns) {
      const key = p.source;
      if (!seen.has(key)) {
        seen.add(key);
        patterns.push(p);
      }
    }
  }
  return patterns;
}

export function allStripPatterns(): RegExp[] {
  const seen = new Set<string>();
  const patterns: RegExp[] = [];
  for (const bundle of Object.values(LOCALE_BUNDLES)) {
    for (const p of bundle.stripPatterns) {
      const key = p.source + p.flags;
      if (!seen.has(key)) {
        seen.add(key);
        patterns.push(p);
      }
    }
  }
  return patterns;
}

export function suggestModeFromUseCase(text: string, locale: Locale = "tr"): LocaleModeId | null {
  const bundles = locale === "tr" ? [LOCALE_BUNDLES.tr] : [LOCALE_BUNDLES[locale], LOCALE_BUNDLES.tr];
  for (const bundle of bundles) {
    for (const snippet of bundle.useCaseSnippets) {
      if (snippet.trigger.test(text)) return snippet.suggestedMode;
    }
  }
  for (const snippet of USE_CASE_MATRIX) {
    if (snippet.trigger.test(text)) return snippet.suggestedMode;
  }
  return null;
}
