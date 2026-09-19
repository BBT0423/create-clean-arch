import { createHash } from "node:crypto";

/**
 * Deterministically derives a GUID-shaped string from a seed (e.g. "MyApp.Api"), so re-running
 * `create` with the same project name always yields the same .sln project GUIDs, while different
 * project names get different GUIDs (avoiding collisions when multiple generated solutions are
 * opened in the same Visual Studio instance).
 */
export function deterministicGuid(seed: string): string {
  const hash = createHash("sha1").update(seed).digest("hex");
  const h = hash.slice(0, 32);
  return `{${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20, 32)}}`.toUpperCase();
}
