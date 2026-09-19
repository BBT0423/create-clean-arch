import fs from "fs-extra";
import { join } from "node:path";
import type { CleanArchConfig } from "./types.js";

export const CONFIG_FILE_NAME = ".cleanarch.json";

export function writeProjectConfig(targetDir: string, config: CleanArchConfig): void {
  fs.writeJsonSync(join(targetDir, CONFIG_FILE_NAME), config, { spaces: 2 });
}

export function findProjectConfig(startDir: string): CleanArchConfig | null {
  const configPath = join(startDir, CONFIG_FILE_NAME);
  if (!fs.pathExistsSync(configPath)) {
    return null;
  }
  return fs.readJsonSync(configPath) as CleanArchConfig;
}
