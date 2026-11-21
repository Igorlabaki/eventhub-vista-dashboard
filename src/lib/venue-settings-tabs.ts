import type { FieldErrors } from "react-hook-form";

export const SETTINGS_TABS = [
  { value: "geral", label: "GERAL" },
  { value: "endereco", label: "ENDEREÇO" },
  { value: "precos", label: "PREÇOS" },
  { value: "redes", label: "REDES" },
  { value: "apresentacao", label: "APRESENTAÇÃO" },
] as const;

export type SettingsTab = (typeof SETTINGS_TABS)[number]["value"];

const SETTINGS_FIELD_TAB: Record<string, SettingsTab> = {
  name: "geral",
  email: "geral",
  whatsappNumber: "geral",
  maxGuest: "geral",
  slogan: "geral",
  description: "geral",
  street: "endereco",
  streetNumber: "endereco",
  complement: "endereco",
  neighborhood: "endereco",
  city: "endereco",
  state: "endereco",
  cep: "endereco",
  pricingModel: "precos",
  pricePerPerson: "precos",
  pricePerDay: "precos",
  pricePerPersonDay: "precos",
  pricePerPersonHour: "precos",
  minimumPrice: "precos",
  hasOvernightStay: "precos",
  checkIn: "precos",
  checkOut: "precos",
  minimumNights: "precos",
  openingHour: "precos",
  closingHour: "precos",
  standardEventDuration: "precos",
  links: "redes",
  tourVideoUrl: "apresentacao",
  logoUrl: "apresentacao",
  logoFile: "apresentacao",
  faviconFile: "apresentacao",
  proposalPrimaryColor: "apresentacao",
  proposalSecondaryColor: "apresentacao",
  proposalTextColor: "apresentacao",
  owners: "apresentacao",
};

export function firstInvalidSettingsTab(errors: FieldErrors): SettingsTab | null {
  const invalidFields = Object.keys(errors);
  for (const tab of SETTINGS_TABS) {
    if (invalidFields.some((field) => SETTINGS_FIELD_TAB[field] === tab.value)) {
      return tab.value;
    }
  }
  return null;
}
