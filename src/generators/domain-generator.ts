import { join } from "node:path";
import { planSubtree } from "./render-subtree.js";
import type { PlannedFile } from "../core/file-tree-writer.js";
import type { TokenMap } from "../core/types.js";

export function generateDomain(
  templatesRoot: string,
  solutionRoot: string,
  tokens: TokenMap,
  auth: boolean
): PlannedFile[] {
  const targetRoot = join(solutionRoot, `${tokens.ProjectName}.Domain`);

  return [
    ...planSubtree(join(templatesRoot, "domain"), targetRoot, tokens),
    ...planSubtree(join(templatesRoot, auth ? "domain-auth" : "domain-noauth"), targetRoot, tokens),
  ];
}
