import { resolve } from "node:path";
import { input, confirm, select } from "@inquirer/prompts";

import { generateSolution } from "../generators/solution-generator.js";
import { MIGRATION_STEP_PREFIX } from "../generators/feature-generator.js";
import { validateCSharpIdentifier, toPascalCase } from "../core/naming.js";
import { run, commandExists } from "../utils/exec.js";
import { logger } from "../utils/logger.js";
import { OverwriteConflictError } from "../core/overwrite-policy.js";
import type { CreateOptions, FrontendChoice, CiChoice, SolutionFormat } from "../core/types.js";

const MIGRATION_NAME = "InitialCreate";

export interface CreateCliFlags {
  dir?: string;
  frontend?: FrontendChoice;
  db?: string;
  auth?: boolean;
  ci?: CiChoice;
  sampleFeature?: boolean;
  skipInstall?: boolean;
  solutionFormat?: SolutionFormat;
  migrate?: boolean;
  updateDatabase?: boolean;
  yes?: boolean;
  force?: boolean;
}

async function resolveOptions(name: string | undefined, flags: CreateCliFlags): Promise<CreateOptions> {
  const interactive = !flags.yes;

  let projectName = name;
  if (!projectName) {
    projectName = await input({
      message: "Project name:",
      validate: (v) => {
        const result = validateCSharpIdentifier(v);
        return result.valid || result.reason || "Invalid name";
      },
    });
  } else {
    const result = validateCSharpIdentifier(projectName);
    if (!result.valid) {
      throw new Error(`Invalid project name "${projectName}": ${result.reason}`);
    }
  }

  // Normalize once, up front: every generated file/namespace uses toPascalCase(projectName), so
  // options.projectName must already be that same normalized form — otherwise anything derived
  // from the raw input (the default --dir, the printed "next steps" commands) points at a path
  // that doesn't match what was actually generated (e.g. "TEST_CLI" input vs "TESTCLI" output).
  projectName = toPascalCase(projectName);

  const outputDir =
    flags.dir ?? (interactive ? await input({ message: "Output directory:", default: `./${projectName}` }) : `./${projectName}`);

  let frontend = flags.frontend;
  if (!frontend) {
    frontend = interactive
      ? await select<FrontendChoice>({
          message: "Include a frontend?",
          choices: [
            { name: "None (backend only)", value: "none" },
            { name: "Vue 3 + TypeScript", value: "vue" },
            { name: "React + TypeScript (not yet implemented)", value: "react", disabled: true },
            { name: "Angular (not yet implemented)", value: "angular", disabled: true },
            { name: "Next.js (not yet implemented)", value: "next", disabled: true },
          ],
        })
      : "none";
  }

  const auth = flags.auth ?? (interactive ? await confirm({ message: "Include Auth/JWT/MFA baseline?", default: true }) : true);

  let ci = flags.ci;
  if (!ci) {
    ci = interactive
      ? await select<CiChoice>({
          message: "Include a CI pipeline?",
          choices: [
            { name: "None", value: "none" },
            { name: "GitHub Actions", value: "github" },
            { name: "Bitbucket Pipelines", value: "bitbucket" },
          ],
        })
      : "none";
  }

  const sampleFeature =
    flags.sampleFeature ??
    (interactive ? await confirm({ message: "Include a sample CRUD feature (Products)?", default: false }) : false);

  // migrations add never opens a real DB connection (just needs the project to compile), so
  // defaulting to true is safe. database update needs an actually-reachable database, which
  // fails for all sorts of legitimate reasons (unset APP_DB_CONNECTION, unreachable server,
  // wrong instance) — default that to false and only ask at all if a migration will exist.
  const migrate =
    flags.migrate ??
    (interactive
      ? await confirm({ message: "Create an initial EF Core migration now (dotnet ef migrations add InitialCreate)?", default: true })
      : false);

  const updateDatabase =
    flags.updateDatabase ??
    (migrate && interactive
      ? await confirm({
          message: "Apply it to the database now (dotnet ef database update)? Requires a reachable database (APP_DB_CONNECTION).",
          default: false,
        })
      : false);

  if (flags.db && flags.db !== "sqlserver") {
    throw new Error(`--db ${flags.db} is not implemented yet. Only "sqlserver" is currently supported.`);
  }

  const solutionFormat = flags.solutionFormat ?? "sln";
  if (solutionFormat !== "sln" && solutionFormat !== "slnx") {
    throw new Error(`--solution-format ${solutionFormat} is invalid. Use "sln" or "slnx".`);
  }

  return {
    projectName,
    outputDir: resolve(outputDir),
    frontend,
    dbProvider: "sqlserver",
    auth,
    ci,
    sampleFeature,
    skipInstall: flags.skipInstall ?? false,
    solutionFormat,
    migrate,
    updateDatabase,
  };
}

