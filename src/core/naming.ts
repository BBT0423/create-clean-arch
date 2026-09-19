const CSHARP_RESERVED_KEYWORDS = new Set([
  "abstract", "as", "base", "bool", "break", "byte", "case", "catch", "char", "checked",
  "class", "const", "continue", "decimal", "default", "delegate", "do", "double", "else",
  "enum", "event", "explicit", "extern", "false", "finally", "fixed", "float", "for",
  "foreach", "goto", "if", "implicit", "in", "int", "interface", "internal", "is", "lock",
  "long", "namespace", "new", "null", "object", "operator", "out", "override", "params",
  "private", "protected", "public", "readonly", "ref", "return", "sbyte", "sealed",
  "short", "sizeof", "stackalloc", "static", "string", "struct", "switch", "this", "throw",
  "true", "try", "typeof", "uint", "ulong", "unchecked", "unsafe", "ushort", "using",
  "virtual", "void", "volatile", "while",
]);

export function toPascalCase(input: string): string {
  const words = input
    .trim()
    .split(/[\s_\-]+|(?=[A-Z][a-z])/)
    .filter(Boolean);
  if (words.length === 0) return "";
  return words
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join("")
    .replace(/[^A-Za-z0-9]/g, "");
}

export function toCamelCase(input: string): string {
  const pascal = toPascalCase(input);
  if (!pascal) return pascal;
  return pascal.charAt(0).toLowerCase() + pascal.slice(1);
}

export function toKebabCase(input: string): string {
  return input
    .trim()
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .replace(/[\s_]+/g, "-")
    .toLowerCase();
}

/** Very small heuristic English pluralizer/singularizer, good enough for entity/feature names. */
export function pluralize(word: string): string {
  if (/s$/i.test(word)) return word; // already looks plural — idempotent
  if (/[xz]$|[^aeiou]h$/i.test(word)) return `${word}es`;
  if (/[^aeiou]y$/i.test(word)) return `${word.slice(0, -1)}ies`;
  return `${word}s`;
}

export function singularize(word: string): string {
  if (/ies$/i.test(word)) return `${word.slice(0, -3)}y`;
  if (/(ses|xes|zes|ches|shes)$/i.test(word)) return word.slice(0, -2);
  if (/s$/i.test(word) && !/ss$/i.test(word)) return word.slice(0, -1);
  return word;
}

export interface IdentifierValidationResult {
  valid: boolean;
  reason?: string;
}

/** Validates a string can be used as a C# identifier / namespace segment once PascalCased. */
export function validateCSharpIdentifier(input: string): IdentifierValidationResult {
  if (!input || !input.trim()) {
    return { valid: false, reason: "Name cannot be empty." };
  }
  const pascal = toPascalCase(input);
  if (!pascal) {
    return { valid: false, reason: "Name must contain at least one letter or digit." };
  }
  if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(pascal)) {
    return { valid: false, reason: "Name must be a valid C# identifier (letters, digits, underscore; cannot start with a digit)." };
  }
  if (CSHARP_RESERVED_KEYWORDS.has(pascal.toLowerCase())) {
    return { valid: false, reason: `"${pascal}" is a reserved C# keyword.` };
  }
  return { valid: true };
}
