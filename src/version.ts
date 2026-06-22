import pkg from "../package.json" with { type: "json" };

/** Single source of truth — keep in sync with package.json only. */
export const PACKAGE_VERSION: string = pkg.version;

export const MCP_STARTUP_BANNER = `ultra-thinking MCP v${PACKAGE_VERSION} — stdio`;
