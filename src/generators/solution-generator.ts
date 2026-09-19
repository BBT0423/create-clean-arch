import fs from "fs-extra";

import { buildSolutionTokenMap, buildFeatureTokenMap } from "../core/tokenizer.js";
import { writeProjectConfig } from "../core/project-config.js";
import { classifyPlan, OverwriteConflictError } from "../core/overwrite-policy.js";
import { writeFileTree, type PlannedFile } from "../core/file-tree-writer.js";
import { resolveTemplatesRoot } from "../core/template-root.js";
import type { CreateOptions, CleanArchConfig } from "../core/types.js";

import { generateSolutionRoot } from "./solution-root-generator.js";
import { generateDomain } from "./domain-generator.js";
import { generateApplication } from "./application-generator.js";
import { generateInfrastructure } from "./infrastructure-generator.js";
import { generateApi } from "./api-generator.js";
import { generateTests } from "./tests-generator.js";
import { generateWeb } from "./web-generator.js";
import { generateCi } from "./ci-generator.js";
import { generateFeature, MIGRATION_STEP_PREFIX } from "./feature-generator.js";

const CLI_VERSION = "0.1.0";
const SAMPLE_FEATURE_NAME = "Products";

export interface GenerateSolutionResult {
  outputDir: string;
  filesWritten: number;
  nextSteps: string[];
}

export function generateSolution(options: CreateOptions, force = false): GenerateSolutionResult {
  if (options.frontend !== "none" && !options.auth) {
    throw new Error(
      `--frontend ${options.frontend} requires the Auth baseline (its Login/OTP/Profile pages call the ` +
        `Authorize/User API endpoints). Drop --no-auth, or use --frontend none for a backend-only, auth-free project.`
    );
  }

  const templatesRoot = resolveTemplatesRoot();
  let tokens = buildSolutionTokenMap(options);
  const outputDir = options.outputDir;

  fs.ensureDirSync(outputDir);

  // Computed up front (before any layer is planned) so the sample feature's entity tokens
  // (EntityName, EntityNamePlural, ...) are already available when Infrastructure renders —
  // that's what lets the DbSet/repository-registration lines below be wired in automatically
  // instead of left as a manual step (safe here because these files are freshly generated in
  // this same run, unlike `generate feature`'s edit-an-existing-project case).
  if (options.sampleFeature) {
    const featureTokens = buildFeatureTokenMap({ featureName: SAMPLE_FEATURE_NAME });
    tokens = { ...tokens, ...featureTokens };
  }

  let plan: PlannedFile[] = [
    ...generateSolutionRoot(templatesRoot, outputDir, tokens, options.solutionFormat),
    ...generateDomain(templatesRoot, outputDir, tokens, options.auth),
    ...generateApplication(templatesRoot, outputDir, tokens, options.auth),
    ...generateInfrastructure(templatesRoot, outputDir, tokens, options.auth),
    ...generateApi(templatesRoot, outputDir, tokens, options.auth),
    ...generateTests(templatesRoot, outputDir, tokens, options.auth),
  ];

  if (options.frontend !== "none") {
    plan = [...plan, ...generateWeb(templatesRoot, outputDir, tokens, options.frontend)];
  }

  if (options.ci !== "none") {
    plan = [...plan, ...generateCi(templatesRoot, outputDir, tokens, options.ci)];
  }

  let sampleFeatureNextSteps: string[] = [];
  if (options.sampleFeature) {
    const feature = generateFeature(templatesRoot, outputDir, tokens);
    plan = [...plan, ...feature.plan];
    // The DbSet + repository-registration steps are auto-wired via IncludeSampleFeature above —
    // only the "run the EF migration" step is still genuinely manual (requires the dotnet SDK).
    sampleFeatureNextSteps = feature.nextSteps.filter((step) => step.startsWith(MIGRATION_STEP_PREFIX));
  }

  // Single all-or-nothing classification across every layer generated in this run.
  const resolved = classifyPlan(plan, { force });
  if (resolved.conflicts.length > 0) {
    throw new OverwriteConflictError(resolved.conflicts);
  }
  writeFileTree(resolved.toWrite);

  const config: CleanArchConfig = {
    cliVersion: CLI_VERSION,
    createdWith: CLI_VERSION,
    projectName: tokens.ProjectName,
    rootNamespace: tokens.RootNamespace,
    options: {
      frontend: options.frontend,
      dbProvider: options.dbProvider,
      auth: options.auth,
      ci: options.ci,
      solutionFormat: options.solutionFormat,
    },
    layers: {
      domain: `${tokens.ProjectName}.Domain`,
      application: `${tokens.ProjectName}.Application`,
      infrastructure: `${tokens.ProjectName}.Infrastructure`,
      api: `${tokens.ProjectName}.Api`,
      tests: `${tokens.ProjectName}.Tests`,
      ...(options.frontend !== "none" ? { web: `${tokens.ProjectName}.Web` } : {}),
    },
  };
  writeProjectConfig(outputDir, config);

  return {
    outputDir,
    filesWritten: resolved.toWrite.length + 1, // +1 for .cleanarch.json
    nextSteps: sampleFeatureNextSteps,
  };
}
