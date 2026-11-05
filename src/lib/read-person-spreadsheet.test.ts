import { describe, expect, it } from "vitest";
import * as XLSX from "xlsx";
import { PERSON_SPREADSHEET_MAX_BYTES } from "./person-spreadsheet";
import { readPersonSpreadsheet, type SpreadsheetSource } from "./read-person-spreadsheet";

function sourceFrom(name: string, bytes: Uint8Array, size = bytes.byteLength): SpreadsheetSource {
  return {
    name,
    size,
    arrayBuffer: async () => bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength),
  };
}

function workbookSource(rows: string[][], bookType: "xlsx" | "xls" | "csv", name: string, extraSheet?: string[][]) {
  const book = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(book, XLSX.utils.aoa_to_sheet(rows), "Lista");
  if (extraSheet) XLSX.utils.book_append_sheet(book, XLSX.utils.aoa_to_sheet(extraSheet), "Outra");
  const out = XLSX.write(book, { type: "array", bookType }) as ArrayBuffer;
  return sourceFrom(name, new Uint8Array(out));
}

describe("readPersonSpreadsheet", () => {
  it("le xlsx, xls e csv e ignora a segunda aba", async () => {
    const rows = [
      ["Nome", "E-mail"],
      ["Maria Silva", "maria@email.com"],
      ["João Souza", ""],
    ];
    const expected = {
      ok: true,
      people: [
        { name: "Maria Silva", email: "maria@email.com" },
        { name: "João Souza" },
      ],
    };
    await expect(readPersonSpreadsheet(workbookSource(rows, "xlsx", "lista.xlsx", [["Nome"], ["Fora"]]))).resolves.toEqual(expected);
    await expect(readPersonSpreadsheet(workbookSource(rows, "xls", "lista.xls"))).resolves.toEqual(expected);
    await expect(readPersonSpreadsheet(workbookSource(rows, "csv", "lista.csv"))).resolves.toEqual(expected);
  });

  it("le csv separado por ponto e virgula e nome em windows-1252", async () => {
    const semicolon = sourceFrom("lista.csv", new TextEncoder().encode("Nome;E-mail\nMaria Silva;maria@email.com\n"));
    await expect(readPersonSpreadsheet(semicolon)).resolves.toEqual({
      ok: true,
      people: [{ name: "Maria Silva", email: "maria@email.com" }],
    });

    const latin = sourceFrom("lista.csv", new Uint8Array([0x4e, 0x6f, 0x6d, 0x65, 0x0a, 0x4a, 0x6f, 0x73, 0xe9, 0x0a]));
    await expect(readPersonSpreadsheet(latin)).resolves.toEqual({
      ok: true,
      people: [{ name: "José" }],
    });
  });

  it("nao le arquivo de outro tipo, grande demais ou que nao e planilha", async () => {
    await expect(readPersonSpreadsheet(sourceFrom("lista.pdf", new TextEncoder().encode("Maria")))).resolves.toEqual({
      ok: false,
      reason: "type",
    });
    await expect(
      readPersonSpreadsheet(sourceFrom("lista.csv", new Uint8Array([0x61]), PERSON_SPREADSHEET_MAX_BYTES + 1))
    ).resolves.toEqual({ ok: false, reason: "size" });
    await expect(readPersonSpreadsheet(sourceFrom("lista.xlsx", new TextEncoder().encode("Maria")))).resolves.toEqual({
      ok: false,
      reason: "unreadable",
    });
    await expect(readPersonSpreadsheet(sourceFrom("lista.csv", new Uint8Array()))).resolves.toEqual({
      ok: false,
      reason: "empty",
    });
  });
});
