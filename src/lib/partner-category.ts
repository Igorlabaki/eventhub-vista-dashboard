export const PARTNER_CATEGORIES = [
  "BUFFET",
  "CHURRASCO",
  "BAR",
  "DJ",
  "MUSICA_AO_VIVO",
  "FOTOGRAFIA",
  "FILMAGEM",
  "DECORACAO",
  "CENOGRAFIA",
  "BOLOS_DOCES",
  "RECREACAO",
  "ENTRETENIMENTO",
  "CERIMONIAL",
  "AUDIOVISUAL",
  "MOBILIARIO",
  "BRINDES",
  "OUTROS",
] as const;

export type PartnerCategory = (typeof PARTNER_CATEGORIES)[number];

export const PARTNER_CATEGORY_LABELS: Record<PartnerCategory, string> = {
  BUFFET: "Buffet",
  CHURRASCO: "Churrasco",
  BAR: "Bar",
  DJ: "DJ",
  MUSICA_AO_VIVO: "Musica ao vivo",
  FOTOGRAFIA: "Fotografia",
  FILMAGEM: "Filmagem",
  DECORACAO: "Decoracao",
  CENOGRAFIA: "Cenografia",
  BOLOS_DOCES: "Bolos e doces",
  RECREACAO: "Recreacao",
  ENTRETENIMENTO: "Entretenimento",
  CERIMONIAL: "Cerimonial",
  AUDIOVISUAL: "Audiovisual",
  MOBILIARIO: "Mobiliario",
  BRINDES: "Brindes",
  OUTROS: "Outros",
};

export function isPartnerCategory(value: string | null | undefined): value is PartnerCategory {
  return !!value && value in PARTNER_CATEGORY_LABELS;
}

export function partnerCategoryLabel(category: string | null | undefined): string {
  return isPartnerCategory(category) ? PARTNER_CATEGORY_LABELS[category] : PARTNER_CATEGORY_LABELS.OUTROS;
}

export function groupIndicationsByCategory<T extends { category?: string | null }>(items: T[]) {
  const buckets = new Map<PartnerCategory, T[]>();
  for (const item of items) {
    const key = isPartnerCategory(item.category) ? item.category : "OUTROS";
    const current = buckets.get(key) ?? [];
    current.push(item);
    buckets.set(key, current);
  }
  return PARTNER_CATEGORIES.flatMap((category) => {
    const groupItems = buckets.get(category);
    if (!groupItems?.length) return [];
    return [{ category, label: PARTNER_CATEGORY_LABELS[category], items: groupItems }];
  });
}
