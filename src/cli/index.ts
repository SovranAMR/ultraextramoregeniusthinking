#!/usr/bin/env node
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { THINKING_MODES } from "../thinking/modes.js";
import { VERSION } from "../version.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PKG_ROOT = resolve(__dirname, "..", "..");
const SERVER_PATH = join(PKG_ROOT, "dist", "server.js");

function printHelp(): void {
  console.log(`ultra-thinking v${VERSION} — Ultra Extra More Genius Thinking MCP

Kullanım:
  ultra-thinking mcp-config [--print|--write] [--force]
  ultra-thinking modes
  ultra-thinking help

Modlar:
${Object.values(THINKING_MODES)
  .map(
    (m) =>
      `  ${m.buttonLabel.padEnd(16)} ${m.totalPasses} pass (+${m.extraRefinements} iyileştirme) — ${m.useCase}`,
  )
  .join("\n")}

Kurulum (Cursor / VSCode / Antigravity):
  npm run build
  ultra-thinking mcp-config --write
  IDE'yi yeniden başlat
`);
}

function buildMcpConfig(): {
  mcpServers: Record<
    string,
    { command: string; args: string[]; env?: Record<string, string> }
  >;
} {
  return {
    mcpServers: {
      "ultra-thinking": {
        command: "node",
        args: [SERVER_PATH],
        env: {
          ULTRA_THINKING_ROOT: join(process.cwd(), ".ultra-thinking"),
        },
      },
    },
  };
}

function mcpConfig(args: string[]): void {
  const write = args.includes("--write");
  const force = args.includes("--force");
  const config = buildMcpConfig();
  const json = JSON.stringify(config, null, 2);

  if (write) {
    const targets = [
      join(process.cwd(), ".cursor", "mcp.json"),
      join(process.cwd(), ".vscode", "mcp.json"),
    ];

    for (const target of targets) {
      const dir = dirname(target);
      if (!existsSync(dir)) continue;

      if (existsSync(target) && !force) {
        console.error(`SKIP (exists): ${target} — --force ile üzerine yaz`);
        continue;
      }

      let merged: { mcpServers: Record<string, unknown> } = config;
      if (existsSync(target) && force) {
        try {
          const existing = JSON.parse(readFileSync(target, "utf8")) as {
            mcpServers?: Record<string, unknown>;
          };
          merged = {
            mcpServers: {
              ...existing.mcpServers,
              ...config.mcpServers,
            },
          };
        } catch {
          merged = config;
        }
      }

      writeFileSync(target, JSON.stringify(merged, null, 2), "utf8");
      console.error(`WROTE: ${target}`);
    }

    console.log(json);
    return;
  }

  console.log(json);
}

function printModes(): void {
  for (const cfg of Object.values(THINKING_MODES)) {
    console.log(
      `${cfg.mode}\t${cfg.totalPasses}\t${cfg.buttonLabel}\t${cfg.useCase}`,
    );
  }
}

const [,, cmd, ...rest] = process.argv;

switch (cmd) {
  case "mcp-config":
    mcpConfig(rest);
    break;
  case "modes":
    printModes();
    break;
  case "help":
  case "--help":
  case "-h":
    printHelp();
    break;
  default:
    printHelp();
    break;
}
