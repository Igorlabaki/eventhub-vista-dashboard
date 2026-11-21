export const EVENTHUB_TAB_ICON = "/favicon.ico";

export function venueTabIconHref(faviconUrl?: string | null): string {
  const url = faviconUrl?.trim();
  return url ? url : EVENTHUB_TAB_ICON;
}

export function applyVenueTabIcon(faviconUrl?: string | null, doc: Document = document): () => void {
  let link = doc.head.querySelector<HTMLLinkElement>('link[rel="icon"]');
  if (!link) {
    link = doc.createElement("link");
    link.rel = "icon";
    doc.head.appendChild(link);
  }
  link.href = venueTabIconHref(faviconUrl);
  return () => {
    link.href = EVENTHUB_TAB_ICON;
  };
}
