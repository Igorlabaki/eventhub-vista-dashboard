export type VenueIconLink = {
    kind: string;
    label: string;
    href: string;
};

const NETWORK_KINDS = new Set(["WHATSAPP", "INSTAGRAM", "FACEBOOK", "TIKTOK", "SITE"]);

export function venueSocialLinks(links: VenueIconLink[] | null | undefined, kinds: ReadonlySet<string> = NETWORK_KINDS) {
    return (links ?? []).filter((link) => kinds.has(link.kind) && Boolean(link.href));
}

export function venueSocialIcons<Icon>(
    links: VenueIconLink[] | null | undefined,
    icons: Partial<Record<string, Icon>>,
    kinds: ReadonlySet<string> = NETWORK_KINDS,
) {
    return venueSocialLinks(links, kinds).flatMap((link) => {
        const icon = icons[link.kind];
        if (!icon) return [];
        return [{ kind: link.kind, label: link.label, href: link.href, icon }];
    });
}
