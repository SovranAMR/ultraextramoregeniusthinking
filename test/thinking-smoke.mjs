import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";
import { join, resolve, dirname, isAbsolute } from "node:path";
import { fileURLToPath } from "node:url";
import { resolveMode, THINKING_MODES, parseThinkingRequest, detectLocale, suggestModeFromUseCase } from "../dist/thinking/modes.js";
import {
  createSession,
  loadSession,
  submitAnswer,
  resolveSessionInstructionsLocale,
} from "../dist/thinking/session.js";
import {
  buildServerInstructions,
  getServerInstructions,
  resolveServerLocale,
  serverInstructionsLocale,
} from "../dist/thinking/locale/index.js";
import {
  buildStartDirective,
  buildRefinementDirective,
  buildCompletionDirective,
  QUALITY_CHECKLIST_TR,
} from "../dist/thinking/prompts.js";
import { getPassFocus, formatPassRoadmap, getPassPlan } from "../dist/thinking/pass-focus.js";
import { detectTaskKind, getCreativePassPlan } from "../dist/thinking/task-kind.js";
import {
  getBasiretHint,
  planMeetsCodeBasiretRequirements,
} from "../dist/thinking/basiret.js";
import {
  validatePassAnswer,
  buildMetaRejectionMessage,
  buildStagnationRejectionMessage,
} from "../dist/thinking/answer-guard.js";
import { handleThinkNext } from "../dist/server.js";

describe("thinking modes", () => {
  test("easy_thinking = 3 passes", () => {
    assert.equal(resolveMode("easy_thinking").totalPasses, 3);
    assert.equal(resolveMode("easy_thinking").extraRefinements, 2);
  });

  test("medium_thinking = 5 passes", () => {
    assert.equal(resolveMode("medium_thinking").totalPasses, 5);
    assert.equal(resolveMode("medium_thinking").extraRefinements, 4);
  });

  test("more_thinking = 7 passes", () => {
    assert.equal(resolveMode("more_thinking").totalPasses, 7);
  });

  test("max_thinking = 10 passes", () => {
    assert.equal(resolveMode("max_thinking").totalPasses, 10);
    assert.equal(resolveMode("max_thinking").extraRefinements, 9);
  });

  test("legacy alias easy → easy_thinking", () => {
    assert.equal(resolveMode("easy").mode, "easy_thinking");
  });

  test("all modes defined", () => {
    assert.equal(Object.keys(THINKING_MODES).length, 4);
  });
});

describe("natural language mode parsing", () => {
  test("düşünme modu mcp easy de düşün", () => {
    const p = parseThinkingRequest(
      "düşünme modu mcp easy de düşün: React hook nasıl yazılır?",
    );
    assert.equal(p.mode, "easy_thinking");
    assert.equal(p.detectedFromText, true);
    assert.match(p.question, /React hook/);
  });

  test("düşünme modu mcp medium de düşün", () => {
    const p = parseThinkingRequest("düşünme modu mcp medium de düşün bu kodu incele");
    assert.equal(p.mode, "medium_thinking");
    assert.match(p.question, /bu kodu incele/);
  });

  test("düşünme modu mcp more de düşün", () => {
    const p = parseThinkingRequest("düşünme modu mcp more de düşün: mimari analiz");
    assert.equal(p.mode, "more_thinking");
  });

  test("düşünme modu mcp max de düşün", () => {
    const p = parseThinkingRequest("düşünme modu mcp max de düşün ödeme sistemi");
    assert.equal(p.mode, "max_thinking");
  });

  test("short form: max de düşün", () => {
    const p = parseThinkingRequest("max de düşün: kritik migration planı");
    assert.equal(p.mode, "max_thinking");
  });

  test("max da düşünerek", () => {
    const p = parseThinkingRequest("max da düşünerek tavus kuşu çiz");
    assert.equal(p.mode, "max_thinking");
    assert.match(p.question, /tavus kuşu/);
  });
});

