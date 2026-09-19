import { describe, it, expect } from "vitest";
import {
  toPascalCase,
  toCamelCase,
  toKebabCase,
  pluralize,
  singularize,
  validateCSharpIdentifier,
} from "../src/core/naming.js";

describe("toPascalCase", () => {
  it("capitalizes a plain lowercase word", () => {
    expect(toPascalCase("products")).toBe("Products");
  });

  it("converts kebab-case", () => {
    expect(toPascalCase("my-app")).toBe("MyApp");
  });

  it("converts snake_case", () => {
    expect(toPascalCase("my_app")).toBe("MyApp");
  });

  it("converts space separated words", () => {
    expect(toPascalCase("my app")).toBe("MyApp");
  });

  it("leaves already-PascalCase input unchanged", () => {
    expect(toPascalCase("MyApp")).toBe("MyApp");
  });

  it("splits camelCase boundaries", () => {
    expect(toPascalCase("myApp")).toBe("MyApp");
  });
});

describe("toCamelCase", () => {
  it("lowercases the first letter of the PascalCase form", () => {
    expect(toCamelCase("Products")).toBe("products");
    expect(toCamelCase("my-app")).toBe("myApp");
  });
});

describe("toKebabCase", () => {
  it("converts PascalCase to kebab-case", () => {
    expect(toKebabCase("MyApp")).toBe("my-app");
  });
});

describe("pluralize", () => {
  it("is idempotent on words that already look plural", () => {
    expect(pluralize("Products")).toBe("Products");
    expect(pluralize("Users")).toBe("Users");
  });

  it("pluralizes a plain singular noun", () => {
    expect(pluralize("Product")).toBe("Products");
  });

  it("adds -es for words ending in x/z/ch/sh", () => {
    expect(pluralize("Box")).toBe("Boxes");
  });

  it("converts trailing consonant+y to -ies", () => {
    expect(pluralize("Category")).toBe("Categories");
  });
});

describe("singularize", () => {
  it("singularizes a plain plural noun", () => {
    expect(singularize("Products")).toBe("Product");
  });

  it("converts -ies back to -y", () => {
    expect(singularize("Categories")).toBe("Category");
  });

  it("leaves a word that is not plural unchanged", () => {
    expect(singularize("Data")).toBe("Data");
  });
});

describe("validateCSharpIdentifier", () => {
  it("accepts a normal name", () => {
    expect(validateCSharpIdentifier("MyApp").valid).toBe(true);
  });

  it("rejects an empty name", () => {
    expect(validateCSharpIdentifier("").valid).toBe(false);
  });

  it("rejects a reserved C# keyword", () => {
    const result = validateCSharpIdentifier("class");
    expect(result.valid).toBe(false);
    expect(result.reason).toMatch(/reserved/i);
  });

  it("accepts a name that needs PascalCasing first", () => {
    expect(validateCSharpIdentifier("my-app").valid).toBe(true);
  });
});
