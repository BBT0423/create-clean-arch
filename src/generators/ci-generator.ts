import { join } from "node:path";
import { planSubtree } from "./render-subtree.js";
import type { PlannedFile } from "../core/file-tree-writer.js";
import type { CiChoice, TokenMap } from "../core/types.js";

/**
 * Generates CI pipeline config for the chosen provider. Both are generic (no Jira branch-name
 * or SonarCloud-specific wiring baked in, unlike the Bitbucket Pipelines seen in the reference
 * repo) — just restore/build/test for the backend, plus lint/build for the frontend when one
 * was included.
 */
export function generateCi(templatesRoot: string, solutionRoot: string, tokens: TokenMap, ci: CiChoice): PlannedFile[] {
  if (ci === "none") return [];

  const subtree = ci === "github" ? "github" : "bitbucket";
  return planSubtree(join(templatesRoot, "ci", subtree), solutionRoot, tokens);
}
