import { describe, expect, it } from "vitest";
import {
  interpretRows,
  peopleToSave,
  remainingGuestSlots,
  spreadsheetNothingSavedMessage,
  spreadsheetSavedMessage,
} from "./person-spreadsheet";

describe("interpretRows", () => {
  it("le a coluna Nome e o e-mail opcional", () => {
    expect(
      interpretRows([
        ["Nome", "E-mail"],
        ["Maria Silva", "maria@email.com"],
        ["João Souza", ""],
        ["", ""],
      ])
    ).toEqual({
      ok: true,
      people: [
        { name: "Maria Silva", email: "maria@email.com" },
        { name: "João Souza" },
      ],
    });
  });

  it("sem cabecalho usa a primeira coluna como nome e a segunda como e-mail", () => {
    expect(interpretRows([["Maria Silva", "maria@email.com"], ["João Souza"]])).toEqual({
      ok: true,
      people: [
        { name: "Maria Silva", email: "maria@email.com" },
        { name: "João Souza" },
      ],
    });
  });

  it("entra com o nome uma vez quando a planilha repete a pessoa", () => {
    expect(interpretRows([["Nome"], ["Maria Silva"], ["maria silva"], ["José"], ["Jose"]])).toEqual({
      ok: true,
      people: [{ name: "Maria Silva" }, { name: "José" }],
    });
  });

  it("recusa planilha sem a coluna de nomes", () => {
    expect(interpretRows([["E-mail"], ["maria@email.com"]])).toEqual({
      ok: false,
      reason: "no-name-column",
    });
  });

  it("recusa planilha sem nenhum nome", () => {
    expect(interpretRows([["Nome"], [" "]])).toEqual({ ok: false, reason: "empty" });
  });

  it("recusa mais de 1000 nomes sem devolver uma parte", () => {
    const rows = [["Nome"], ...Array.from({ length: 1001 }, (_, index) => [`Pessoa ${index}`])];
    expect(interpretRows(rows)).toEqual({ ok: false, reason: "too-many" });
  });
});

describe("peopleToSave", () => {
  const people = [{ name: "Maria Silva" }, { name: "João Souza" }, { name: "Ana Lima" }];

  it("nao envia quem ja esta na lista e respeita as vagas de convidados", () => {
    expect(
      peopleToSave({
        people,
        existingNames: ["maria silva"],
        remainingSlots: 1,
      })
    ).toEqual({
      toSave: [{ name: "João Souza" }],
      duplicates: 1,
      overCap: 1,
    });
  });

  it("nao grava convidado quando a lista ja esta cheia", () => {
    expect(peopleToSave({ people, existingNames: [], remainingSlots: 0 })).toEqual({
      toSave: [],
      duplicates: 0,
      overCap: 3,
    });
  });

  it("colaboradores nao tem teto", () => {
    expect(peopleToSave({ people, existingNames: ["Ana Lima"], remainingSlots: null })).toEqual({
      toSave: [{ name: "Maria Silva" }, { name: "João Souza" }],
      duplicates: 1,
      overCap: 0,
    });
  });
});

describe("remainingGuestSlots", () => {
  it("desconta quem ja foi salvo", () => {
    expect(remainingGuestSlots(10, 8)).toBe(2);
    expect(remainingGuestSlots(10, 10)).toBe(0);
  });

  it("sem numero de convidados nao aplica teto", () => {
    expect(remainingGuestSlots(undefined, 4)).toBeNull();
  });
});

describe("mensagens", () => {
  it("avisa quem ficou de fora do limite", () => {
    expect(spreadsheetSavedMessage(2, 3, 1)).toBe(
      "2 pessoas entraram na lista. 3 ficaram de fora porque a lista de convidados chegou ao limite. Nomes repetidos foram ignorados."
    );
    expect(spreadsheetNothingSavedMessage({ duplicates: 0, overCap: 4 })).toBe(
      "A lista de convidados já está completa. Nada foi gravado."
    );
  });
});
