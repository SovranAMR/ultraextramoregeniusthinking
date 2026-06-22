import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const PKG_ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

const pkg = JSON.parse(readFileSync(join(PKG_ROOT, "package.json"), "utf8")) as {
  version: string;
};

/** Semver from package.json — single source for MCP server and CLI banners. */
export const PKG_VERSION: string = pkg.version;

export const MCP_STDIO_BANNER = `ultra-thinking MCP v${PKG_VERSION} — stdio`;
