import { join } from "node:path";
import { planSubtree } from "./render-subtree.js";
import type { PlannedFile } from "../core/file-tree-writer.js";
import type { TokenMap } from "../core/types.js";

export interface GenerateFeatureResult {
  plan: PlannedFile[];
  nextSteps: string[];
}

/** Prefix of the "run the EF migration" nextSteps entry — shared so callers can filter for it
 * without the exact wording drifting out of sync between the two spots that need it. */
export const MIGRATION_STEP_PREFIX = "Create an EF Core migration:";

/**
 * Plans one vertical-slice feature (Domain entity + Application CQRS + Infrastructure
 * repository + Api controller) from the shared `templates/feature` subtree, reused by both
 * `create --sample-feature` and `generate feature`. Does NOT write anything — callers merge
 * `.plan` into their own combined plan and classify/write it in one all-or-nothing step.
 *
 * Which Commands/Queries get generated is driven by the Crud* tokens (see
 * `tokenizer.ts#buildFeatureTokenMap` / `--crud`) — each CRUD operation lives in its own
 * template subtree (`Application-create`, `Application-read`, ...) so it can be included or
 * skipped independently. The Domain entity, response DTO, repository, and Api controller are
 * always generated; the controller template is itself conditional per action inside one file.
 */
export function generateFeature(templatesRoot: string, solutionRoot: string, tokens: TokenMap): GenerateFeatureResult {
  const domainTarget = join(solutionRoot, `${tokens.ProjectName}.Domain`);
  const applicationTarget = join(solutionRoot, `${tokens.ProjectName}.Application`);
  const infrastructureTarget = join(solutionRoot, `${tokens.ProjectName}.Infrastructure`);
  const apiTarget = join(solutionRoot, `${tokens.ProjectName}.Api`);

  const plan = [
    ...planSubtree(join(templatesRoot, "feature", "Domain"), domainTarget, tokens),
    ...planSubtree(join(templatesRoot, "feature", "Application"), applicationTarget, tokens),
    ...planSubtree(join(templatesRoot, "feature", "Infrastructure"), infrastructureTarget, tokens),
    ...planSubtree(join(templatesRoot, "feature", "Api"), apiTarget, tokens),
  ];

  if (tokens.CrudCreate === "true") {
    plan.push(...planSubtree(join(templatesRoot, "feature", "Application-create"), applicationTarget, tokens));
  }
  if (tokens.CrudRead === "true") {
    plan.push(...planSubtree(join(templatesRoot, "feature", "Application-read"), applicationTarget, tokens));
  }
  if (tokens.CrudList === "true") {
    plan.push(...planSubtree(join(templatesRoot, "feature", "Application-list"), applicationTarget, tokens));
  }
  if (tokens.CrudUpdate === "true") {
    plan.push(...planSubtree(join(templatesRoot, "feature", "Application-update"), applicationTarget, tokens));
  }
  if (tokens.CrudDelete === "true") {
    plan.push(...planSubtree(join(templatesRoot, "feature", "Application-delete"), applicationTarget, tokens));
  }

  const nextSteps = [
    `Add "public DbSet<${tokens.EntityName}> ${tokens.EntityNamePlural} => Set<${tokens.EntityName}>();" to ${tokens.DbContextName}.cs`,
    `Register the repository: services.AddScoped<I${tokens.EntityName}Repository, ${tokens.EntityName}Repository>(); in InfrastructureServiceRegistration.cs`,
    `${MIGRATION_STEP_PREFIX} dotnet ef migrations add Add${tokens.EntityName} --project ./${tokens.ProjectName}.Infrastructure --startup-project ./${tokens.ProjectName}.Api`,
  ];

  return { plan, nextSteps };
}
