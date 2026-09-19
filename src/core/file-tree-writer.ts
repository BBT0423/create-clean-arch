import fs from "fs-extra";
import { readdirSync, statSync, readFileSync } from "node:fs";
import { join, relative } from "node:path";
import { renderContent, resolvePathTokens } from "./renderer.js";
import type { TokenMap } from "./types.js";

export type PlannedFileStatus = "new" | "unchanged" | "conflict";

export interface PlannedFile {
  /** Absolute path of the source template file. */
  templatePath: string;
  /** Absolute path the file will be written to. */
  targetPath: string;
  /** Rendered content that would be written. */
  content: string;
  status: PlannedFileStatus;
}

function walkTemplateFiles(templateRoot: string): string[] {
  const results: string[] = [];
  const entries = readdirSync(templateRoot);
  for (const entry of entries) {
    const full = join(templateRoot, entry);
    if (statSync(full).isDirectory()) {
      results.push(...walkTemplateFiles(full));
    } else {
      results.push(full);
    }
  }
  return results;
}

function resolveTargetRelativePath(templateRelativePath: string, tokens: TokenMap): string {
  const segments = templateRelativePath.split(/[\\/]/).map((segment) => resolvePathTokens(segment, tokens));
  const last = segments[segments.length - 1];
  if (last.endsWith(".eta")) {
    segments[segments.length - 1] = last.slice(0, -".eta".length);
  }
  return join(...segments);
}

/**
 * Walks a template subtree and computes, for every file, the target path + rendered content
 * + whether it's new / unchanged / conflicting relative to what's already on disk.
 * This is a pure planning pass — nothing is written.
 */
export function planFileTree(templateRoot: string, targetRoot: string, tokens: TokenMap): PlannedFile[] {
  const templateFiles = walkTemplateFiles(templateRoot);
  const plan: PlannedFile[] = [];

  for (const templatePath of templateFiles) {
    const relPath = relative(templateRoot, templatePath);
    const targetRelPath = resolveTargetRelativePath(relPath, tokens);
    const targetPath = join(targetRoot, targetRelPath);

    const isEta = templatePath.endsWith(".eta");
    const rawSource = readFileSync(templatePath, "utf8");
    const content = isEta ? renderContent(rawSource, tokens) : rawSource;

    let status: PlannedFileStatus = "new";
    if (fs.pathExistsSync(targetPath)) {
      const existing = readFileSync(targetPath, "utf8");
      status = existing === content ? "unchanged" : "conflict";
    }

    plan.push({ templatePath, targetPath, content, status });
  }

  return plan;
}

/** Writes every entry in the plan to disk (creating directories as needed). Caller decides which entries belong in the plan. */
export function writeFileTree(plan: PlannedFile[]): void {
  for (const file of plan) {
    fs.ensureDirSync(join(file.targetPath, ".."));
    fs.writeFileSync(file.targetPath, file.content, "utf8");
  }
}
