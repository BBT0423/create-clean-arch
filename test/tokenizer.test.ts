import { describe, it, expect } from "vitest";
import { buildSolutionTokenMap, buildFeatureTokenMap, parseCrudOps } from "../src/core/tokenizer.js";
import type { CreateOptions } from "../src/core/types.js";

const baseOptions: CreateOptions = {
  projectName: "my-app",
  outputDir: "/tmp/my-app",
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

describe("buildSolutionTokenMap", () => {
  it("PascalCases the project name for ProjectName and RootNamespace", () => {
    const tokens = buildSolutionTokenMap(baseOptions);
    expect(tokens.ProjectName).toBe("MyApp");
    expect(tokens.RootNamespace).toBe("MyApp");
  });

  it("derives DbContextName from the project name", () => {
    const tokens = buildSolutionTokenMap(baseOptions);
    expect(tokens.DbContextName).toBe("MyAppDbContext");
  });

  it("reflects the auth/web flags as string booleans", () => {
    const tokens = buildSolutionTokenMap({ ...baseOptions, auth: false, frontend: "vue" });
    expect(tokens.IncludeAuth).toBe("false");
    expect(tokens.IncludeWeb).toBe("true");
  });

  it("produces deterministic, distinct GUIDs per layer", () => {
    const tokens = buildSolutionTokenMap(baseOptions);
    const guids = [tokens.ApiGuid, tokens.ApplicationGuid, tokens.DomainGuid, tokens.InfrastructureGuid, tokens.TestsGuid];
    expect(new Set(guids).size).toBe(guids.length);
    for (const guid of guids) {
      expect(guid).toMatch(/^\{[0-9A-F]{8}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{12}\}$/);
    }
  });

  it("is deterministic across repeated calls with the same project name", () => {
    const a = buildSolutionTokenMap(baseOptions);
    const b = buildSolutionTokenMap(baseOptions);
    expect(a.ApiGuid).toBe(b.ApiGuid);
  });

  it("produces different GUIDs for different project names", () => {
    const a = buildSolutionTokenMap(baseOptions);
    const b = buildSolutionTokenMap({ ...baseOptions, projectName: "OtherApp" });
    expect(a.ApiGuid).not.toBe(b.ApiGuid);
  });
});

describe("buildFeatureTokenMap", () => {
  it("does not double-pluralize an already-plural feature name", () => {
    const tokens = buildFeatureTokenMap({ featureName: "Products" });
    expect(tokens.FeatureName).toBe("Products");
    expect(tokens.EntityName).toBe("Product");
  });

  it("pluralizes a singular feature name for FeatureName", () => {
    const tokens = buildFeatureTokenMap({ featureName: "Product" });
    expect(tokens.FeatureName).toBe("Products");
    expect(tokens.EntityName).toBe("Product");
  });

  it("uses an explicit entity name override instead of singularizing", () => {
    const tokens = buildFeatureTokenMap({ featureName: "Inventory", entityName: "StockItem" });
    expect(tokens.EntityName).toBe("StockItem");
    expect(tokens.EntityNameCamel).toBe("stockItem");
    expect(tokens.EntityNamePlural).toBe("StockItems");
  });

  it("defaults to create/read/list with the validator included", () => {
    const tokens = buildFeatureTokenMap({ featureName: "Products" });
    expect(tokens.CrudCreate).toBe("true");
    expect(tokens.CrudRead).toBe("true");
    expect(tokens.CrudList).toBe("true");
    expect(tokens.CrudUpdate).toBe("false");
    expect(tokens.CrudDelete).toBe("false");
    expect(tokens.IncludeValidator).toBe("true");
  });

  it("reflects an explicit crudOps/includeValidator selection", () => {
    const tokens = buildFeatureTokenMap({
      featureName: "Products",
      crudOps: ["update", "delete"],
      includeValidator: false,
    });
    expect(tokens.CrudCreate).toBe("false");
    expect(tokens.CrudRead).toBe("false");
    expect(tokens.CrudList).toBe("false");
    expect(tokens.CrudUpdate).toBe("true");
    expect(tokens.CrudDelete).toBe("true");
    expect(tokens.IncludeValidator).toBe("false");
  });
});

describe("parseCrudOps", () => {
  it("returns the default trio when no value is passed", () => {
    expect(parseCrudOps(undefined)).toEqual(["create", "read", "list"]);
  });

  it("parses a comma-separated list, trimming and lowercasing", () => {
    expect(parseCrudOps(" Create, Read ,list ")).toEqual(["create", "read", "list"]);
  });

  it("throws on an unknown operation", () => {
    expect(() => parseCrudOps("create,frobnicate")).toThrow(/unknown operation/i);
  });

  it("treats an empty string the same as not passed (falls back to the default trio)", () => {
    expect(parseCrudOps("")).toEqual(["create", "read", "list"]);
  });

  it("throws when only commas/whitespace are given", () => {
    expect(() => parseCrudOps(" , ,")).toThrow(/at least one operation/i);
  });
});
