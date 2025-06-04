export function parseCurrencyStringToNumber(value: string): number {
  if (!value) return 0;
  // Remove tudo que não for número, vírgula ou ponto
  let sanitized = value.replace(/[^0-9,.]/g, "");
  // Troca vírgula por ponto (para decimal)
  sanitized = sanitized.replace(/,/g, ".");
  // Remove pontos extras (milhar)
  const parts = sanitized.split(".");
  if (parts.length > 2) {
    sanitized = parts[0] + "." + parts.slice(1).join("");
  }
  return Number(sanitized);
} 