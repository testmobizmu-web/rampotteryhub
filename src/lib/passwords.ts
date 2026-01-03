// lib/passwords.ts
import bcrypt from "bcryptjs";

const ROUNDS = 10; // good default for SaaS (fast + secure)

export async function hashPassword(plain: string): Promise<string> {
  const p = String(plain || "");
  if (p.length < 4) throw new Error("Password too short");
  const salt = await bcrypt.genSalt(ROUNDS);
  return bcrypt.hash(p, salt);
}

export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  const p = String(plain || "");
  const h = String(hash || "");
  if (!p || !h) return false;
  return bcrypt.compare(p, h);
}

// Helper: detect bcrypt format ($2a$ / $2b$ / $2y$)
export function isBcryptHash(v: string | null | undefined): boolean {
  const s = String(v || "");
  return /^\$2[aby]\$\d{2}\$/.test(s);
}
