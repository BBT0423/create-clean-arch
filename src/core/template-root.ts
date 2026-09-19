import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import fs from "fs-extra";

/** Resolves the templates directory bundled alongside this module (src/templates in dev, dist/templates in prod). */
export function resolveTemplatesRoot(): string {
  const here = dirname(fileURLToPath(import.meta.url));
  // this file lives in <root>/src/core (dev) or is inlined into <root>/dist/index.js (prod)
  const candidates = [join(here, "..", "templates"), join(here, "templates")];
  for (const candidate of candidates) {
    if (fs.pathExistsSync(candidate)) return candidate;
  }
  throw new Error(`Could not locate templates directory (looked in: ${candidates.join(", ")})`);
}
