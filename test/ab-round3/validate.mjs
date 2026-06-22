#!/usr/bin/env node
/**
 * A/B çıktılarını karşılaştır — fixture'a dokunmaz.
 * Kullanım: node test/ab-round3/validate.mjs [max|plain|both]
 */
import { createRateLimiter as fixtureLimiter } from "./fixture/rate-limit.mjs";

const ROOT = new URL(".", import.meta.url);

async function loadImpl(label) {
  const path = new URL(`./${label}/rate-limit.mjs`, ROOT);
  try {
    return await import(path.href);
  } catch (e) {
    return { error: e.message };
  }
}

function runSuite(createRateLimiter, label) {
  const results = [];
  const check = (name, fn) => {
    try {
      fn();
      results.push({ name, ok: true });
    } catch (e) {
      results.push({ name, ok: false, error: e.message });
    }
  };

  check(`${label}: ilk istek allowed`, () => {
    const lim = createRateLimiter({ maxRequests: 2, windowMs: 1000 });
    const r = lim.allow("u1");
    if (!r.allowed || r.remaining !== 1) throw new Error(JSON.stringify(r));
  });

  check(`${label}: limit dolunca reddet`, () => {
    const lim = createRateLimiter({ maxRequests: 2, windowMs: 10_000 });
    lim.allow("u2");
    lim.allow("u2");
    const r = lim.allow("u2");
    if (r.allowed) throw new Error("3. istek reddedilmeli");
  });

  check(`${label}: pencere ms — kısa beklemede sıfırlanmamalı`, () => {
    const lim = createRateLimiter({ maxRequests: 1, windowMs: 60_000 });
    lim.allow("u3");
    const r = lim.allow("u3");
    if (r.allowed) throw new Error("aynı pencerede 2. istek reddedilmeli");
  });

  check(`${label}: reset(undefined) tüm map'i silmemeli`, () => {
    const lim = createRateLimiter({ maxRequests: 5, windowMs: 1000 });
    lim.allow("a");
    lim.reset(undefined);
    const r = lim.allow("a");
    if (!r.allowed) throw new Error("reset(undefined) sonrası a hâlâ çalışmalı (veya API net dokümante)");
  });

  check(`${label}: remaining negatif olmamalı`, () => {
    const lim = createRateLimiter({ maxRequests: 3, windowMs: 1000 });
    const r = lim.allow("u4");
    if (r.remaining < 0) throw new Error(`remaining=${r.remaining}`);
  });

  return results;
}

const mode = process.argv[2] || "both";
const labels = mode === "both" ? ["max", "plain"] : [mode];

console.log("=== A/B Round 3 — rate-limit validate ===\n");

for (const label of labels) {
  const mod = await loadImpl(label);
  if (mod.error) {
    console.log(`[${label}] DOSYA YOK veya import hatası: ${mod.error}\n`);
    continue;
  }
  const results = runSuite(mod.createRateLimiter, label);
  const passed = results.filter((r) => r.ok).length;
  console.log(`[${label}] ${passed}/${results.length} passed`);
  for (const r of results.filter((x) => !x.ok)) {
    console.log(`  FAIL: ${r.name} — ${r.error}`);
  }
  console.log();
}

const fixtureResults = runSuite(fixtureLimiter, "fixture(buggy)");
const fixturePass = fixtureResults.filter((r) => r.ok).length;
console.log(`[fixture] ${fixturePass}/${fixtureResults.length} passed (beklenen: düşük — kasıtlı bug)`);
