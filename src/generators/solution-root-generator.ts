import { join } from "node:path";
import { planSubtree } from "./render-subtree.js";
import type { PlannedFile } from "../core/file-tree-writer.js";
import type { SolutionFormat, TokenMap } from "../core/types.js";

export function generateSolutionRoot(
  templatesRoot: string,
  targetRoot: string,
  tokens: TokenMap,
  solutionFormat: SolutionFormat
): PlannedFile[] {
  const solutionFileSubtree = solutionFormat === "slnx" ? "solution-slnx" : "solution-sln";

  return [
    ...planSubtree(join(templatesRoot, "solution"), targetRoot, tokens),
    ...planSubtree(join(templatesRoot, solutionFileSubtree), targetRoot, tokens),
  ];
}
