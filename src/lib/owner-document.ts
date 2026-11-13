import type { CompanySize, Owner, OwnerPersonType } from "@/types/owner";

export const CNPJ_FORMAT = /^[A-Z0-9]{12}\d{2}$/;

export const OWNER_COMPANY_REQUIRED = "Informe a razão social e o CNPJ da empresa.";
export const OWNER_CNPJ_FORMAT = "Informe um CNPJ com 12 letras ou números e 2 dígitos no final.";

export const COMPANY_SIZE_OPTIONS: Array<{ value: CompanySize; label: string }> = [
  { value: "MEI", label: "MEI" },
  { value: "ME", label: "ME" },
  { value: "EPP", label: "EPP" },
  { value: "DEMAIS", label: "Demais" },
];

export function companySizeLabel(size: CompanySize | null | undefined): string {
  return COMPANY_SIZE_OPTIONS.find((option) => option.value === size)?.label ?? "";
}

export function normalizeCnpj(raw: string): string {
  return raw.replace(/[./\-\s]/g, "").toUpperCase();
}

export function isCnpjFormat(raw: string): boolean {
  return CNPJ_FORMAT.test(normalizeCnpj(raw));
}

/** `XX.XXX.XXX/XXXX-XX`; valor fora do formato volta como veio. */
export function formatCnpj(raw: string | null | undefined): string {
  if (!raw) return "";
  const cnpj = normalizeCnpj(raw);
  if (!CNPJ_FORMAT.test(cnpj)) return raw;
  return `${cnpj.slice(0, 2)}.${cnpj.slice(2, 5)}.${cnpj.slice(5, 8)}/${cnpj.slice(8, 12)}-${cnpj.slice(12)}`;
}

/** Registro anterior a PF/PJ chega sem `personType` e vale PF. */
export function personTypeOf(owner: Pick<Owner, "personType">): OwnerPersonType {
  return owner.personType ?? "PF";
}

export function ownerDisplayName(owner: Pick<Owner, "personType" | "companyName" | "completeName">): string {
  if (personTypeOf(owner) === "PJ" && owner.companyName) {
    return `${owner.companyName} (${owner.completeName})`;
  }
  return owner.completeName;
}

export function ownerDocument(owner: Pick<Owner, "personType" | "cnpj" | "cpf">): string {
  if (personTypeOf(owner) === "PJ" && owner.cnpj) return formatCnpj(owner.cnpj);
  return owner.cpf ?? "";
}

function searchable(value: string | null | undefined): string {
  return (value ?? "").replace(/[./\-\s]/g, "").toLowerCase();
}

export function ownerMatchesSearch(
  owner: Pick<Owner, "completeName" | "cpf" | "companyName" | "cnpj">,
  term: string,
): boolean {
  const query = searchable(term);
  if (!query) return true;
  return [owner.completeName, owner.cpf, owner.companyName, owner.cnpj].some((value) => searchable(value).includes(query));
}

export interface RepresentativeLabels {
  name: string;
  cpf: string;
  rg: string;
}

export function representativeLabels(personType: OwnerPersonType, companySize?: CompanySize | null): RepresentativeLabels {
  if (personType === "PF") return { name: "Nome Completo", cpf: "CPF", rg: "RG" };
  if (companySize === "MEI") return { name: "Titular", cpf: "CPF do Titular", rg: "RG do Titular" };
  return { name: "Representante Legal", cpf: "CPF do Representante", rg: "RG do Representante" };
}