describe("locale mode parsing", () => {
  test("tr: düşünme modu mcp max de düşün", () => {
    const p = parseThinkingRequest("düşünme modu mcp max de düşün: auth bypass var mı");
    assert.equal(p.mode, "max_thinking");
    assert.equal(detectLocale("düşünme modu mcp max de düşün"), "tr");
  });

  test("en: think in max mode", () => {
    const p = parseThinkingRequest("think in max mode: why does this test fail");
    assert.equal(p.mode, "max_thinking");
    assert.equal(detectLocale("think in max mode"), "en");
    assert.match(p.question, /why does this test fail/);
  });

  test("de: im maximal modus denken", () => {
    const p = parseThinkingRequest("im maximal modus denken: postgres jsonb migration");
    assert.equal(p.mode, "max_thinking");
    assert.equal(detectLocale("im maximal modus denken"), "de");
  });

  test("de use-case suggests medium for bug fix", () => {
    assert.equal(suggestModeFromUseCase("warum schlägt dieser test fehl", "de"), "medium_thinking");
  });

  test("ar: فكر max", () => {
    const p = parseThinkingRequest("فكر max: مراجعة auth");
    assert.equal(p.mode, "max_thinking");
    assert.equal(detectLocale("فكر max"), "ar");
  });

  test("use-case matrix suggests medium for bug fix (tr)", () => {
    const p = parseThinkingRequest("bu test neden fail oluyor");
    assert.equal(p.mode, "medium_thinking");
    assert.equal(suggestModeFromUseCase("bu test neden fail", "tr"), "medium_thinking");
  });
});

describe("thinking session", () => {
  test("create and load session", () => {
    const s = createSession("Test sorusu?", "easy_thinking", "tr");
    assert.ok(s.id);
    assert.equal(s.totalPasses, 3);
    assert.equal(s.currentRound, 0);

    const loaded = loadSession(s.id);
    assert.ok(loaded);
    assert.equal(loaded.question, "Test sorusu?");
  });

  test("easy_thinking completes after 3 passes", () => {
    const s = createSession("2+2=?", "easy_thinking", "tr");
    let current = s;

    for (let i = 1; i <= 3; i++) {
      current = submitAnswer(current, `Pass ${i}: ${i + i}`);
    }

    assert.equal(current.completed, true);
    assert.equal(current.rounds.length, 3);
  });

  test("max_thinking needs 10 passes", () => {
    const s = createSession("Karmaşık soru", "max_thinking", "en");
    let current = s;

    for (let i = 1; i <= 9; i++) {
      current = submitAnswer(current, `Pass ${i}`);
      assert.equal(current.completed, false);
    }

    current = submitAnswer(current, "Pass 10 final");
    assert.equal(current.completed, true);
  });

  test("medium bug-fix code session end-to-end", () => {
    const s = createSession("bu test neden fail oluyor src/auth.ts", "medium_thinking", "tr");
    assert.equal(s.taskKind, "code");
    assert.equal(s.totalPasses, 5);

    const answers = [
      "test/auth.test.ts için ilk taslak: null guard eksikliği ve async timeout ihtimali planlandı.",
      "src/auth.ts okundu (87 satır). login() null check eksik, token refresh race condition tespit edildi.",
      "src/auth.ts review: refreshToken() async await eksik, 401 fallback yolu hatalı, düzeltme listesi çıkarıldı.",
      "src/auth.ts: null guard ve async try-catch eklendi, refreshToken race condition düzeltildi.",
      "npm test geçti, src/auth.ts doğrulandı: null guard ve async fix 3/3 test green.",
    ];

    let current = s;
    for (let i = 0; i < answers.length; i++) {
      current = submitAnswer(current, answers[i]);
      assert.equal(current.currentRound, i + 1);
      assert.equal(current.completed, i === answers.length - 1);
    }

    assert.equal(current.rounds.length, 5);
    const completion = buildCompletionDirective(current);
    assert.match(completion, /TAMAMLANDI/);
    assert.match(completion, /null guard ve async fix 3\/3 test green/);
    assert.doesNotMatch(completion, /Düşünme Evrimi/);
    assert.doesNotMatch(completion, /Pass 1:|Pass 2:|Pass 3:|Pass 4:/);
  });
});

