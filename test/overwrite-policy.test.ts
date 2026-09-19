import { describe, it, expect } from "vitest";
import { classifyPlan, OverwriteConflictError } from "../src/core/overwrite-policy.js";
import type { PlannedFile } from "../src/core/file-tree-writer.js";

function file(targetPath: string, status: PlannedFile["status"]): PlannedFile {
  return { templatePath: `/templates/${targetPath}`, targetPath, content: "content", status };
}

describe("classifyPlan", () => {
  it("puts new files in toWrite and leaves conflicts/unchanged out when force is false", () => {
    const plan = [file("a.cs", "new"), file("b.cs", "unchanged"), file("c.cs", "conflict")];

    const result = classifyPlan(plan, { force: false });

    expect(result.toWrite.map((f) => f.targetPath)).toEqual(["a.cs"]);
    expect(result.unchanged.map((f) => f.targetPath)).toEqual(["b.cs"]);
    expect(result.conflicts.map((f) => f.targetPath)).toEqual(["c.cs"]);
  });

  it("folds conflicts into toWrite when force is true, and reports zero remaining conflicts", () => {
    const plan = [file("a.cs", "new"), file("c.cs", "conflict")];

    const result = classifyPlan(plan, { force: true });

    expect(result.toWrite.map((f) => f.targetPath).sort()).toEqual(["a.cs", "c.cs"]);
    expect(result.conflicts).toEqual([]);
  });

  it("never throws — pure classification only", () => {
    const plan = [file("c.cs", "conflict")];
    expect(() => classifyPlan(plan, { force: false })).not.toThrow();
  });

  it("aggregates conflicts across a plan merged from multiple subtrees", () => {
    // Simulates the fix for the bug where conflicts were thrown per-subtree instead of
    // being collected across the whole run before deciding to fail.
    const domainPlan = [file("Domain/A.cs", "conflict")];
    const applicationPlan = [file("Application/B.cs", "new")];
    const apiPlan = [file("Api/C.cs", "conflict")];
    const merged = [...domainPlan, ...applicationPlan, ...apiPlan];

    const result = classifyPlan(merged, { force: false });

    expect(result.conflicts).toHaveLength(2);
    expect(result.conflicts.map((f) => f.targetPath).sort()).toEqual(["Api/C.cs", "Domain/A.cs"]);
  });
});

describe("OverwriteConflictError", () => {
  it("lists every conflicting path in its message", () => {
    const conflicts = [file("a.cs", "conflict"), file("b.cs", "conflict")];
    const error = new OverwriteConflictError(conflicts);

    expect(error.message).toContain("a.cs");
    expect(error.message).toContain("b.cs");
    expect(error.conflicts).toBe(conflicts);
  });
});
