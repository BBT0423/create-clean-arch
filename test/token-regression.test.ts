import { describe, it, expect, afterAll } from "vitest";
import { mkdtempSync, rmSync, readdirSync, statSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";

import { generateSolution } from "../src/generators/solution-generator.js";
import { generateFeature } from "../src/generators/feature-generator.js";
import { buildSolutionTokenMap, buildFeatureTokenMap } from "../src/core/tokenizer.js";
import { resolveTemplatesRoot } from "../src/core/template-root.js";
import { writeFileTree } from "../src/core/file-tree-writer.js";
import { classifyPlan } from "../src/core/overwrite-policy.js";
import type { CreateOptions } from "../src/core/types.js";

// Regression test: a literal project name from the source a template was copied from once
// survived into generated output. Every file this CLI writes must have every `{Token}`
// placeholder replaced, and must never contain the name of a project the templates were derived from.

const FORBIDDEN_TOKENS = [
  "{ProjectName}",
  "{RootNamespace}",
  "{DbContextName}",
  "{FeatureName}",
  "{EntityName}",
  "{EntityNameCamel}",
  "{EntityNamePlural}",
  "{Year}",
];

// Names of projects the templates were derived from — must never leak into output.
const FORBIDDEN_REFERENCE_NAMES = ["SummaryYearSalary", "Stackapp", "ReadManga"];

function walkFiles(root: string): string[] {
  const results: string[] = [];
  for (const entry of readdirSync(root)) {
    const full = join(root, entry);
    if (statSync(full).isDirectory()) {
      results.push(...walkFiles(full));
    } else {
      results.push(full);
    }
  }
  return results;
}

function assertNoLeftoverTokens(root: string) {
  const files = walkFiles(root);
  expect(files.length).toBeGreaterThan(0);

  for (const file of files) {
    for (const token of FORBIDDEN_TOKENS) {
      expect(file, `leftover token "${token}" in path`).not.toContain(token);
    }

    const content = readFileSync(file, "utf8");
    for (const token of FORBIDDEN_TOKENS) {
      expect(content, `leftover token "${token}" in ${file}`).not.toContain(token);
    }
    for (const name of FORBIDDEN_REFERENCE_NAMES) {
      expect(content, `leaked reference project name "${name}" in ${file}`).not.toContain(name);
    }
  }
}

describe("generated output has no leftover {Token} placeholders or leaked reference names", () => {
  const tempDirs: string[] = [];

  afterAll(() => {
    for (const dir of tempDirs) {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  function makeTempDir(prefix: string): string {
    const dir = mkdtempSync(join(tmpdir(), prefix));
    tempDirs.push(dir);
    return dir;
  }

  it("backend-only, auth enabled (default)", () => {
    const outputDir = join(makeTempDir("cca-tok-default-"), "DefaultApp");
    const options: CreateOptions = {
      projectName: "DefaultApp",
      outputDir,
      frontend: "none",
      dbProvider: "sqlserver",
      auth: true,
      ci: "none",
      sampleFeature: false,
      skipInstall: true,
      solutionFormat: "sln",
      migrate: false,
      updateDatabase: false,
    };
    generateSolution(options);
    assertNoLeftoverTokens(outputDir);
  });

  it("--no-auth", () => {
    const outputDir = join(makeTempDir("cca-tok-noauth-"), "NoAuthApp");
    const options: CreateOptions = {
      projectName: "NoAuthApp",
      outputDir,
      frontend: "none",
      dbProvider: "sqlserver",
      auth: false,
      ci: "none",
      sampleFeature: false,
      skipInstall: true,
      solutionFormat: "sln",
      migrate: false,
      updateDatabase: false,
    };
    generateSolution(options);
    assertNoLeftoverTokens(outputDir);
  });

  it("--sample-feature + --ci github + --solution-format slnx", () => {
    const outputDir = join(makeTempDir("cca-tok-sample-"), "SampleApp");
    const options: CreateOptions = {
      projectName: "SampleApp",
      outputDir,
      frontend: "none",
      dbProvider: "sqlserver",
      auth: true,
      ci: "github",
      sampleFeature: true,
      skipInstall: true,
      solutionFormat: "slnx",
      migrate: false,
      updateDatabase: false,
    };
    generateSolution(options);
    assertNoLeftoverTokens(outputDir);
  });

  it("--frontend vue + --ci bitbucket", () => {
    const outputDir = join(makeTempDir("cca-tok-vue-"), "VueApp");
    const options: CreateOptions = {
      projectName: "VueApp",
      outputDir,
      frontend: "vue",
      dbProvider: "sqlserver",
      auth: true,
      ci: "bitbucket",
      sampleFeature: false,
      skipInstall: true,
      solutionFormat: "sln",
      migrate: false,
      updateDatabase: false,
    };
    generateSolution(options);
    assertNoLeftoverTokens(outputDir);
  });

  it("generate feature with full CRUD + custom entity name", () => {
    const outputDir = join(makeTempDir("cca-tok-feature-"), "FeatureApp");
    const options: CreateOptions = {
      projectName: "FeatureApp",
      outputDir,
      frontend: "none",
      dbProvider: "sqlserver",
      auth: true,
      ci: "none",
      sampleFeature: false,
      skipInstall: true,
      solutionFormat: "sln",
      migrate: false,
      updateDatabase: false,
    };
    generateSolution(options);

    const templatesRoot = resolveTemplatesRoot();
    const solutionTokens = buildSolutionTokenMap(options);
    const featureTokens = buildFeatureTokenMap({
      featureName: "Orders",
      entityName: "Order",
      crudOps: ["create", "read", "list", "update", "delete"],
      includeValidator: true,
    });
    const feature = generateFeature(templatesRoot, outputDir, { ...solutionTokens, ...featureTokens });
    const resolved = classifyPlan(feature.plan, { force: false });
    writeFileTree(resolved.toWrite);

    assertNoLeftoverTokens(outputDir);
  });
});
