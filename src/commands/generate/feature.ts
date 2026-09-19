import { input } from "@inquirer/prompts";

import { findProjectConfig } from "../../core/project-config.js";
import { resolveTemplatesRoot } from "../../core/template-root.js";
import { buildFeatureTokenMap, parseCrudOps } from "../../core/tokenizer.js";
import { validateCSharpIdentifier } from "../../core/naming.js";
import { classifyPlan, OverwriteConflictError } from "../../core/overwrite-policy.js";
import { writeFileTree } from "../../core/file-tree-writer.js";
import { generateFeature } from "../../generators/feature-generator.js";
import { logger } from "../../utils/logger.js";
import type { TokenMap } from "../../core/types.js";

export interface GenerateFeatureFlags {
  entity?: string;
  crud?: string;
  validator?: boolean;
  force?: boolean;
  dryRun?: boolean;
  yes?: boolean;
}

export async function generateFeatureCommand(name: string | undefined, flags: GenerateFeatureFlags): Promise<void> {
  const projectDir = process.cwd();
  const config = findProjectConfig(projectDir);

  if (!config) {
    logger.error(
      `No .cleanarch.json found in ${projectDir}. Run this command inside a project created with "create-clean-arch create", or scaffold one first.`
    );
    process.exitCode = 1;
    return;
  }

  let featureName = name;
  if (!featureName) {
    featureName = await input({
      message: "Feature name (e.g. Products):",
      validate: (v) => {
        const result = validateCSharpIdentifier(v);
        return result.valid || result.reason || "Invalid name";
      },
    });
  }

  const entityName = flags.entity;
  const crudOps = parseCrudOps(flags.crud);
  const includeValidator = flags.validator ?? true;

  const solutionTokens: TokenMap = {
    ProjectName: config.projectName,
    RootNamespace: config.rootNamespace,
    DbContextName: `${config.projectName}DbContext`,
  };
  const featureTokens = buildFeatureTokenMap({ featureName, entityName, crudOps, includeValidator });
  const tokens: TokenMap = { ...solutionTokens, ...featureTokens };

  const templatesRoot = resolveTemplatesRoot();

  logger.info(`Planning feature "${tokens.FeatureName}" (entity "${tokens.EntityName}") into ${projectDir} ...`);

  const { plan, nextSteps } = generateFeature(templatesRoot, projectDir, tokens);

  if (flags.dryRun) {
    // Dry run always reports the TRUE conflict set, regardless of --force.
    const preview = classifyPlan(plan, {});
    logger.info(
      `Dry run — would write ${preview.toWrite.length} new file(s), skip ${preview.unchanged.length} unchanged, ${preview.conflicts.length} conflict(s).`
    );
    for (const file of preview.toWrite) logger.plain(`  + ${file.targetPath}`);
    for (const file of preview.conflicts) logger.plain(`  ! ${file.targetPath} (conflicts with existing content)`);
    return;
  }

  const resolved = classifyPlan(plan, { force: flags.force ?? false });
  if (resolved.conflicts.length > 0) {
    logger.error(new OverwriteConflictError(resolved.conflicts).message);
    logger.error("Re-run with --force to overwrite, or --dry-run to preview without writing.");
    process.exitCode = 1;
    return;
  }

  writeFileTree(resolved.toWrite);

  logger.success(`Wrote ${resolved.toWrite.length} files (${resolved.unchanged.length} already up to date).`);
  logger.plain("");
  logger.plain("Manual next steps (not auto-applied):");
  for (const step of nextSteps) {
    logger.plain(`  - ${step}`);
  }
}
