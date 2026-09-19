import { join } from "node:path";
import { planSubtree } from "./render-subtree.js";
import type { PlannedFile } from "../core/file-tree-writer.js";
import type { TokenMap } from "../core/types.js";

export function generateTests(
  templatesRoot: string,
  solutionRoot: string,
  tokens: TokenMap,
  auth: boolean
): PlannedFile[] {
  const targetRoot = join(solutionRoot, `${tokens.ProjectName}.Tests`);

  const plan = [...planSubtree(join(templatesRoot, "tests"), targetRoot, tokens)];

  if (auth) {
    plan.push(...planSubtree(join(templatesRoot, "tests-auth"), targetRoot, tokens));
  }

  return plan;
}
