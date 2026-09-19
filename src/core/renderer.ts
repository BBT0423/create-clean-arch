import { Eta } from "eta";
import type { TokenMap } from "./types.js";

const eta = new Eta({ autoTrim: false });

/** Renders one template file's contents through Eta with the given token map. */
export function renderContent(templateSource: string, tokens: TokenMap): string {
  return eta.renderString(templateSource, tokens);
}

/** Resolves `{Token}` placeholders in a directory/file NAME (not full Eta syntax, just simple substitution). */
export function resolvePathTokens(pathSegment: string, tokens: TokenMap): string {
  return pathSegment.replace(/\{(\w+)\}/g, (match, key) => {
    return key in tokens ? tokens[key] : match;
  });
}
