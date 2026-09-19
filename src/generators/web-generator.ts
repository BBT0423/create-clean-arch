import type { FrontendChoice } from "../core/types.js";
import type { PlannedFile } from "../core/file-tree-writer.js";
import type { TokenMap } from "../core/types.js";
import { generateVueWeb } from "./web/vue-generator.js";

/**
 * Dispatches to the per-framework web generator. Only "vue" is implemented. React/Angular/Next
 * are deliberately not implemented: without a real project to verify against, building them
 * would mean guessing conventions. Revisit if/when a real project needs one of them.
 */
export function generateWeb(
  templatesRoot: string,
  solutionRoot: string,
  tokens: TokenMap,
  frontend: FrontendChoice
): PlannedFile[] {
  if (frontend === "vue") {
    return generateVueWeb(templatesRoot, solutionRoot, tokens);
  }

  throw new Error(
    `--frontend ${frontend} is not implemented yet in this build of create-clean-arch. ` +
      `Only "none" and "vue" are currently supported; React/Angular/Next scaffolding is planned for a future release.`
  );
}
