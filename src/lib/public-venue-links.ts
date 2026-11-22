export const PUBLIC_VENUE_LINKS_PATTERN = "/espaco/:id/links";
export const PUBLIC_VENUE_LINKS_ALIAS = "/venue/:id/links";
export const PUBLIC_VENUE_LINKS_HOST_PATH = "/links";
const DEFAULT_PUBLIC_HOST = "https://event-hub-dashboard.vercel.app";

export function shouldResolvePublicLinksHost(hostname: string) {
    const host = hostname.trim().toLowerCase().replace(/\.$/, "").replace(/:\d+$/, "");
    if (!host || host === "localhost" || host === "127.0.0.1" || host.endsWith(".localhost")) return false;
    if (host === "vercel.app" || host.endsWith(".vercel.app")) return false;
    return true;
}

export function publicShareUrl(defaultPath: string, shortPath: string, hostname?: string | null) {
    const host = hostname?.trim().toLowerCase().replace(/\.$/, "") ?? "";
    if (host && shouldResolvePublicLinksHost(host)) return `https://${host}${shortPath}`;
    return `${DEFAULT_PUBLIC_HOST}${defaultPath}`;
}

export function shareHostOf(domain: { hostname?: string | null; status?: string | null } | null | undefined) {
    if (!domain?.hostname) return null;
    if (domain.status !== "PENDING" && domain.status !== "ACTIVE") return null;
    return domain.hostname;
}

export function publicVenueLinksShareUrl(name: string, activeHost?: string | null) {
    return publicShareUrl(`/espaco/${encodeURIComponent(name)}/links`, "/links", activeHost);
}
