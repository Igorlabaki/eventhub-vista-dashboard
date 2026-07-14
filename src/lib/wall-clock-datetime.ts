/**
 * Utilitários wall-clock para EventDateTime (proposta, dateEvent, cronograma).
 * Extrai e formata componentes literais da ISO sem conversão de fuso.
 *
 * Ex.: "2026-07-05T13:00:00.000Z" → hora "13:00", data "05/07/2026"
 */

function toIsoString(value: string | Date): string {
  return typeof value === "string" ? value : value.toISOString();
}

/**
 * Extrai hora literal "HH:mm" da ISO wall-clock.
 * @example wallClockTime("2026-07-05T13:00:00.000Z") // "13:00"
 */
export function wallClockTime(value: string | Date): string {
  const iso = toIsoString(value);
  const t = iso.includes("T") ? iso.split("T")[1] : "";
  return t.slice(0, 5);
}

/**
 * Extrai data "YYYY-MM-DD" para input type="date".
 * @example wallClockDateIso("2026-07-05T13:00:00.000Z") // "2026-07-05"
 */
export function wallClockDateIso(value: string | Date): string {
  const iso = toIsoString(value);
  return iso.split("T")[0];
}

/**
 * Formata data "dd/MM/yyyy" a partir dos componentes wall-clock.
 * @example wallClockDateBr("2026-07-05T13:00:00.000Z") // "05/07/2026"
 */
export function wallClockDateBr(value: string | Date): string {
  const iso = toIsoString(value);
  const [y, m, d] = iso.split("T")[0].split("-");
  return `${d}/${m}/${y}`;
}

/**
 * Formata "dd/MM/yyyy às HH:mm".
 * @example wallClockDateTimeBr("2026-07-05T13:00:00.000Z") // "05/07/2026 às 13:00"
 */
export function wallClockDateTimeBr(value: string | Date): string {
  return `${wallClockDateBr(value)} às ${wallClockTime(value)}`;
}

/**
 * Cria Date cujo getHours()/getDate() refletem componentes wall-clock.
 * Uso exclusivo: react-big-calendar e libs que exigem Date local.
 * @example wallClockToCalendarDate("2026-07-05T13:00:00.000Z").getHours() // 13
 */
export function wallClockToCalendarDate(value: string | Date): Date {
  const iso = toIsoString(value);
  const [datePart, timePart = "00:00:00.000Z"] = iso.split("T");
  const [y, m, d] = datePart.split("-").map(Number);
  const [hh, mm] = timePart.slice(0, 5).split(":").map(Number);
  return new Date(y, m - 1, d, hh, mm, 0, 0);
}

const DATE_ISO_REGEX = /^\d{4}-\d{2}-\d{2}$/;
const TIME_REGEX = /^\d{2}:\d{2}$/;

/**
 * Valida par date (YYYY-MM-DD) + time (HH:mm) antes de enviar à API.
 */
export function assertWallClockFormFields(date: string, time: string): void {
  if (!DATE_ISO_REGEX.test(date)) {
    throw new Error(`Data inválida (esperado YYYY-MM-DD): ${date}`);
  }
  if (!TIME_REGEX.test(time)) {
    throw new Error(`Hora inválida (esperado HH:mm): ${time}`);
  }
}
