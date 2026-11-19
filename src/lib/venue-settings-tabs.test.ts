import { describe, expect, it } from "vitest";
import { firstInvalidSettingsTab } from "./venue-settings-tabs";

describe("aba do primeiro campo invalido nas configuracoes", () => {
  it("abre endereco quando a rua falha e o nome esta valido", () => {
    expect(firstInvalidSettingsTab({ street: { type: "min", message: "Rua é obrigatória" } })).toBe(
      "endereco"
    );
  });

  it("prefere a primeira aba na ordem, mesmo com erro tambem em apresentacao", () => {
    expect(
      firstInvalidSettingsTab({
        owners: { type: "min", message: "Pelo menos um proprietário deve ser selecionado" },
        email: { type: "email", message: "Email inválido" },
      })
    ).toBe("geral");
  });

  it("abre apresentacao quando so o proprietario falta", () => {
    expect(
      firstInvalidSettingsTab({
        owners: { type: "min", message: "Pelo menos um proprietário deve ser selecionado" },
      })
    ).toBe("apresentacao");
  });

  it("nao troca de aba quando nao ha erro", () => {
    expect(firstInvalidSettingsTab({})).toBeNull();
  });
});
