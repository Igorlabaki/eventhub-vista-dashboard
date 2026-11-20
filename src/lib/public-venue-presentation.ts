export const PUBLIC_VENUE_PRESENTATION_PATTERN = "/espaco/:id/apresentacao";

function publicVenueKey(name: string) {
  return encodeURIComponent(name);
}

export function publicVenuePresentationPath(name: string) {
  return `/espaco/${publicVenueKey(name)}/apresentacao`;
}

export function publicVenuePresentationShareUrl(name: string) {
  return `https://event-hub-dashboard.vercel.app${publicVenuePresentationPath(name)}`;
}

export function publicVenueBudgetFormPath(name: string) {
  return `/espaco/${publicVenueKey(name)}/formulario`;
}

export function publicVenueBudgetFormShareUrl(name: string) {
  return `https://event-hub-dashboard.vercel.app${publicVenueBudgetFormPath(name)}`;
}

export function publicVenuePartnerShareUrl(name: string) {
  return `https://event-hub-dashboard.vercel.app/espaco/${publicVenueKey(name)}/parceiro`;
}

export function publicVenueCrewShareUrl(name: string) {
  return `https://event-hub-dashboard.vercel.app/espaco/${publicVenueKey(name)}/colaborador`;
}

export function venueIdForPublicForm(
  param: string | undefined,
  venue: { id: string; name: string } | null | undefined,
) {
  if (!param || !venue) return null;
  if (venue.id !== param && venue.name !== param) return null;
  return venue.id;
}
