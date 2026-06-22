import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const PKG_ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

function readPackageVersion(): string {
  const pkg = JSON.parse(readFileSync(join(PKG_ROOT, "package.json"), "utf8")) as {
    version: string;
  };
  return pkg.version;
}

/** package.json semver — MCP metadata and startup banner share this. */
export const PACKAGE_VERSION = readPackageVersion();

export const MCP_STARTUP_BANNER = `ultra-thinking MCP v${PACKAGE_VERSION} — stdio`;
