export const PUBLIC_VENUE_PRESENTATION_PATTERN = "/venue/:id/apresentacao";

function publicVenueKey(name: string) {
  return encodeURIComponent(name);
}

export function publicVenuePresentationPath(name: string) {
  return `/venue/${publicVenueKey(name)}/apresentacao`;
}

export function publicVenuePresentationShareUrl(name: string) {
  return `https://event-hub-dashboard.vercel.app${publicVenuePresentationPath(name)}`;
}

export function publicVenueBudgetFormShareUrl(name: string) {
  return `https://event-hub-dashboard.vercel.app/venue/${publicVenueKey(name)}/form`;
}

export function venueIdForPublicForm(
  param: string | undefined,
  venue: { id: string; name: string } | null | undefined,
) {
  if (!param || !venue) return null;
  if (venue.id !== param && venue.name !== param) return null;
  return venue.id;
}
