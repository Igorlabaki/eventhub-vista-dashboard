export const PERSON_SPREADSHEET_MAX_BYTES = 1_048_576;
export const PERSON_SPREADSHEET_MAX_NAMES = 1000;

const PERSON_TEXT_MAX_LENGTH = 191;
const NAME_HEADERS = new Set([
  "nome",
  "name",
  "convidado",
  "convidados",
  "colaborador",
  "colaboradores",
  "pessoa",
  "pessoas",
]);
const EMAIL_HEADERS = new Set(["email", "mail"]);

export type SpreadsheetPerson = {
  name: string;
  email?: string;
};

export type SpreadsheetFailure =
  | "type"
  | "size"
  | "empty"
  | "no-name-column"
  | "unreadable"
  | "too-many";

export type SpreadsheetRows =
  | { ok: true; people: SpreadsheetPerson[] }
  | { ok: false; reason: SpreadsheetFailure };

export function normalizePersonName(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

function headerToken(value: string): string {
  return normalizePersonName(value).replace(/[^a-z0-9]/g, "");
}

function collapseCell(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

export function interpretRows(rows: string[][]): SpreadsheetRows {
  const filled = rows
    .map((row) => row.map((cell) => collapseCell(cell ?? "")))
    .filter((row) => row.some((cell) => cell !== ""));

  if (filled.length === 0) return { ok: false, reason: "empty" };

  const tokens = filled[0].map(headerToken);
  const hasNameHeader = tokens.some((token) => NAME_HEADERS.has(token));
  const hasEmailHeader = tokens.some((token) => EMAIL_HEADERS.has(token));
  if ((hasNameHeader || hasEmailHeader) && !hasNameHeader) {
    return { ok: false, reason: "no-name-column" };
  }

  const header = hasNameHeader;
  const nameIndex = header ? tokens.findIndex((token) => NAME_HEADERS.has(token)) : 0;
  const emailIndex = header ? tokens.findIndex((token) => EMAIL_HEADERS.has(token)) : 1;
  const data = header ? filled.slice(1) : filled;
  const seen = new Set<string>();
  const people: SpreadsheetPerson[] = [];
  let named = 0;

  for (const row of data) {
    const name = collapseCell(row[nameIndex] ?? "");
    if (!name) continue;
    named += 1;
    if (named > PERSON_SPREADSHEET_MAX_NAMES) return { ok: false, reason: "too-many" };
    if (name.length > PERSON_TEXT_MAX_LENGTH) continue;
    const key = normalizePersonName(name);
    if (!key || seen.has(key)) continue;
    seen.add(key);
    const emailRaw = emailIndex >= 0 ? collapseCell(row[emailIndex] ?? "") : "";
    const email = emailRaw && emailRaw.length <= PERSON_TEXT_MAX_LENGTH ? emailRaw : undefined;
    people.push(email ? { name, email } : { name });
  }

  if (people.length === 0) return { ok: false, reason: "empty" };
  return { ok: true, people };
}

export function peopleToSave(input: {
  people: SpreadsheetPerson[];
  existingNames: string[];
  remainingSlots: number | null;
}): { toSave: SpreadsheetPerson[]; duplicates: number; overCap: number } {
  const existing = new Set(input.existingNames.map(normalizePersonName).filter(Boolean));
  const fresh = input.people.filter((person) => !existing.has(normalizePersonName(person.name)));
  const duplicates = input.people.length - fresh.length;
  if (input.remainingSlots === null) {
    return { toSave: fresh, duplicates, overCap: 0 };
  }
  const slots = Math.max(0, Math.floor(input.remainingSlots));
  return {
    toSave: fresh.slice(0, slots),
    duplicates,
    overCap: Math.max(0, fresh.length - slots),
  };
}

export function remainingGuestSlots(
  guestNumber: number | null | undefined,
  savedCount: number
): number | null {
  if (typeof guestNumber !== "number" || !Number.isFinite(guestNumber)) return null;
  return Math.max(0, Math.floor(guestNumber) - savedCount);
}

export function spreadsheetFailureMessage(reason: SpreadsheetFailure): string {
  switch (reason) {
    case "type":
      return "Envie uma planilha .xlsx, .xls ou .csv. Nada foi gravado.";
    case "size":
      return "Essa planilha é grande demais. Nada foi gravado.";
    case "too-many":
      return "Essa planilha passa de 1000 nomes. Nada foi gravado.";
    case "no-name-column":
      return "Não encontramos a coluna de nomes. Nada foi gravado.";
    case "empty":
      return "Não encontramos nomes nessa planilha. Nada foi gravado.";
    case "unreadable":
      return "Não foi possível ler essa planilha. Nada foi gravado.";
  }
}

export function spreadsheetNothingSavedMessage(input: { duplicates: number; overCap: number }): string {
  if (input.overCap > 0) return "A lista de convidados já está completa. Nada foi gravado.";
  return "Esses nomes já estão na lista. Nada novo foi gravado.";
}

export function spreadsheetSavedMessage(saved: number, overCap: number, duplicates: number): string {
  const lead = saved === 1 ? "1 pessoa entrou na lista." : `${saved} pessoas entraram na lista.`;
  const cap =
    overCap === 0
      ? ""
      : overCap === 1
        ? " 1 ficou de fora porque a lista de convidados chegou ao limite."
        : ` ${overCap} ficaram de fora porque a lista de convidados chegou ao limite.`;
  const repeated = duplicates > 0 ? " Nomes repetidos foram ignorados." : "";
  return `${lead}${cap}${repeated}`;
}
