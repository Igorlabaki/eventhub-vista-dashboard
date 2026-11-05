import {
  PERSON_SPREADSHEET_MAX_BYTES,
  PERSON_SPREADSHEET_MAX_NAMES,
  type SpreadsheetFailure,
  type SpreadsheetPerson,
  type SpreadsheetRows,
  interpretRows,
} from "./person-spreadsheet";

const EXTENSIONS = new Set([".xlsx", ".xls", ".csv"]);
const ROW_WINDOW = PERSON_SPREADSHEET_MAX_NAMES + 2;

export type SpreadsheetSource = {
  name: string;
  size: number;
  arrayBuffer: () => Promise<ArrayBuffer>;
};

export function spreadsheetExtension(name: string): string {
  const dot = name.lastIndexOf(".");
  return dot >= 0 ? name.slice(dot).toLowerCase() : "";
}

function startsWith(bytes: Uint8Array, magic: number[]): boolean {
  if (bytes.length < magic.length) return false;
  return magic.every((byte, index) => bytes[index] === byte);
}

export function spreadsheetMagicOk(extension: string, bytes: Uint8Array): boolean {
  if (extension === ".xlsx") return startsWith(bytes, [0x50, 0x4b]);
  if (extension === ".xls") return startsWith(bytes, [0xd0, 0xcf, 0x11, 0xe0]);
  if (extension === ".csv") {
    if (startsWith(bytes, [0x50, 0x4b]) || startsWith(bytes, [0xd0, 0xcf, 0x11, 0xe0])) return false;
    const sample = bytes.subarray(0, 1024);
    for (const byte of sample) {
      if (byte === 0) return false;
    }
    return bytes.length > 0;
  }
  return false;
}

function decodeCsv(bytes: Uint8Array): string {
  const hasBom = bytes.length >= 3 && bytes[0] === 0xef && bytes[1] === 0xbb && bytes[2] === 0xbf;
  if (hasBom) return new TextDecoder("utf-8").decode(bytes.subarray(3));
  const utf8 = new TextDecoder("utf-8").decode(bytes);
  if (!utf8.includes("\uFFFD")) return utf8;
  return new TextDecoder("windows-1252").decode(bytes);
}

function csvDelimiter(text: string): "," | ";" | "\t" {
  const line = text.split(/\r?\n/, 1)[0] ?? "";
  const commas = line.split(",").length - 1;
  const semis = line.split(";").length - 1;
  const tabs = line.split("\t").length - 1;
  if (semis > commas && semis >= tabs) return ";";
  if (tabs > commas && tabs >= semis) return "\t";
  return ",";
}

function cellText(value: unknown): string {
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }
  return "";
}

async function rowsFromWorkbook(bytes: Uint8Array, extension: string): Promise<string[][] | SpreadsheetFailure> {
  const XLSX = await import("xlsx");
  const limits = {
    raw: false,
    cellFormula: false,
    cellHTML: false,
    cellNF: false,
    cellStyles: false,
    cellDates: false,
    bookVBA: false,
    bookDeps: false,
    bookFiles: false,
    sheets: 0,
    sheetRows: ROW_WINDOW,
  };
  const csv = extension === ".csv" ? decodeCsv(bytes) : "";
  const workbook =
    extension === ".csv"
      ? XLSX.read(csv, { ...limits, type: "string", FS: csvDelimiter(csv) })
      : XLSX.read(bytes, { ...limits, type: "array" });
  const sheetName = workbook.SheetNames[0];
  const sheet = sheetName ? workbook.Sheets[sheetName] : undefined;
  if (!sheet) return "empty";
  const table = XLSX.utils.sheet_to_json(sheet, {
    header: 1,
    raw: false,
    defval: "",
    blankrows: false,
  });
  if (table.length >= ROW_WINDOW) return "too-many";
  return table.map((row) => (Array.isArray(row) ? row.map(cellText) : []));
}

export async function readPersonSpreadsheet(source: SpreadsheetSource): Promise<SpreadsheetRows> {
  const extension = spreadsheetExtension(source.name);
  if (!EXTENSIONS.has(extension)) return { ok: false, reason: "type" };
  if (source.size > PERSON_SPREADSHEET_MAX_BYTES) return { ok: false, reason: "size" };
  if (source.size === 0) return { ok: false, reason: "empty" };

  let bytes: Uint8Array;
  try {
    bytes = new Uint8Array(await source.arrayBuffer());
  } catch {
    return { ok: false, reason: "unreadable" };
  }
  if (!spreadsheetMagicOk(extension, bytes)) return { ok: false, reason: "unreadable" };

  try {
    const rows = await rowsFromWorkbook(bytes, extension);
    if (typeof rows === "string") return { ok: false, reason: rows };
    return interpretRows(rows);
  } catch {
    return { ok: false, reason: "unreadable" };
  }
}

export type { SpreadsheetPerson };
