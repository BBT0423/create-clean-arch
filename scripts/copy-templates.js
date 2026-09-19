import { cpSync, existsSync, rmSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const src = join(root, "src", "templates");
const dest = join(root, "dist", "templates");

if (!existsSync(src)) {
  console.error(`Template source not found: ${src}`);
  process.exit(1);
}

// Remove any stale copy first: cpSync's recursive merge does not rename directories that
// already exist under a different case on a case-insensitive filesystem (Windows/macOS
// default), it just overwrites file contents in place and leaves the old casing behind.
rmSync(dest, { recursive: true, force: true });
cpSync(src, dest, { recursive: true });
console.log(`Copied templates -> ${dest}`);