describe("thinking prompts", () => {
  test("start directive has pass focus and output rules", () => {
    const s = createSession("Nasıl MCP kurulur?", "medium_thinking", "tr");
    const d = buildStartDirective(s);
    assert.match(d, /Pass 1\/5/);
    assert.match(d, /think_next/);
    assert.match(d, /Pass yol haritası/);
    assert.match(d, /İlk Taslak/);
    assert.match(d, /Execution katmanı/i);
  });

  test("refinement asks for improved answer only", () => {
    const s = createSession("Test", "easy_thinking", "tr");
    let current = submitAnswer(s, "İlk cevap");
    const r2 = buildRefinementDirective(current);
    assert.match(r2, /Pass 2\/3/);
    assert.match(r2, /iyileştirilmiş cevabı/);
    assert.match(r2, /Anti-stagnation|iyileştirilmiş/i);
  });

  test("completion delivers final answer without evolution dump", () => {
    const s = createSession("Test", "easy_thinking", "tr");
    let current = s;
    for (let i = 1; i <= 3; i++) {
      current = submitAnswer(current, `Cevap ${i}`);
    }
    const c = buildCompletionDirective(current);
    assert.match(c, /TAMAMLANDI/);
    assert.match(c, /Cevap 3/);
    assert.doesNotMatch(c, /Düşünme Evrimi/);
  });

  test("en start directive uses English prompt bundle", () => {
    const s = createSession("add webhook retry to api handler", "medium_thinking", "en");
    const d = buildStartDirective(s);
    assert.match(d, /Pass roadmap/);
    assert.match(d, /\*\*Task kind:\*\* code/);
    assert.match(d, /Execution layer \(mandatory\)/);
    assert.match(d, /OUTPUT RULE \(mandatory\)/);
    assert.match(d, /Outcome judgment|Judgment \(adaptive\)/);
    assert.match(d, /First Draft/);
    assert.match(d, /Scan codebase with Read\/Grep/);
  });

  test("de refinement uses German next-step copy", () => {
    const s = createSession("warum schlägt dieser test fehl", "easy_thinking", "de");
    let current = submitAnswer(s, "Erster Entwurf: src/foo.ts gelesen.");
    const r2 = buildRefinementDirective(current);
    assert.match(r2, /Nächster Schritt/);
    assert.match(r2, /Paralleles think_next VERBOTEN/);
    assert.match(r2, /AUSGABEREGEL \(verbindlich\)/);
  });
});

describe("pass focus per mode", () => {
  test("medium pass 3 is code review with read hint", () => {
    const f = getPassFocus("medium_thinking", 3);
    assert.ok(f);
    assert.equal(f.execution, "read");
    assert.match(f.title, /Kod|Mantık/i);
    const s = createSession("Test", "medium_thinking", "tr");
    let current = submitAnswer(s, "İlk");
    current = submitAnswer(current, "İkinci");
    const r3 = buildRefinementDirective(current);
    assert.match(r3, /Pass 3\/5/);
    assert.match(r3, /Read.*Grep/i);
    assert.match(r3, /Anti-stagnation/i);
  });

  test("medium pass 4 is implement with write hint", () => {
    const f = getPassFocus("medium_thinking", 4);
    assert.equal(f.execution, "write");
    assert.match(f.title, /Uygulama/i);
    const s = createSession("Test", "medium_thinking", "tr");
    let current = s;
    for (let i = 0; i < 3; i++) current = submitAnswer(current, `p${i}`);
    const r4 = buildRefinementDirective(current);
    assert.match(r4, /Write\/StrReplace/i);
    assert.match(r4, /mock.*yasak/i);
  });

  test("medium pass 5 is verify final", () => {
    const f = getPassFocus("medium_thinking", 5);
    assert.equal(f.execution, "verify");
    assert.match(f.title, /Doğrulama|Final/i);
  });

  test("max has write and verify passes", () => {
    const roadmap = formatPassRoadmap("max_thinking");
    assert.match(roadmap, /✏️ write/);
    assert.match(roadmap, /✓ verify/);
    assert.match(roadmap, /Pass 10/);
  });

  test("de medium pass 3 uses German code review title", () => {
    const f = getPassFocus("medium_thinking", 3, "code", "de");
    assert.ok(f);
    assert.match(f.title, /Code-.*Review|Logik/i);
    const s = createSession("warum schlägt dieser test fehl", "medium_thinking", "de");
    const d = buildStartDirective(s);
    assert.match(d, /Erster Entwurf/);
    assert.match(d, /Codebase mit Read\/Grep scannen/);
  });

  test("start directive shows execution layer rule", () => {
    const s = createSession("Test", "medium_thinking", "tr");
    const d = buildStartDirective(s);
    assert.match(d, /Execution katmanı/);
    assert.match(d, /Pass yol haritası/);
    assert.match(d, /📖 read|✏️ write|✓ verify|💭 think/);
  });
});

