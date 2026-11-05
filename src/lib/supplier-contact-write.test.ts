import { describe, expect, it } from "vitest";
import { ContactType } from "@/types/contact";
import { supplierContactWrite } from "./supplier-contact-write";

const supplier = {
  name: "Casa Doce",
  type: ContactType.SUPPLIER,
  category: "OUTROS" as const,
  description: "Bolos",
};

describe("supplierContactWrite", () => {
  it("fornecedor com arquivo envia o file e ignora a remocao", () => {
    const file = new File(["img"], "logo.png", { type: "image/png" });
    const result = supplierContactWrite(supplier, file, true);
    expect(result.file).toBe(file);
    expect(result.removeLogo).toBe(false);
    expect(result.data.description).toBe("Bolos");
  });

  it("fornecedor sem arquivo novo pode remover a logo", () => {
    const result = supplierContactWrite(supplier, null, true);
    expect(result.file).toBeUndefined();
    expect(result.removeLogo).toBe(true);
  });

  it("equipe nao envia descricao nem logo", () => {
    const file = new File(["img"], "logo.png", { type: "image/png" });
    const result = supplierContactWrite(
      { ...supplier, type: ContactType.TEAM_MEMBER, description: "nao" },
      file,
      true,
    );
    expect(result.data.description).toBeUndefined();
    expect(result.data.category).toBeUndefined();
    expect(result.file).toBeUndefined();
    expect(result.removeLogo).toBe(false);
  });
});
