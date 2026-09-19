import { join } from "node:path";
import { planSubtree } from "./render-subtree.js";
import type { PlannedFile } from "../core/file-tree-writer.js";
import type { TokenMap } from "../core/types.js";

export function generateApi(
  templatesRoot: string,
  solutionRoot: string,
  tokens: TokenMap,
  auth: boolean
): PlannedFile[] {
  const targetRoot = join(solutionRoot, `${tokens.ProjectName}.Api`);

  return [
    ...planSubtree(join(templatesRoot, "api"), targetRoot, tokens),
    ...planSubtree(join(templatesRoot, auth ? "api-auth" : "api-noauth"), targetRoot, tokens),
  ];
}
