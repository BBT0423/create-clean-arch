import { join } from "node:path";
import { planSubtree } from "./render-subtree.js";
import type { PlannedFile } from "../core/file-tree-writer.js";
import type { TokenMap } from "../core/types.js";

export function generateInfrastructure(
  templatesRoot: string,
  solutionRoot: string,
  tokens: TokenMap,
  auth: boolean
): PlannedFile[] {
  const targetRoot = join(solutionRoot, `${tokens.ProjectName}.Infrastructure`);

  return [
    ...planSubtree(join(templatesRoot, "infrastructure"), targetRoot, tokens),
    ...planSubtree(join(templatesRoot, auth ? "infrastructure-auth" : "infrastructure-noauth"), targetRoot, tokens),
  ];
}
