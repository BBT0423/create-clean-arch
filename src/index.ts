import { Command } from "commander";

import { createCommand } from "./commands/create.js";
import { registerGenerateCommand } from "./commands/generate/index.js";
import { logger } from "./utils/logger.js";
import type { FrontendChoice, CiChoice, SolutionFormat } from "./core/types.js";

// Injected from package.json at build time by tsup.config.ts; undefined when run via `npm run dev`.
declare const __CLI_VERSION__: string | undefined;

const program = new Command();

program
  .name("create-clean-arch")
  .description("Scaffold .NET Clean Architecture solutions with an Auth/JWT/MFA baseline and an optional Vue 3 frontend")
  .version(typeof __CLI_VERSION__ === "undefined" ? "dev" : __CLI_VERSION__);

program
  .command("create")
  .argument("[name]", "Project name")
  .description("Create a new Clean Architecture solution")
  .option("--dir <path>", "Output directory (default: ./<name>)")
  .option("--frontend <choice>", "Frontend framework: none|vue|react|angular|next")
  .option("--db <provider>", "Database provider: sqlserver", "sqlserver")
  .option("--auth", "Include the Auth/JWT/MFA baseline (default)")
  .option("--no-auth", "Skip the Auth/JWT/MFA baseline")
  .option("--ci <provider>", "CI pipeline: none|github|bitbucket")
  .option("--sample-feature", "Include a sample CRUD feature")
  .option("--skip-install", "Skip running dotnet restore after scaffolding")
  .option("--solution-format <format>", "Solution file format: sln|slnx", "sln")
  .option("--migrate", "Create an initial EF Core migration after scaffolding (dotnet ef migrations add InitialCreate)")
  .option("--no-migrate", "Skip creating the EF Core migration")
  .option("--update-database", "Also apply the migration to the database (dotnet ef database update) — requires a reachable database")
  .option("--no-update-database", "Skip applying the migration to the database")
  .option("-y, --yes", "Non-interactive: accept defaults for anything not passed as a flag")
  .option("--force", "Overwrite files that already exist and differ")
  .action(async (name: string | undefined, opts) => {
    await createCommand(name, {
      dir: opts.dir,
      frontend: opts.frontend as FrontendChoice,
      db: opts.db,
      auth: opts.auth,
      ci: opts.ci as CiChoice,
      sampleFeature: opts.sampleFeature,
      skipInstall: opts.skipInstall,
      solutionFormat: opts.solutionFormat as SolutionFormat,
      migrate: opts.migrate,
      updateDatabase: opts.updateDatabase,
      yes: opts.yes,
      force: opts.force,
    });
  });

registerGenerateCommand(program);

program.parseAsync(process.argv).catch((err) => {
  logger.error(err instanceof Error ? err.message : String(err));
  process.exitCode = 1;
});
