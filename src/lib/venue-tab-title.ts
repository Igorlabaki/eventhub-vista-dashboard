export const EVENTHUB_TAB_TITLE = "EventHub - Gestão de Casas de Festas e Eventos";

export function venueTabTitle(name: string, description?: string | null): string {
  const text = description?.replace(/\s+/g, " ").trim();
  return text ? `${name} — ${text}` : name;
}
