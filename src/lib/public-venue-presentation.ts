import { publicShareUrl } from "@/lib/public-venue-links";

export const PUBLIC_VENUE_PRESENTATION_PATTERN = "/espaco/:id/apresentacao";

function publicVenueKey(name: string) {
  return encodeURIComponent(name);
}

export function publicVenuePresentationPath(name: string) {
  return `/espaco/${publicVenueKey(name)}/apresentacao`;
}

export function publicVenuePresentationShareUrl(name: string, hostname: string | null = null) {
  return publicShareUrl(publicVenuePresentationPath(name), "/apresentacao", hostname);
}

export function publicVenueBudgetFormPath(name: string) {
  return `/espaco/${publicVenueKey(name)}/formulario`;
}

export function publicVenueBudgetFormShareUrl(name: string, hostname: string | null = null) {
  return publicShareUrl(publicVenueBudgetFormPath(name), "/formulario", hostname);
}

export function publicVenuePartnerShareUrl(name: string, hostname: string | null = null) {
  return publicShareUrl(`/espaco/${publicVenueKey(name)}/parceiro`, "/parceiro", hostname);
}

export function publicVenueCrewShareUrl(name: string, hostname: string | null = null) {
  return publicShareUrl(`/espaco/${publicVenueKey(name)}/colaborador`, "/colaborador", hostname);
}

export function venueIdForPublicForm(
  param: string | undefined,
  venue: { id: string; name: string } | null | undefined,
) {
  if (!param || !venue) return null;
  if (venue.id !== param && venue.name !== param) return null;
  return venue.id;
}