describe("task kind & answer guard", () => {
  test("detects creative task from tavus kuşu html", () => {
    assert.equal(
      detectTaskKind("gerçekçi tavus kuşu html yap, svg ile çiz"),
      "creative",
    );
  });

  test("creative max plan skips SSRF code review", () => {
    const plan = getCreativePassPlan("max_thinking");
    const titles = plan.map((p) => p.title).join(" ");
    assert.doesNotMatch(titles, /SSRF|Kod.*Review|Uzman Paneli/i);
    assert.match(titles, /Değerlendirme|Plain|Doğrulama|Sadeleştir/i);
  });

  test("creative session uses visual pass roadmap", () => {
    const s = createSession("tavus kuşu svg çiz", "max_thinking", "tr");
    assert.equal(s.taskKind, "creative");
    const d = buildStartDirective(s);
    assert.match(d, /yaratıcı|görsel/i);
    assert.match(d, /İlk Taslak/);
  });

  test("analysis medium plan has no write passes", () => {
    const plan = getPassPlan("medium_thinking", "analysis");
    assert.equal(plan.length, 5);
    assert.equal(
      plan.some((p) => p.execution === "write"),
      false,
    );
    assert.match(plan[2].title, /Kanıt|Mantık/i);
    assert.match(plan[3].title, /Sentez/i);
  });

  test("analysis session uses read-heavy roadmap", () => {
    const s = createSession("bu mimari kararın artı eksileri neler", "medium_thinking", "tr");
    assert.equal(s.taskKind, "analysis");
    const d = buildStartDirective(s);
    assert.match(d, /analiz/i);
    assert.doesNotMatch(d, /Uygulama/i);
  });

  test("detects analysis task from EN architectural decision phrasing", () => {
    assert.equal(
      detectTaskKind("analyze the architectural decision for event sourcing vs CRUD"),
      "analysis",
    );
    assert.equal(
      detectTaskKind("should we choose CQRS or traditional layering for this domain"),
      "analysis",
    );
    assert.equal(
      detectTaskKind("weigh the advantages and disadvantages of blue-green deployment"),
      "analysis",
    );
  });

  test("EN analysis session uses read-heavy roadmap", () => {
    const s = createSession(
      "think in medium mode: pros and cons of monolith vs microservices",
      "medium_thinking",
      "en",
    );
    assert.equal(s.taskKind, "analysis");
    const d = buildStartDirective(s);
    assert.match(d, /analysis/i);
    assert.doesNotMatch(d, /Implement/i);
  });

  test("rejects meta log think_next answer", () => {
    const v = validatePassAnswer("Plan: dosyayı okuyacağım, eksikleri bulacağım.", 4, "read");
    assert.equal(v.isMeta, true);
    assert.equal(v.valid, false);
  });

  test("accepts concrete deliverable summary", () => {
    const v = validatePassAnswer(
      "test/tavuskusu1.html güncellendi (476 satır). 152 train feather, 3 katman eklendi.",
      6,
      "write",
    );
    assert.equal(v.isMeta, false);
    assert.equal(v.valid, true);
  });

  test("rejects write pass without artifact reference", () => {
    const v = validatePassAnswer(
      "Kod iyileştirildi, mantık hatası düzeltildi ve yapı netleştirildi.",
      1,
      "write",
    );
    assert.equal(v.valid, false);
    assert.match(v.reasons.join(" "), /artifact referansı yok/i);
  });

  test("rejects verify pass without artifact reference", () => {
    const v = validatePassAnswer(
      "Testler geçti, build başarılı, kod doğrulandı.",
      5,
      "verify",
    );
    assert.equal(v.valid, false);
    assert.match(v.reasons.join(" "), /artifact referansı yok/i);
  });

  test("rejects write pass with file ref but no change detail", () => {
    const v = validatePassAnswer("src/server.ts güncellendi.", 4, "write");
    assert.equal(v.valid, false);
    assert.match(v.reasons.join(" "), /somut değişiklik detayı yok/i);
  });

  test("rejects write pass with generic verb and vague colon clause", () => {
    const v = validatePassAnswer(
      "src/server.ts güncellendi: birkaç küçük düzeltme yapıldı.",
      4,
      "write",
    );
    assert.equal(v.valid, false);
    assert.match(v.reasons.join(" "), /somut değişiklik detayı yok/i);
  });

  test("accepts write pass with file path colon and concrete detail", () => {
    const v = validatePassAnswer(
      "src/server.ts: null guard ve async error handling eklendi.",
      4,
      "write",
    );
    assert.equal(v.valid, true);
  });

  test("rejects verify pass with file ref but no change detail", () => {
    const v = validatePassAnswer("test/foo.ts doğrulandı, dosya kontrol edildi.", 5, "verify");
    assert.equal(v.valid, false);
    assert.match(v.reasons.join(" "), /somut değişiklik detayı yok/i);
  });

  test("rejects verify pass with file ref but only build success", () => {
    const v = validatePassAnswer("test/foo.ts build başarılı, kod doğrulandı.", 5, "verify");
    assert.equal(v.valid, false);
    assert.match(v.reasons.join(" "), /somut değişiklik detayı yok/i);
  });

  test("rejects read pass with meaningless padding", () => {
    const padding = "x".repeat(45);
    const v = validatePassAnswer(padding, 2, "read");
    assert.equal(v.valid, false);
    assert.match(v.reasons.join(" "), /padding/i);
  });

  test("rejects read pass without file reference", () => {
    const v = validatePassAnswer(
      "Kod okundu ve incelendi, eksikler tespit edildi, detaylı analiz yapıldı.",
      2,
      "read",
    );
    assert.equal(v.valid, false);
    assert.match(v.reasons.join(" "), /kaynak referansı yok/i);
  });

  test("creative wins when weak code keyword also matches", () => {
    assert.equal(
      detectTaskKind("tavus kuşu svg çiz, dosya oluştur"),
      "creative",
    );
  });

  test("code wins when strong code keyword matches with creative", () => {
    assert.equal(
      detectTaskKind("svg dashboard html yap, typescript refactor yap"),
      "code",
    );
  });

  test("handleThinkNext RED when answer identical to previous pass", () => {
    const s = createSession("Test stagnation", "easy_thinking", "tr");
    const firstAnswer =
      "test/foo.html güncellendi (476 satır). 152 train feather, 3 katman eklendi.";
    submitAnswer(s, firstAnswer);

    const result = handleThinkNext(s.id, firstAnswer);
    assert.equal(result.isError, true);
    assert.match(result.content[0].text, /RED — Pass 2 cevabı öncekiyle aynı/);
    assert.match(result.content[0].text, /Anti-stagnation/);

    const loaded = loadSession(s.id);
    assert.equal(loaded.currentRound, 1);
  });

  test("handleThinkNext RED when answer is trivial tweak of previous", () => {
    const s = createSession("Test trivial tweak", "easy_thinking", "tr");
    const firstAnswer =
      "test/foo.html güncellendi (476 satır). 152 train feather, 3 katman eklendi.";
    submitAnswer(s, firstAnswer);

    const result = handleThinkNext(s.id, `${firstAnswer} ok`);
    assert.equal(result.isError, true);
    assert.match(result.content[0].text, /Anti-stagnation/);

    const loaded = loadSession(s.id);
    assert.equal(loaded.currentRound, 1);
  });

  test("handleThinkNext advances pass when answer improved", () => {
    const s = createSession("Test stagnation ok", "easy_thinking", "tr");
    const firstAnswer =
      "test/foo.html güncellendi (476 satır). 152 train feather, 3 katman eklendi.";
    submitAnswer(s, firstAnswer);

    const improved =
      "test/foo.html okundu (476 satır). Eksik animasyon katmanı, CSS gap ve z-index çakışması tespit edildi.";
    const result = handleThinkNext(s.id, improved);
    assert.notEqual(result.isError, true);
    assert.match(result.content[0].text, /Pass 2\/3/);

    const loaded = loadSession(s.id);
    assert.equal(loaded.currentRound, 2);
  });

  test("handleThinkNext RED when write pass lacks artifact reference", () => {
    const s = createSession("Test write artifact", "medium_thinking", "tr");
    submitAnswer(
      s,
      "test/foo.html için ilk taslak: 3 katman SVG yapısı, train feather ve ocellus planlandı.",
    );
    handleThinkNext(
      s.id,
      "test/foo.html okundu (476 satır). Eksik animasyon katmanı ve CSS gap tespit edildi.",
    );
    handleThinkNext(
      s.id,
      "test/foo.html review: z-index çakışması ve eksik aria-label bulundu, düzeltme listesi çıkarıldı.",
    );

    const noArtifact =
      "Kod iyileştirildi, mantık hatası düzeltildi ve yapı netleştirildi.";
    const result = handleThinkNext(s.id, noArtifact);
    assert.equal(result.isError, true);
    assert.match(result.content[0].text, /RED — Pass 4/);
    assert.match(result.content[0].text, /artifact referansı yok/i);
    assert.match(result.content[0].text, /think_next/i);

    const loaded = loadSession(s.id);
    assert.equal(loaded.currentRound, 3);
  });

  test("handleThinkNext RED when write pass lacks change detail", () => {
    const s = createSession("Test write detail", "medium_thinking", "tr");
    submitAnswer(
      s,
      "test/foo.html için ilk taslak: 3 katman SVG yapısı, train feather ve ocellus planlandı.",
    );
    handleThinkNext(
      s.id,
      "test/foo.html okundu (476 satır). Eksik animasyon katmanı ve CSS gap tespit edildi.",
    );
    handleThinkNext(
      s.id,
      "test/foo.html review: z-index çakışması bulundu, düzeltme listesi çıkarıldı.",
    );

    const vagueWrite = "src/server.ts güncellendi.";
    const result = handleThinkNext(s.id, vagueWrite);
    assert.equal(result.isError, true);
    assert.match(result.content[0].text, /RED — Pass 4/);
    assert.match(result.content[0].text, /somut değişiklik detayı yok/i);

    const loaded = loadSession(s.id);
    assert.equal(loaded.currentRound, 3);
  });

  test("handleThinkNext RED when write pass uses generic verb colon padding", () => {
    const s = createSession("Test write colon padding", "medium_thinking", "tr");
    submitAnswer(
      s,
      "test/foo.html için ilk taslak: 3 katman SVG yapısı, train feather ve ocellus planlandı.",
    );
    handleThinkNext(
      s.id,
      "test/foo.html okundu (476 satır). Eksik animasyon katmanı ve CSS gap tespit edildi.",
    );
    handleThinkNext(
      s.id,
      "test/foo.html review: z-index çakışması bulundu, düzeltme listesi çıkarıldı.",
    );

    const colonPadding =
      "src/server.ts güncellendi: birkaç küçük düzeltme yapıldı ve kaydedildi.";
    const result = handleThinkNext(s.id, colonPadding);
    assert.equal(result.isError, true);
    assert.match(result.content[0].text, /RED — Pass 4/);
    assert.match(result.content[0].text, /somut değişiklik detayı yok/i);

    const loaded = loadSession(s.id);
    assert.equal(loaded.currentRound, 3);
  });

  test("handleThinkNext RED when verify pass lacks artifact reference", () => {
    const s = createSession("Test verify artifact", "medium_thinking", "tr");
    submitAnswer(
      s,
      "test/bar.ts için ilk taslak: 3 modül yapısı, export ve tip tanımları planlandı.",
    );
    handleThinkNext(
      s.id,
      "test/bar.ts okundu (120 satır). Eksik error handling ve tip boşluğu tespit edildi.",
    );
    handleThinkNext(
      s.id,
      "test/bar.ts review: null check eksik, async edge case riski bulundu ve düzeltme listesi çıkarıldı.",
    );
    handleThinkNext(
      s.id,
      "test/bar.ts güncellendi (145 satır). null guard ve async try-catch eklendi.",
    );

    const noArtifact = "Testler geçti, build başarılı, kod doğrulandı.";
    const result = handleThinkNext(s.id, noArtifact);
    assert.equal(result.isError, true);
    assert.match(result.content[0].text, /RED — Pass 5/);
    assert.match(result.content[0].text, /artifact referansı yok/i);
    assert.match(result.content[0].text, /think_next/i);

    const loaded = loadSession(s.id);
    assert.equal(loaded.currentRound, 4);
  });

  test("handleThinkNext RED when read pass answer too short", () => {
    const s = createSession("Test read short", "easy_thinking", "tr");
    submitAnswer(
      s,
      "test/foo.html için ilk taslak: 3 katman SVG yapısı, train feather ve ocellus planlandı.",
    );

    const shortAnswer = "Kod okundu, eksik bulundu.";
    const result = handleThinkNext(s.id, shortAnswer);
    assert.equal(result.isError, true);
    assert.match(result.content[0].text, /RED — Pass 2/);
    assert.match(result.content[0].text, /çok kısa/i);
    assert.match(result.content[0].text, /think_next/i);

    const loaded = loadSession(s.id);
    assert.equal(loaded.currentRound, 1);
  });

  test("handleThinkNext RED when read pass is copy-paste with file ref", () => {
    const s = createSession("Test read copy", "easy_thinking", "tr");
    submitAnswer(
      s,
      "test/foo.html için ilk taslak: 3 katman SVG yapısı, train feather ve ocellus planlandı.",
    );

    const copyRead =
      "test/foo.html okundu (476 satır). 3 katman SVG yapısı, train feather ve ocellus incelendi.";
    const result = handleThinkNext(s.id, copyRead);
    assert.equal(result.isError, true);
    assert.match(result.content[0].text, /Anti-stagnation/);
    assert.match(result.content[0].text, /içerik tekrarı/i);

    const loaded = loadSession(s.id);
    assert.equal(loaded.currentRound, 1);
  });

  test("handleThinkNext RED when read pass answer is padding", () => {
    const s = createSession("Test read padding", "easy_thinking", "tr");
    submitAnswer(
      s,
      "test/foo.html için ilk taslak: 3 katman SVG yapısı, train feather ve ocellus planlandı.",
    );

    const paddingAnswer = "a".repeat(50);
    const result = handleThinkNext(s.id, paddingAnswer);
    assert.equal(result.isError, true);
    assert.match(result.content[0].text, /RED — Pass 2/);
    assert.match(result.content[0].text, /padding/i);
    assert.match(result.content[0].text, /think_next/i);

    const loaded = loadSession(s.id);
    assert.equal(loaded.currentRound, 1);
  });

  test("handleThinkNext RED when meta log submitted", () => {
    const s = createSession("Test meta log", "easy_thinking", "tr");
    const firstAnswer =
      "test/foo.html güncellendi (476 satır). 152 train feather, 3 katman eklendi.";
    submitAnswer(s, firstAnswer);

    const metaLog = "Plan: dosyayı okuyacağım, eksikleri bulacağım.";
    const result = handleThinkNext(s.id, metaLog);
    assert.equal(result.isError, true);
    assert.match(result.content[0].text, /RED — Pass 2/);
    assert.match(result.content[0].text, /iş logu\/meta/i);
    assert.match(result.content[0].text, /think_next/i);

    const loaded = loadSession(s.id);
    assert.equal(loaded.currentRound, 1);
  });

  test("meta rejection message is RED with resubmit guidance", () => {
    const v = validatePassAnswer("Plan: dosyayı okuyacağım, eksikleri bulacağım.", 2, "read");
    const msg = buildMetaRejectionMessage(v, 2);
    assert.match(msg, /RED — Pass 2/);
    assert.match(msg, /Meta log/i);
    assert.match(msg, /think_next/i);
  });

  test("de rejection message uses German locale bundle", () => {
    const v = validatePassAnswer("Plan: dosyayı okuyacağım, eksikleri bulacağım.", 2, "read");
    const msg = buildMetaRejectionMessage(v, 2, "de");
    assert.match(msg, /RED — Pass 2 Antwort abgelehnt/);
    assert.match(msg, /Arbeitslog\/Meta/);
    assert.match(msg, /think_next/i);
  });

  test("de stagnation rejection uses German locale", () => {
    const msg = buildStagnationRejectionMessage(2, true, "de");
    assert.match(msg, /Antwort identisch mit vorheriger/);
    assert.match(msg, /Anti-stagnation/);
    assert.match(msg, /think_next/i);
  });

  test("session stores de locale from question", () => {
    const s = createSession("warum schlägt dieser test fehl", "medium_thinking", "de");
    assert.equal(s.language, "de");
    const loaded = loadSession(s.id);
    assert.equal(loaded.language, "de");
  });
});

