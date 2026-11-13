import type { Owner } from "@/types/owner";
import { companySizeLabel, formatCnpj, personTypeOf } from "./owner-document";

/** Campos `owner.*` de `DynamicField`; so estes saem em branco quando vazios. */
export const OWNER_TEMPLATE_FIELDS = [
  "completeName",
  "rg",
  "cpf",
  "pix",
  "street",
  "streetNumber",
  "complement",
  "neighborhood",
  "city",
  "state",
  "cep",
  "companyName",
  "cnpj",
  "companySize",
] as const;

const COMPANY_FIELDS = new Set(["companyName", "cnpj", "companySize"]);

/** `undefined` (campo desconhecido) mantem o marcador `{{owner.x}}`; campo conhecido sem valor vira "". */
export function resolveOwnerTemplateValue(owner: Partial<Owner> | null | undefined, prop: string | undefined): string | undefined {
  if (!prop || !(OWNER_TEMPLATE_FIELDS as readonly string[]).includes(prop)) return undefined;
  if (!owner) return "";
  if (COMPANY_FIELDS.has(prop) && personTypeOf(owner) === "PF") return "";
  if (prop === "cnpj") return formatCnpj(owner.cnpj);
  if (prop === "companySize") return companySizeLabel(owner.companySize);

  const value = owner[prop as keyof Owner];
  return value === null || value === undefined ? "" : String(value);
}
