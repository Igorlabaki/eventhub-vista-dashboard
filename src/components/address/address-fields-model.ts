import { cepDigits, normalizeUf, type CepLookupResult } from "@/lib/cep-lookup";

export const CEP_LOOKUP_ERROR =
  "Não encontramos esse CEP. Confira os números ou preencha a cidade e o estado.";

export const ADDRESS_LABELS = ["CEP", "Logradouro", "Número", "Complemento", "Bairro", "Cidade", "Estado"] as const;

export const CITY_STATE_LABELS = ["CEP", "Cidade", "Estado"] as const;

export const UF_SIGLAS = [
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS", "MG",
  "PA", "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO",
] as const;

export type AddressValues = {
  cep: string;
  street: string;
  streetNumber: string;
  complement: string;
  neighborhood: string;
  city: string;
  state: string;
};

export type AddressWidgets = {
  city: "input" | "select";
  state: "input" | "select";
  cityOptions: string[];
};

export const INPUT_WIDGETS: AddressWidgets = { city: "input", state: "input", cityOptions: [] };

export function formatCep(value: string): string {
  const digits = cepDigits(value);
  if (digits.length <= 5) return digits;
  return `${digits.slice(0, 5)}-${digits.slice(5)}`;
}

export function requestsLookup(previousDigits: string, raw: string): string | null {
  const next = cepDigits(raw);
  if (next.length !== 8 || next === previousDigits) return null;
  return next;
}

function matchCity(name: string, cities: string[]): string | null {
  const key = name.trim().toLocaleLowerCase("pt-BR");
  return cities.find((city) => city.toLocaleLowerCase("pt-BR") === key) ?? null;
}

export function applyAddressLookup(
  previous: AddressValues,
  result: CepLookupResult,
  cities: string[] | null,
): { values: AddressValues; widgets: AddressWidgets; error: string | null } {
  if (result.status === "aborted") {
    return { values: previous, widgets: INPUT_WIDGETS, error: null };
  }

  if (result.status === "failed") {
    const uf = normalizeUf(previous.state);
    const hasSigla = /^[A-Z]{2}$/.test(uf.trim());
    const citySelect = hasSigla && cities !== null;
    return {
      values: previous,
      widgets: {
        state: "select",
        city: citySelect ? "select" : "input",
        cityOptions: citySelect ? cities : [],
      },
      error: CEP_LOOKUP_ERROR,
    };
  }

  const next: AddressValues = {
    ...previous,
    street: result.address.street,
    neighborhood: result.address.neighborhood,
    city: result.address.city,
    state: normalizeUf(result.address.state),
  };

  if (result.address.street || result.address.neighborhood) {
    return { values: next, widgets: INPUT_WIDGETS, error: null };
  }

  const matched = cities ? matchCity(result.address.city, cities) : null;
  if (matched && cities) {
    return {
      values: { ...next, city: matched },
      widgets: { city: "select", state: "input", cityOptions: cities },
      error: null,
    };
  }

  return { values: next, widgets: INPUT_WIDGETS, error: null };
}

export function applyUfChoice(
  previous: AddressValues,
  uf: string,
  cities: string[] | null,
  error: string | null,
): { values: AddressValues; widgets: AddressWidgets; error: string | null } {
  const state = normalizeUf(uf);
  return {
    values: { ...previous, state },
    widgets: {
      state: "select",
      city: cities ? "select" : "input",
      cityOptions: cities ?? [],
    },
    error,
  };
}
