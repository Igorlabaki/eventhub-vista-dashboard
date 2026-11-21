export const PUBLIC_VENUE_LINKS_PATTERN = "/espaco/:id/links";
export const PUBLIC_VENUE_LINKS_ALIAS = "/venue/:id/links";

export function publicVenueLinksShareUrl(name: string) {
    return `https://event-hub-dashboard.vercel.app/espaco/${encodeURIComponent(name)}/links`;
}
