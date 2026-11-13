import { describe, expect, it } from "vitest";
import type { Owner } from "@/types/owner";
import { OWNER_TEMPLATE_FIELDS, resolveOwnerTemplateValue } from "./owner-template-values";

const address = {
  street: "Rua A",
  streetNumber: "10",
  neighborhood: "Centro",
  city: "São Paulo",
  state: "SP",
  cep: "01000-000",
  pix: "chave",
};

const legacyPf = {
  ...address,
  completeName: "João Silva",
  cpf: "987.654.321-00",
  rg: null,
  complement: null,
} as unknown as Owner;

const pjWithoutSize = {
  ...address,
  personType: "PJ",
  completeName: "Maria Souza",
  cpf: "123.456.789-00",
  companyName: "Casa Azul Eventos",
  cnpj: "12345678000195",
  companySize: null,
} as unknown as Owner;

const pjMei = { ...pjWithoutSize, cnpj: "12ABC34501DE35", companySize: "MEI" } as Owner;

function render(owner: Owner, field: string) {
  return resolveOwnerTemplateValue(owner, field);
}

describe("variaveis do proprietario no contrato", () => {
  it("PF legado: campos nulos e de empresa saem em branco, sem null nem marcador", () => {
    for (const field of ["rg", "complement", "companyName", "cnpj", "companySize"]) {
      expect(render(legacyPf, field)).toBe("");
    }
    expect(render(legacyPf, "completeName")).toBe("João Silva");
    expect(render(legacyPf, "cpf")).toBe("987.654.321-00");
  });

  it("PJ sem porte: porte em branco e CNPJ formatado", () => {
    expect(render(pjWithoutSize, "companySize")).toBe("");
    expect(render(pjWithoutSize, "cnpj")).toBe("12.345.678/0001-95");
    expect(render(pjWithoutSize, "companyName")).toBe("Casa Azul Eventos");
  });

  it("PJ MEI: porte MEI e nome e CPF do titular", () => {
    expect(render(pjMei, "companySize")).toBe("MEI");
    expect(render(pjMei, "cnpj")).toBe("12.ABC.345/01DE-35");
    expect(render(pjMei, "completeName")).toBe("Maria Souza");
    expect(render(pjMei, "cpf")).toBe("123.456.789-00");
  });

  it("porte DEMAIS sai Demais", () => {
    expect(render({ ...pjMei, companySize: "DEMAIS" }, "companySize")).toBe("Demais");
  });

  it("campo desconhecido devolve undefined para manter o marcador", () => {
    expect(render(pjMei, "inexistente")).toBeUndefined();
    expect(resolveOwnerTemplateValue(pjMei, undefined)).toBeUndefined();
  });

  it("sem proprietario os campos conhecidos saem em branco", () => {
    expect(resolveOwnerTemplateValue(null, "cpf")).toBe("");
  });

  it("cobre todos os campos owner.* do editor de contrato", async () => {
    const { fieldGroups } = await import("@/types/contract");
    const ownerIds = fieldGroups
      .flatMap((group) => group.fields)
      .filter((field) => field.id.startsWith("owner."))
      .map((field) => field.id.slice("owner.".length));
    expect([...ownerIds].sort()).toEqual([...OWNER_TEMPLATE_FIELDS].sort());
  });
});
