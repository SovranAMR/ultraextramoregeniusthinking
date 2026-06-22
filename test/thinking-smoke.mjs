import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { resolveMode, THINKING_MODES, parseThinkingRequest } from "../dist/thinking/modes.js";
import {
  createSession,
  submitAnswer,
  loadSession,
} from "../dist/thinking/session.js";
import {
  buildStartDirective,
  buildRefinementDirective,
  buildCompletionDirective,
  QUALITY_CHECKLIST_TR,
} from "../dist/thinking/prompts.js";
import { getPassFocus, formatPassRoadmap } from "../dist/thinking/pass-focus.js";
import { detectTaskKind, getCreativePassPlan } from "../dist/thinking/task-kind.js";
import {
  validatePassAnswer,
  buildMetaRejectionMessage,
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
    assert.match(titles, /Detay|Doğrulama/i);
  });

  test("creative session uses visual pass roadmap", () => {
    const s = createSession("tavus kuşu svg çiz", "max_thinking", "tr");
    assert.equal(s.taskKind, "creative");
    const d = buildStartDirective(s);
    assert.match(d, /yaratıcı|görsel/i);
    assert.match(d, /İlk Taslak/);
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
    const s = createSession("Test write artifact", "easy_thinking", "tr");
    submitAnswer(
      s,
      "test/foo.html için ilk taslak: 3 katman SVG yapısı, train feather ve ocellus planlandı.",
    );

    handleThinkNext(
      s.id,
      "test/foo.html okundu (476 satır). Eksik animasyon katmanı ve CSS gap tespit edildi.",
    );

    const noArtifact =
      "Kod iyileştirildi, mantık hatası düzeltildi ve yapı netleştirildi.";
    const result = handleThinkNext(s.id, noArtifact);
    assert.equal(result.isError, true);
    assert.match(result.content[0].text, /RED — Pass 3/);
    assert.match(result.content[0].text, /artifact referansı yok/i);
    assert.match(result.content[0].text, /think_next/i);

    const loaded = loadSession(s.id);
    assert.equal(loaded.currentRound, 2);
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
});
