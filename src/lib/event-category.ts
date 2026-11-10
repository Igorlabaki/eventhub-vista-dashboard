import { PROPOSAL_TYPE_OPTIONS } from "@/components/proposal/forms/constants";
import { EventCategory, ProposalType } from "@/types/proposal";

export const EVENT_CATEGORY_MESSAGE = "Selecione a categoria do evento";

export const EVENT_CATEGORY_OPTIONS: { value: EventCategory; label: string }[] = [
  { value: EventCategory.CORPORATE, label: "Empresarial / confraternização" },
  { value: EventCategory.BIRTHDAY, label: "Aniversário" },
  { value: EventCategory.BACHELOR_PARTY, label: "Despedida de solteiro" },
  { value: EventCategory.WEDDING, label: "Casamento" },
  { value: EventCategory.COFFEE_BREAK, label: "Coffee break" },
  { value: EventCategory.OTHER, label: "Outro" },
];

export function eventCategoryForPayload(
  type: ProposalType,
  category: EventCategory | null | undefined,
): EventCategory | null {
  return type === ProposalType.EVENT ? category ?? null : null;
}

export function proposalTypeWithCategoryLabel(
  type: string | null | undefined,
  category: string | null | undefined,
): string {
  if (!type) return "-";
  const typeLabel = PROPOSAL_TYPE_OPTIONS.find((option) => option.value === type)?.label ?? type;
  if (type !== ProposalType.EVENT || !category) return typeLabel;
  const categoryLabel = EVENT_CATEGORY_OPTIONS.find((option) => option.value === category)?.label;
  return categoryLabel ? `${typeLabel} · ${categoryLabel}` : typeLabel;
}
