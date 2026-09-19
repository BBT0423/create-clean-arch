import type { PlannedFile } from "./file-tree-writer.js";

export class OverwriteConflictError extends Error {
  constructor(public readonly conflicts: PlannedFile[]) {
    const list = conflicts.map((c) => `  - ${c.targetPath}`).join("\n");
    super(`${conflicts.length} file(s) already exist with different content:\n${list}`);
    this.name = "OverwriteConflictError";
  }
}

export interface ClassifyPlanOptions {
  /** Include conflicting files in `toWrite` instead of leaving them out. */
  force?: boolean;
}

export interface ClassifyPlanResult {
  toWrite: PlannedFile[];
  unchanged: PlannedFile[];
  conflicts: PlannedFile[];
}

/**
 * Pure classification of a (possibly merged, multi-subtree) plan into new/unchanged/conflicting —
 * never throws, never touches the filesystem. Callers are responsible for deciding what to do
 * with `conflicts` (typically: throw `OverwriteConflictError` for the whole run if any exist and
 * `force` wasn't passed, so a generation run fails loudly and all-or-nothing rather than partially
 * applying itself).
 */
export function classifyPlan(plan: PlannedFile[], options: ClassifyPlanOptions = {}): ClassifyPlanResult {
  const unchanged = plan.filter((f) => f.status === "unchanged");
  const conflicts = plan.filter((f) => f.status === "conflict");
  const news = plan.filter((f) => f.status === "new");

  const toWrite = options.force ? [...news, ...conflicts] : news;
  return { toWrite, unchanged, conflicts: options.force ? [] : conflicts };
}
