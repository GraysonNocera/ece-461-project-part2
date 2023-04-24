import { createHash } from "crypto";

export function hashPassword(password: string): string {
  const salt = "ece461isfun";
  const hash = createHash("sha256");
  hash.update(password + salt);
  return hash.digest("hex");
}

export function verifyPassword(password: string, hashedPassword: string): boolean {
  const hash = hashPassword(password);
  return hash === hashedPassword;
}
