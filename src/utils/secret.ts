import { randomBytes } from "node:crypto";

/** Generates a cryptographically random secret suitable for JWT HMAC signing (384 bits, base64). */
export function generateJwtSecret(): string {
  return randomBytes(48).toString("base64");
}
