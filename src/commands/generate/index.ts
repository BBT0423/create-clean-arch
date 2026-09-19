import { Command } from "commander";
import { generateFeatureCommand } from "./feature.js";

export function registerGenerateCommand(program: Command): void {
  const generate = program.command("generate").description("Generate code into an existing project created with \"create\"");

  generate
    .command("feature")
    .argument("[name]", "Feature name (e.g. Products)")
    .description("Generate a vertical-slice feature (Domain entity + CQRS commands/queries + repository + controller)")
    .option("--entity <name>", "Entity name if different from the singularized feature name")
    .option("--crud <ops>", "Comma-separated operations to generate: create,read,list,update,delete (default: create,read,list)")
    .option("--validator", "Include FluentValidation validators (default)")
    .option("--no-validator", "Skip generating FluentValidation validators")
    .option("--force", "Overwrite files that already exist and differ")
    .option("--dry-run", "Print the file plan without writing anything")
    .option("-y, --yes", "Do not prompt; fail if required info is missing")
    .action(async (name: string | undefined, opts) => {
      await generateFeatureCommand(name, opts);
    });
}
