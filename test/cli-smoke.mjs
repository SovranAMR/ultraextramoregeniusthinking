import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, join, resolve, isAbsolute } from "node:path";

const PKG_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const CLI_PATH = join(PKG_ROOT, "dist", "cli", "index.js");
const SERVER_PATH = join(PKG_ROOT, "dist", "server.js");

describe("cli mcp-config", () => {
  test("mcp-config --print emits absolute SERVER_PATH and ULTRA_THINKING_ROOT", () => {
    const out = execFileSync("node", [CLI_PATH, "mcp-config", "--print"], {
      cwd: PKG_ROOT,
      encoding: "utf8",
    });

    const config = JSON.parse(out.trim());
    const entry = config.mcpServers["ultra-thinking"];
    assert.ok(entry);
    assert.equal(entry.command, "node");
    assert.equal(entry.args.length, 1);
    assert.equal(entry.args[0], SERVER_PATH);
    assert.ok(isAbsolute(entry.args[0]));
    assert.ok(entry.env);
    assert.ok("ULTRA_THINKING_ROOT" in entry.env);
    assert.equal(entry.env.ULTRA_THINKING_ROOT, join(PKG_ROOT, ".ultra-thinking"));
    assert.ok(isAbsolute(entry.env.ULTRA_THINKING_ROOT));
  });
});