describe("server instructions locale", () => {
  test("EN instructions from question detect", () => {
    const locale = resolveServerLocale({ question: "think in max mode: fix auth bypass" });
    assert.equal(locale, "en");
    const text = buildServerInstructions({ question: "think in max mode: fix auth bypass" });
    assert.match(text, /improves answer quality pass by pass/);
    assert.doesNotMatch(text, /cevap kalitesini pass pass/);
  });

  test("TR instructions from session language", () => {
    const s = createSession("bu test neden fail", "medium_thinking", "tr");
    const locale = resolveSessionInstructionsLocale(s);
    assert.equal(locale, "tr");
    const text = buildServerInstructions({ sessionLanguage: s.language });
    assert.match(text, /cevap kalitesini pass pass artırır/);
  });

  test("EN instructions from session language", () => {
    const s = createSession("why does this test fail", "medium_thinking", "en");
    const locale = resolveSessionInstructionsLocale(s);
    assert.equal(locale, "en");
    const text = getServerInstructions(serverInstructionsLocale(locale));
    assert.match(text, /improves answer quality/);
  });

  test("TR server instructions include code-first use-case snippets", () => {
    const text = getServerInstructions("tr");
    assert.match(text, /ÖRNEK KOD GÖREVLERİ/);
    assert.match(text, /bu test neden fail/);
    assert.match(text, /auth bypass var mı/);
    assert.match(text, /postgres jsonb geçiş/);
  });

  test("EN server instructions include code-first use-case snippets", () => {
    const text = getServerInstructions("en");
    assert.match(text, /CODE TASK EXAMPLES/);
    assert.match(text, /why does this test fail/);
    assert.match(text, /auth bypass review/);
    assert.match(text, /postgres jsonb migration/);
  });
});

