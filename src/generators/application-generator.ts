import { join } from "node:path";
import { planSubtree } from "./render-subtree.js";
import type { PlannedFile } from "../core/file-tree-writer.js";
import type { TokenMap } from "../core/types.js";

export function generateApplication(
  templatesRoot: string,
  solutionRoot: string,
  tokens: TokenMap,
  auth: boolean
): PlannedFile[] {
  const targetRoot = join(solutionRoot, `${tokens.ProjectName}.Application`);

  const plan = [...planSubtree(join(templatesRoot, "application"), targetRoot, tokens)];

  if (auth) {
    plan.push(...planSubtree(join(templatesRoot, "application-auth"), targetRoot, tokens));
  }

  return plan;
}
