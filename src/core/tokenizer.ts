import { toPascalCase, toCamelCase, pluralize, singularize } from "./naming.js";
import { deterministicGuid } from "../utils/guid.js";
import { generateJwtSecret } from "../utils/secret.js";
import type { CreateOptions, TokenMap } from "./types.js";

/** Builds the token map used to render both file paths and file contents for a `create` run. */
export function buildSolutionTokenMap(options: CreateOptions): TokenMap {
  const projectName = toPascalCase(options.projectName);

  return {
    ProjectName: projectName,
    RootNamespace: projectName,
    DbContextName: `${projectName}DbContext`,
    Year: String(new Date().getFullYear()),
    IncludeAuth: String(options.auth),
    IncludeWeb: String(options.frontend !== "none"),
    IncludeSampleFeature: String(options.sampleFeature),
    GeneratedJwtSecret: generateJwtSecret(),
    GeneratedAppSecretKey: generateJwtSecret(),
    ApiGuid: deterministicGuid(`${projectName}.Api`),
    ApplicationGuid: deterministicGuid(`${projectName}.Application`),
    DomainGuid: deterministicGuid(`${projectName}.Domain`),
    InfrastructureGuid: deterministicGuid(`${projectName}.Infrastructure`),
    TestsGuid: deterministicGuid(`${projectName}.Tests`),
  };
}

export type CrudOp = "create" | "read" | "list" | "update" | "delete";

export const ALL_CRUD_OPS: readonly CrudOp[] = ["create", "read", "list", "update", "delete"];

/** The trio every hand-written feature in the reference repos actually has: create + get-by-id + get-list. */
export const DEFAULT_CRUD_OPS: readonly CrudOp[] = ["create", "read", "list"];

/** Parses a `--crud create,read,list,update,delete` flag value into the set of requested ops. */
export function parseCrudOps(input: string | undefined): CrudOp[] {
  if (!input) return [...DEFAULT_CRUD_OPS];

  const requested = input
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);

  const invalid = requested.filter((op) => !(ALL_CRUD_OPS as string[]).includes(op));
  if (invalid.length > 0) {
    throw new Error(
      `--crud has unknown operation(s): ${invalid.join(", ")}. Valid operations are: ${ALL_CRUD_OPS.join(", ")}`
    );
  }
  if (requested.length === 0) {
    throw new Error(`--crud must list at least one operation: ${ALL_CRUD_OPS.join(", ")}`);
  }

  return requested as CrudOp[];
}

export interface FeatureTokenInput {
  featureName: string;
  entityName?: string;
  crudOps?: CrudOp[];
  includeValidator?: boolean;
}

/** Builds the additional tokens needed on top of the solution map for `generate feature`. */
export function buildFeatureTokenMap(input: FeatureTokenInput): TokenMap {
  const featurePlural = toPascalCase(pluralize(input.featureName));
  const entitySingular = toPascalCase(input.entityName ?? singularize(input.featureName));
  const crudOps = input.crudOps ?? [...DEFAULT_CRUD_OPS];
  const includeValidator = input.includeValidator ?? true;

  return {
    FeatureName: featurePlural,
    EntityName: entitySingular,
    EntityNameCamel: toCamelCase(entitySingular),
    EntityNamePlural: toPascalCase(pluralize(entitySingular)),
    CrudCreate: String(crudOps.includes("create")),
    CrudRead: String(crudOps.includes("read")),
    CrudList: String(crudOps.includes("list")),
    CrudUpdate: String(crudOps.includes("update")),
    CrudDelete: String(crudOps.includes("delete")),
    IncludeValidator: String(includeValidator),
  };
}
