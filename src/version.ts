import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const PKG_ROOT = dirname(fileURLToPath(import.meta.url));
const pkg = JSON.parse(
  readFileSync(join(PKG_ROOT, "..", "package.json"), "utf8"),
) as { version: string };

/** package.json semver — MCP metadata ve CLI banner tek kaynak. */
export const VERSION = pkg.version;
