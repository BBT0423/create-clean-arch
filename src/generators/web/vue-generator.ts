import { join } from "node:path";
import { planSubtree } from "../render-subtree.js";
import type { PlannedFile } from "../../core/file-tree-writer.js";
import type { TokenMap } from "../../core/types.js";

export function generateVueWeb(templatesRoot: string, solutionRoot: string, tokens: TokenMap): PlannedFile[] {
  const targetRoot = join(solutionRoot, `${tokens.ProjectName}.Web`);
  return planSubtree(join(templatesRoot, "web-vue"), targetRoot, tokens);
}
