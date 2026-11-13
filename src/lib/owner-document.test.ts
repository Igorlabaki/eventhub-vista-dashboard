import { describe, expect, it } from "vitest";
import {
  companySizeLabel,
  formatCnpj,
  isCnpjFormat,
  normalizeCnpj,
  ownerDisplayName,
  ownerDocument,
  ownerMatchesSearch,
  personTypeOf,
  representativeLabels,
} from "./owner-document";

const pj = {
  personType: "PJ" as const,
  completeName: "Maria Souza",
  cpf: "123.456.789-00",
  companyName: "Casa Azul Eventos",
  cnpj: "12ABC34501DE35",
  companySize: "MEI" as const,
};

const legacyPf = { completeName: "João Silva", cpf: "987.654.321-00" };

describe("CNPJ no painel", () => {
  it("formata alfanumerico e numerico", () => {
    expect(formatCnpj("12ABC34501DE35")).toBe("12.ABC.345/01DE-35");
    expect(formatCnpj("12345678000195")).toBe("12.345.678/0001-95");
    expect(formatCnpj("12.abc.345/01de-35")).toBe("12.ABC.345/01DE-35");
    expect(formatCnpj(null)).toBe("");
  });

  it("normaliza e valida como o backend", () => {
    expect(normalizeCnpj("12.abc.345/01de-35")).toBe("12ABC34501DE35");
    expect(isCnpjFormat("12.ABC.345/01DE-35")).toBe(true);
    expect(isCnpjFormat("12.ABC.345/01DE-3A")).toBe(false);
    expect(isCnpjFormat("12.ABC.345/01DE-3")).toBe(false);
  });
});

describe("nome exibido e documento", () => {
  it("PJ mostra razao social com o representante e o CNPJ formatado", () => {
    expect(ownerDisplayName(pj)).toBe("Casa Azul Eventos (Maria Souza)");
    expect(ownerDocument(pj)).toBe("12.ABC.345/01DE-35");
  });

  it("PF e registro sem personType mostram o nome e o CPF", () => {
    expect(personTypeOf(legacyPf)).toBe("PF");
    expect(ownerDisplayName(legacyPf)).toBe("João Silva");
    expect(ownerDocument(legacyPf)).toBe("987.654.321-00");
    expect(ownerDisplayName({ ...legacyPf, personType: "PF" })).toBe("João Silva");
  });
});

describe("busca de proprietario", () => {
  it("acha por razao social, CNPJ com ou sem pontuacao e CPF sem pontos", () => {
    expect(ownerMatchesSearch(pj, "casa azul")).toBe(true);
    expect(ownerMatchesSearch(pj, "12abc")).toBe(true);
    expect(ownerMatchesSearch(pj, "12.ABC")).toBe(true);
    expect(ownerMatchesSearch(pj, "12345678900")).toBe(true);
    expect(ownerMatchesSearch(pj, "maria")).toBe(true);
    expect(ownerMatchesSearch(pj, "outra")).toBe(false);
  });

  it("registro legado sem campos de empresa nao quebra", () => {
    expect(ownerMatchesSearch(legacyPf, "joão")).toBe(true);
    expect(ownerMatchesSearch(legacyPf, "98765")).toBe(true);
    expect(ownerMatchesSearch(legacyPf, "12abc")).toBe(false);
  });
});

describe("rotulos do representante", () => {
  it("PF, PJ e PJ MEI", () => {
    expect(representativeLabels("PF")).toEqual({ name: "Nome Completo", cpf: "CPF", rg: "RG" });
    expect(representativeLabels("PJ", "ME")).toEqual({ name: "Representante Legal", cpf: "CPF do Representante", rg: "RG do Representante" });
    expect(representativeLabels("PJ", null)).toEqual({ name: "Representante Legal", cpf: "CPF do Representante", rg: "RG do Representante" });
    expect(representativeLabels("PJ", "MEI")).toEqual({ name: "Titular", cpf: "CPF do Titular", rg: "RG do Titular" });
  });

  it("rotulo do porte", () => {
    expect(companySizeLabel("DEMAIS")).toBe("Demais");
    expect(companySizeLabel("MEI")).toBe("MEI");
    expect(companySizeLabel(null)).toBe("");
  });
});
