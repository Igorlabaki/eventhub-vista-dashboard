import { publicShareUrl } from "@/lib/public-venue-links";

export const PUBLIC_VENUE_RULES_PATTERN = "/espaco/:id/regras";
export const EMPTY_PUBLIC_VENUE_RULES = "Ainda não há regras deste espaço.";
export const PUBLIC_VENUE_RULES_FAILURE = "Não foi possível carregar as regras.";
export const PUBLIC_VENUE_RULES_LEAD =
  "Orientações importantes para segurança, conservação e bom uso do espaço durante o evento.";
export const PUBLIC_VENUE_RULES_NOTICE =
  "Estas regras se aplicam a organizadores, convidados e fornecedores.";

export type PublicVenueRuleCard = {
  id: string;
  title: string | null;
  text: string;
  position: number;
};

export function publicVenueRulesPath(name: string) {
  return `/espaco/${encodeURIComponent(name)}/regras`;
}

export function publicVenueRulesShareUrl(venueId: string, hostname: string | null = null) {
  return publicShareUrl(publicVenueRulesPath(venueId), "/regras", hostname);
}

export function publicRuleCards(rules: PublicVenueRuleCard[]) {
  return rules.map((rule) => ({
    id: rule.id,
    title: rule.title?.trim() ? rule.title : null,
    text: rule.text,
  }));
}