describe("basiret layer", () => {
  test("easy code plan has verify and evaluation passes", () => {
    const plan = getPassPlan("easy_thinking", "code");
    const req = planMeetsCodeBasiretRequirements(plan);
    assert.equal(req.hasVerify, true);
    assert.equal(req.hasEvaluation, true);
  });

  test("easy verify refinement includes verify-before-next", () => {
    const s = createSession("bu test neden fail", "easy_thinking", "tr");
    let current = s;
    for (let i = 0; i < 2; i++) {
      current = submitAnswer(
        current,
        i === 0
          ? "test/foo.ts için ilk taslak: null guard ve async error handling planlandı."
          : "test/foo.ts okundu (42 satır). null guard eksik ve async edge case riski tespit edildi.",
      );
    }
    const r3 = buildRefinementDirective(current);
    assert.match(r3, /Verify-before-next/);
    assert.match(r3, /Pass 3\/3/);
  });

  test("max code plan has verify and evaluation passes", () => {
    const plan = getPassPlan("max_thinking", "code");
    const req = planMeetsCodeBasiretRequirements(plan);
    assert.equal(req.hasVerify, true);
    assert.equal(req.hasEvaluation, true);
  });

  test("verify pass hint includes verify-before-next", () => {
    const hint = getBasiretHint("code", "verify");
    assert.match(hint, /Sonuç basireti/);
    assert.match(hint, /Verify-before-next/);
    assert.match(hint, /test geçti.*yeterli değil/i);
  });

  test("creative task uses outcome basiret on verify", () => {
    const hint = getBasiretHint("creative", "verify");
    assert.match(hint, /Sonuç basireti|görsel/i);
    assert.match(hint, /Plain|düz tek tur/i);
  });

  test("analysis task uses evidence verify basiret not shell test rule", () => {
    const hint = getBasiretHint("analysis", "verify");
    assert.match(hint, /analiz|kanıt|iddia/i);
    assert.doesNotMatch(hint, /Shell ile test\/build|Verify-before-next \(kesin\)/i);
  });

  test("analysis max plan has no write or code-review passes", () => {
    const plan = getPassPlan("max_thinking", "analysis");
    assert.equal(plan.length, 10);
    assert.equal(plan.some((p) => p.execution === "write"), false);
    const titles = plan.map((p) => p.title).join(" ");
    assert.doesNotMatch(titles, /Uygulama|Implement|SSRF|Kod.*Review/i);
    assert.match(titles, /Doğrulama|Sentez|Kanıt/i);
  });

  test("max start directive embeds basiret on pass 1", () => {
    const s = createSession("auth bypass var mı", "max_thinking", "tr");
    const d = buildStartDirective(s);
    assert.match(d, /Sonuç basireti/);
    assert.match(d, /düz tek tur|Plain/i);
  });

  test("medium verify refinement includes verify-before-next", () => {
    const s = createSession("bug fix", "medium_thinking", "tr");
    let current = s;
    for (let i = 0; i < 4; i++) {
      current = submitAnswer(current, `Pass ${i + 1} özeti: src/foo.ts okundu (42 satır). null guard eksik bulundu.`);
    }
    const r5 = buildRefinementDirective(current);
    assert.match(r5, /Verify-before-next/);
    assert.match(r5, /Pass 5\/5/);
  });
});

describe("CLI mcp-config", () => {
  test("mcp-config prints absolute SERVER_PATH and ULTRA_THINKING_ROOT", () => {
    const pkgRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
    const cliPath = join(pkgRoot, "dist", "cli", "index.js");
    const out = execFileSync(process.execPath, [cliPath, "mcp-config"], {
      cwd: pkgRoot,
      encoding: "utf8",
    });
    const config = JSON.parse(out.trim());
    const server = config.mcpServers["ultra-thinking"];
    assert.equal(server.command, "node");
    assert.equal(server.args.length, 1);
    const serverPath = server.args[0];
    assert.ok(isAbsolute(serverPath), "SERVER_PATH must be absolute");
    assert.equal(serverPath, join(pkgRoot, "dist", "server.js"));
    assert.ok(existsSync(serverPath), "SERVER_PATH must exist on disk");
    assert.ok(server.env, "env block required");
    assert.ok("ULTRA_THINKING_ROOT" in server.env);
    assert.equal(server.env.ULTRA_THINKING_ROOT, join(pkgRoot, ".ultra-thinking"));
  });
});
