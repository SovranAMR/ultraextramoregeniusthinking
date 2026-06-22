#!/usr/bin/env node
/**
 * Görsel A/B çıktı raporu — dosya var mı, satır, brief checklist.
 */
import { readFileSync, existsSync, statSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const ROOT = dirname(fileURLToPath(import.meta.url));

function analyze(label) {
  const path = join(ROOT, label, "dashboard.html");
  if (!existsSync(path)) {
    return { label, exists: false };
  }
  const raw = readFileSync(path, "utf8");
  const lines = raw.split("\n").length;
  const bytes = statSync(path).size;

  const checks = {
    hasDoctype: /<!DOCTYPE html>/i.test(raw),
    hasLang: /<html[^>]*lang=/i.test(raw),
    hasAria: /aria-label/i.test(raw),
    inlineStyle: /<style/i.test(raw),
    hasSvg: /<svg/i.test(raw),
    hasAnimation: /@keyframes|animation:/i.test(raw),
    noExternalCss: !/<link[^>]+stylesheet[^>]+http/i.test(raw),
    noExternalJs: !/<script[^>]+src=["']https?:/i.test(raw),
    darkBg: /#0[fF]|#1[0-2]|rgb\(1[0-5]|--bg.*dark/i.test(raw),
    threeCards: (raw.match(/card|metric|stat|kpi/gi) || []).length >= 3,
  };

  const passed = Object.values(checks).filter(Boolean).length;
  const total = Object.keys(checks).length;

  return { label, exists: true, lines, bytes, checks, passed, total };
}

function printReport(r) {
  if (!r.exists) {
    console.log(`[${r.label}] ❌ dashboard.html yok\n`);
    return;
  }
  console.log(`[${r.label}] ${r.lines} satır · ${(r.bytes / 1024).toFixed(1)} KB · checklist ${r.passed}/${r.total}`);
  for (const [k, v] of Object.entries(r.checks)) {
    console.log(`  ${v ? "✓" : "✗"} ${k}`);
  }
  console.log();
}

const mode = process.argv[2] || "both";
const labels = mode === "both" ? ["max", "plain"] : [mode];

console.log("=== A/B Round 4 — görsel validate ===\n");
console.log("Karşılaştır: test/ab-round4/compare.html\n");

for (const label of labels) {
  printReport(analyze(label));
}

if (mode === "both") {
  const max = analyze("max");
  const plain = analyze("plain");
  if (max.exists && plain.exists) {
    const diff = max.lines - plain.lines;
    console.log(`Satır farkı (max − plain): ${diff > 0 ? "+" : ""}${diff}`);
    console.log(`Checklist farkı: max ${max.passed} vs plain ${plain.passed}`);
  }
}
