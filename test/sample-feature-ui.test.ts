import { describe, it, expect, afterAll } from "vitest";
import { existsSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";

import { generateSolution } from "../src/generators/solution-generator.js";
import type { CreateOptions } from "../src/core/types.js";

describe("sample feature Vue pages", () => {
  const tempDirs: string[] = [];

  afterAll(() => {
    for (const dir of tempDirs) {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  function generate(name: string, overrides: Partial<CreateOptions>): string {
    const dir = mkdtempSync(join(tmpdir(), "cca-sample-ui-"));
    tempDirs.push(dir);
    const outputDir = join(dir, name);
    generateSolution({
      projectName: name,
      outputDir,
      frontend: "vue",
      dbProvider: "sqlserver",
      auth: true,
      ci: "none",
      sampleFeature: false,
      skipInstall: true,
      solutionFormat: "sln",
      migrate: false,
      updateDatabase: false,
      ...overrides,
    });
    return join(outputDir, `${name}.Web`, "src");
  }

  it("adds the Products page, service, route and menu item with --sample-feature", () => {
    const src = generate("ShopApp", { sampleFeature: true });

    expect(existsSync(join(src, "views", "products", "ProductsView.vue"))).toBe(true);
    expect(existsSync(join(src, "services", "productService.ts"))).toBe(true);
    expect(existsSync(join(src, "types", "product.ts"))).toBe(true);
    expect(readFileSync(join(src, "router", "user-route.ts"), "utf8")).toContain("ProductsView.vue");
    expect(readFileSync(join(src, "components", "admin", "AdminSidebar.vue"), "utf8")).toContain("/pages/products");
  });

  it("does not add any Products UI without --sample-feature", () => {
    const src = generate("PlainApp", { sampleFeature: false });

    expect(existsSync(join(src, "views", "products"))).toBe(false);
    expect(existsSync(join(src, "services", "productService.ts"))).toBe(false);
    expect(readFileSync(join(src, "router", "user-route.ts"), "utf8")).not.toContain("products");
    expect(readFileSync(join(src, "components", "admin", "AdminSidebar.vue"), "utf8")).not.toContain("products");
  });

  it("adds no web files at all with --frontend none, even with --sample-feature", () => {
    const dir = mkdtempSync(join(tmpdir(), "cca-sample-ui-none-"));
    tempDirs.push(dir);
    const outputDir = join(dir, "ApiOnly");
    generateSolution({
      projectName: "ApiOnly",
      outputDir,
      frontend: "none",
      dbProvider: "sqlserver",
      auth: true,
      ci: "none",
      sampleFeature: true,
      skipInstall: true,
      solutionFormat: "sln",
      migrate: false,
      updateDatabase: false,
    });

    expect(existsSync(join(outputDir, "ApiOnly.Web"))).toBe(false);
  });
});
