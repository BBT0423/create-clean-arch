import { planFileTree, type PlannedFile } from "../core/file-tree-writer.js";
import type { TokenMap } from "../core/types.js";

/** Plans (but does not write) one template subtree against a target directory. Pure — no side effects. */
export function planSubtree(templateRoot: string, targetRoot: string, tokens: TokenMap): PlannedFile[] {
  return planFileTree(templateRoot, targetRoot, tokens);
}
