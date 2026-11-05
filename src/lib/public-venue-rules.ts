export const PUBLIC_VENUE_RULES_PATTERN = "/venue/:id/rules/view";
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

export function publicVenueRulesPath(venueId: string) {
  return `/venue/${venueId}/rules/view`;
}

export function publicVenueRulesShareUrl(venueId: string) {
  return `https://event-hub-dashboard.vercel.app${publicVenueRulesPath(venueId)}`;
}

export function publicRuleCards(rules: PublicVenueRuleCard[]) {
  return rules.map((rule) => ({
    id: rule.id,
    title: rule.title?.trim() ? rule.title : null,
    text: rule.text,
  }));
}