export async function createCommand(name: string | undefined, flags: CreateCliFlags): Promise<void> {
  const options = await resolveOptions(name, flags);

  logger.info(`Scaffolding "${options.projectName}" into ${options.outputDir} ...`);

  let result;
  try {
    result = generateSolution(options, flags.force ?? false);
  } catch (err) {
    if (err instanceof OverwriteConflictError) {
      logger.error(err.message);
      logger.error('Re-run with --force to overwrite, or choose an empty output directory.');
      process.exitCode = 1;
      return;
    }
    throw err;
  }

  logger.success(`Wrote ${result.filesWritten} files to ${result.outputDir}`);

  if (!options.skipInstall) {
    if (await commandExists("dotnet")) {
      logger.info("Running dotnet restore ...");
      await run("dotnet", ["restore"], result.outputDir);
    } else {
      logger.warn("dotnet SDK not found on PATH — skipping dotnet restore.");
    }
  }

  const infraProject = `./${options.projectName}.Infrastructure`;
  const apiProject = `./${options.projectName}.Api`;
  let migrationCreated = false;
  let databaseUpdated = false;

  if (options.migrate) {
    if (!(await commandExists("dotnet-ef"))) {
      logger.warn(
        'dotnet-ef tool not found on PATH — skipping the EF Core migration. Install it with "dotnet tool install --global dotnet-ef" and run the command below manually.'
      );
    } else {
      logger.info(`Creating EF Core migration "${MIGRATION_NAME}" ...`);
      try {
        // No env override needed: the generated .env at the solution root already supplies a
        // working APP_DB_CONNECTION, and Program.cs loads it before EF's design-time host reads it.
        await run(
          "dotnet",
          ["ef", "migrations", "add", MIGRATION_NAME, "--project", infraProject, "--startup-project", apiProject],
          result.outputDir
        );
        migrationCreated = true;
        logger.success(`Created migration "${MIGRATION_NAME}".`);
      } catch (err) {
        logger.warn(`Failed to create the EF Core migration automatically (${err instanceof Error ? err.message : String(err)}).`);
        logger.warn(`Run it manually: dotnet ef migrations add ${MIGRATION_NAME} --project ${infraProject} --startup-project ${apiProject}`);
      }
    }
  }

  if (options.updateDatabase) {
    if (!migrationCreated) {
      logger.warn('Skipping "dotnet ef database update" because no migration was created in this run.');
    } else {
      logger.info("Applying the migration to the database ...");
      try {
        await run("dotnet", ["ef", "database", "update", "--project", infraProject, "--startup-project", apiProject], result.outputDir);
        databaseUpdated = true;
        logger.success("Database updated.");
      } catch (err) {
        logger.warn(
          `Failed to apply the migration automatically (${err instanceof Error ? err.message : String(err)}). This is usually a database connectivity issue (missing/incorrect APP_DB_CONNECTION, unreachable server, wrong instance, etc.).`
        );
        logger.warn(`Run it manually: dotnet ef database update --project ${infraProject} --startup-project ${apiProject}`);
      }
    }
  }

  logger.plain("");
  logger.success("Done. Next steps:");
  logger.plain(`  cd ${options.outputDir}`);
  if (!migrationCreated) {
    logger.plain(`  dotnet ef migrations add ${MIGRATION_NAME} --project ${infraProject} --startup-project ${apiProject}`);
  }
  if (!databaseUpdated) {
    logger.plain(`  dotnet ef database update --project ${infraProject} --startup-project ${apiProject}`);
  }
  logger.plain(`  dotnet run --project ${apiProject}`);

  const remainingNextSteps = migrationCreated
    ? result.nextSteps.filter((step) => !step.startsWith(MIGRATION_STEP_PREFIX))
    : result.nextSteps;
  if (remainingNextSteps.length > 0) {
    logger.plain("");
    logger.plain(`Manual steps to finish wiring the "${options.projectName}" sample feature:`);
    for (const step of remainingNextSteps) {
      logger.plain(`  - ${step}`);
    }
  }

  logger.plain("");
  logger.plain(`A local .env file was generated at ${options.outputDir} with a working APP_DB_CONNECTION` + (options.auth ? " and a random APP_JWT_SECRET" : "") + " — it's gitignored and loaded automatically, no manual env var setup needed for local dev.");
  if (options.auth) {
    logger.plain("  APP_SMTP_USERNAME/APP_SMTP_PASSWORD in that file are dummy placeholders — replace them before enabling EnableEmailNotifications.");
  }
  logger.plain("  APP_DB_CONNECTION assumes SQL Server LocalDB — edit .env if you're targeting a different server.");
}
