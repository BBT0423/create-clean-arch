import { join } from "node:path";
import { planSubtree } from "../render-subtree.js";
import type { PlannedFile } from "../../core/file-tree-writer.js";
import type { TokenMap } from "../../core/types.js";

export function generateVueWeb(templatesRoot: string, solutionRoot: string, tokens: TokenMap): PlannedFile[] {
  const targetRoot = join(solutionRoot, `${tokens.ProjectName}.Web`);
  const plan = planSubtree(join(templatesRoot, "web-vue"), targetRoot, tokens);

  // The Products pages call the sample feature's API, so they only exist when it was generated.
  if (tokens.IncludeSampleFeature === "true") {
    plan.push(...planSubtree(join(templatesRoot, "web-vue-sample"), targetRoot, tokens));
  }

  return plan;
}
