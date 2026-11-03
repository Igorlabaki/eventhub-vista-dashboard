import { z } from "zod";

export function requiredProposalEmail(value: unknown):
  | { ok: true; email: string }
  | { ok: false; message: string } {
  const email = typeof value === "string" ? value.trim() : "";
  if (!email) return { ok: false, message: "E-mail é obrigatório" };
  if (!z.string().email().safeParse(email).success) {
    return { ok: false, message: "E-mail inválido" };
  }
  return { ok: true, email };
}
