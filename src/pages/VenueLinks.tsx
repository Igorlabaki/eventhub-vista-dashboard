import { useEffect, useRef, useState, type CSSProperties } from "react";
import { useParams } from "react-router-dom";
import { ArrowUpRight, Calendar, ClipboardList, GripVertical, Link2, Mail, MapPin, Play, Presentation, ScrollText, Store, Trash2, UtensilsCrossed } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import type { LucideIcon } from "lucide-react";
import { FaAirbnb, FaFacebook, FaGlobe, FaInstagram, FaLinkedin, FaPinterest, FaTiktok, FaTripadvisor, FaWhatsapp, FaYoutube } from "react-icons/fa";
import { HouseBrandIcon, type HouseSocialLink } from "@/components/venue/HouseSocialLinks";
import { venueSocialIcons } from "@/lib/venue-social-icons";
import { venueTabTitle } from "@/lib/venue-tab-title";
import { ProposalTourVideo } from "@/components/proposal/ProposalTourVideo";
import { resolveTourVideo } from "@/lib/tour-video";
import { venueService, type PublicVenueLink, type PublicVenueLinks } from "@/services/venue.service";
import { VenueLinkCreateForm } from "@/components/venue/VenueLinkEditor";
import { browserPublicSurfaceTransport, countedCardHref, dispatchPublicSurfaceBeacon } from "@/lib/public-surface";
import { VENUE_LINK_KINDS, type VenueLinkKind } from "@/lib/venue-link";

export function venueLinkChrome(_canReorder: boolean, _count: number) {
    return { grip: false, remove: false };
}

export function moveLinkBefore<T extends { kind: string }>(links: T[], fromKind: string, toKind: string) {
    if (fromKind === toKind) return links;
    const from = links.findIndex((link) => link.kind === fromKind);
    const to = links.findIndex((link) => link.kind === toKind);
    if (from < 0 || to < 0) return links;
    const next = links.slice();
    const [item] = next.splice(from, 1);
    next.splice(next.findIndex((link) => link.kind === toKind), 0, item!);
    return next;
}

export function blockDraggedClick(flag: { current: boolean }) {
    if (!flag.current) return false;
    flag.current = false;
    return true;
}

export async function commitLinkChange<T>(previous: T, request: () => Promise<T>) {
    try {
        return { value: await request(), failed: false as const, message: "" };
    } catch (error) {
        return { value: previous, failed: true as const, message: readLinkError(error) };
    }
}

export function CreateLinkError({ message }: { message: string }) {
    return message ? <p>{message}</p> : null;
}

export function readLinkError(error: unknown) {
    const message = (error as { response?: { data?: { message?: unknown } } })?.response?.data?.message;
    return typeof message === "string" && message.trim() ? message : "Não foi possível cadastrar o link.";
}

export async function hideConfirmedLink<T extends { kind: string }>(
    links: T[],
    kind: string,
    confirmed: boolean,
    request: (kind: string) => Promise<T[]>,
) {
    if (!confirmed) return { links, called: false, failed: false };
    const saved = await commitLinkChange(links, () => request(kind));
    return { links: saved.value, called: true, failed: saved.failed };
}

export function RemoveLinkPrompt({ label }: { label: string }) {
    return (
        <div>
            <h2>Tem certeza que quer remover?</h2>
            <p>{label} deixa de aparecer nesta página.</p>
        </div>
    );
}

const cardClass =
    "relative block rounded-xl border border-current/15 px-4 py-4 shadow-none transition-[filter] duration-200 hover:brightness-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2";

const BRAND_LABEL: Record<string, HouseSocialLink["label"]> = {
    WHATSAPP: "WhatsApp",
    INSTAGRAM: "Instagram",
    FACEBOOK: "Facebook",
    TIKTOK: "TikTok",
    SITE: "Site",
    ORGANIZATION_SITE: "Site",
};

const LUCIDE_ICON: Record<string, LucideIcon> = {
    PRESENTATION: Presentation,
    BUDGET_FORM: ClipboardList,
    RULES: ScrollText,
    EMAIL: Mail,
    GOOGLE_MAPS: MapPin,
    TOUR_VIDEO: Play,
    GOOGLE_BUSINESS: Store,
    MENU: UtensilsCrossed,
};

function LinkGlyph({ kind, surfaceColor }: { kind: string; surfaceColor: string }) {
    const brand = BRAND_LABEL[kind];
    if (brand) return <HouseBrandIcon label={brand} surfaceColor={surfaceColor} />;
    if (kind === "YOUTUBE") return <FaYoutube size={18} color="#FF0000" aria-hidden="true" />;
    if (kind === "PINTEREST") return <FaPinterest size={18} color="#E60023" aria-hidden="true" />;
    if (kind === "LINKEDIN") return <FaLinkedin size={18} color="#0A66C2" aria-hidden="true" />;
    if (kind === "AIRBNB") return <FaAirbnb size={18} color="#FF5A5F" aria-hidden="true" />;
    if (kind === "TRIPADVISOR") return <FaTripadvisor size={18} color="#34E0A1" aria-hidden="true" />;
    const Icon = LUCIDE_ICON[kind] ?? Link2;
    return <Icon className="h-[18px] w-[18px]" aria-hidden="true" />;
}

export function VenueLinksView({
    house,
    saving = false,
    confirmingLabel = null,
    onReorder,
    onAskRemove,
    onCancelRemove,
    onConfirmRemove,
    creating = false,
    createError = "",
    draftKind = "",
    draftUrl = "",
    onAskCreate,
    onDraftKind,
    onDraftUrl,
    onCancelCreate,
    onConfirmCreate,
    cardHref,
}: {
    house: PublicVenueLinks;
    saving?: boolean;
    confirmingLabel?: string | null;
    onReorder?: (kinds: string[]) => void;
    onAskRemove?: (kind: string) => void;
    onCancelRemove?: () => void;
    onConfirmRemove?: () => void;
    creating?: boolean;
    createError?: string;
    draftKind?: VenueLinkKind | "";
    draftUrl?: string;
    onAskCreate?: () => void;
    onDraftKind?: (kind: VenueLinkKind | "") => void;
    onDraftUrl?: (url: string) => void;
    onCancelCreate?: () => void;
    onConfirmCreate?: () => void;
    cardHref?: (kind: string) => string;
}) {
    const pageText = house.proposalTextColor || "#f7f7f5";
    const pageBackground = house.proposalPrimaryColor || "#111315";
    const cardStyle: CSSProperties = {
        backgroundColor: house.proposalSecondaryColor || "#ffffff",
        color: house.proposalTextColor || "#181818",
    };
    const slogan = house.slogan?.trim() ?? "";
    const tourVideo = resolveTourVideo(house.tourVideoUrl);
    const mapQuery = house.mapQuery?.trim() ?? "";
    const mapLabel = house.mapLabel?.trim() ?? "";
    const mapHref = mapQuery
        ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapQuery)}`
        : undefined;
    const mapEmbedSrc = mapQuery
        ? `https://maps.google.com/maps?q=${encodeURIComponent(mapQuery)}&hl=pt-BR&z=15&output=embed`
        : undefined;
    const cards = house.links.filter((link) => link.kind !== "TOUR_VIDEO" && link.kind !== "GOOGLE_MAPS");
    const footerSocials = venueSocialIcons(house.links, {
        WHATSAPP: FaWhatsapp,
        FACEBOOK: FaFacebook,
        TIKTOK: FaTiktok,
        INSTAGRAM: FaInstagram,
        SITE: FaGlobe,
    });
    const showFooter = Boolean(house.logoUrl || footerSocials.length > 0);
    const chrome = venueLinkChrome(house.canReorder, house.links.length);
    const openKinds = VENUE_LINK_KINDS.filter((kind) => !(house.usedKinds ?? []).includes(kind));
    const dragMoved = useRef(false);
    const dragging = useRef<string | null>(null);

    return (
        <div
            className="flex min-h-screen flex-col font-['Manrope',sans-serif] text-[15px] font-normal leading-[1.6]"
            style={{ color: pageText, backgroundColor: pageBackground }}
        >
        <main className="flex flex-1 flex-col items-center px-3 py-10">
            <div className="flex w-full max-w-md flex-col items-center">
                <header className="mb-10 flex w-full flex-col items-center gap-4 text-center">
                    {house.logoUrl ? (
                        <img src={house.logoUrl} alt={`Logo ${house.name}`} className="max-h-24 max-w-64 object-contain" />
                    ) : (
                        <div className="flex items-center justify-center">
                            <Calendar className="h-8 w-8" style={{ color: pageText }} aria-hidden="true" />
                            <span className="ml-2 text-3xl font-bold" style={{ color: pageText }}>
                                EventHub
                            </span>
                        </div>
                    )}
                    {slogan ? (
                        <p className="max-w-2xl whitespace-pre-line text-center text-[15px] font-normal leading-[1.6]">{slogan}</p>
                    ) : null}
                    {tourVideo ? (
                        <ProposalTourVideo video={tourVideo} className="aspect-video w-full overflow-hidden rounded-2xl" />
                    ) : null}
                </header>
                {cards.length > 0 && (
                    <ul className="flex w-full flex-col gap-3">
                        {cards.map((link) => (
                            <li
                                key={link.kind}
                                className="relative"
                                draggable={chrome.grip && !saving}
                                onDragStart={(event) => {
                                    if (!chrome.grip || saving) return;
                                    dragMoved.current = true;
                                    dragging.current = link.kind;
                                    event.dataTransfer.setData("text/plain", link.kind);
                                    event.dataTransfer.effectAllowed = "move";
                                }}
                                onDragOver={(event) => {
                                    if (chrome.grip) event.preventDefault();
                                }}
                                onDrop={(event) => {
                                    event.preventDefault();
                                    const from = event.dataTransfer.getData("text/plain") || dragging.current;
                                    dragging.current = null;
                                    if (!from || !onReorder) return;
                                    const next = moveLinkBefore(house.links, from, link.kind);
                                    if (next !== house.links) onReorder(next.map((item) => item.kind));
                                }}
                            >
                                <a
                                    href={cardHref ? cardHref(link.kind) : link.href}
                                    target={link.kind === "EMAIL" ? undefined : "_blank"}
                                    rel="noopener noreferrer"
                                    className={cardClass}
                                    style={cardStyle}
                                    onClick={(event) => {
                                        if (blockDraggedClick(dragMoved)) event.preventDefault();
                                    }}
                                >
                                    <span className="flex items-center gap-2">
                                        {chrome.grip ? (
                                            <span aria-label="Arrastar link" className="text-current">
                                                <GripVertical className="h-4 w-4" aria-hidden="true" />
                                            </span>
                                        ) : null}
                                        <LinkGlyph kind={link.kind} surfaceColor={cardStyle.color as string} />
                                    </span>
                                    <ArrowUpRight className="absolute right-4 top-4 h-4 w-4 opacity-60" aria-hidden="true" />
                                    <span className="mt-6 block text-left text-[16px] font-semibold tracking-[-0.02em]">{link.label}</span>
                                    {link.subtitle ? (
                                        <span className="mt-1 block text-left text-[13px] opacity-70">{link.subtitle}</span>
                                    ) : null}
                                </a>
                                {chrome.remove ? (
                                    <button
                                        type="button"
                                        aria-label={`Remover ${link.label}`}
                                        disabled={saving}
                                        draggable={false}
                                        onMouseDown={(event) => event.stopPropagation()}
                                        onClick={(event) => {
                                            event.preventDefault();
                                            event.stopPropagation();
                                            onAskRemove?.(link.kind);
                                        }}
                                        className="absolute right-10 top-3 z-10 rounded-full p-1 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        <Trash2 className="h-4 w-4" aria-hidden="true" />
                                    </button>
                                ) : null}
                            </li>
                        ))}
                    </ul>
                )}
                {mapEmbedSrc && (
                    <div className="mt-10 flex w-full flex-col items-center text-center">
                        {mapLabel ? (
                            <a
                                className="flex items-center justify-center gap-1 hover:underline"
                                href={mapHref}
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label="Abrir a localização no Google Maps"
                            >
                                <MapPin className="h-4 w-4" />
                                {mapLabel}
                            </a>
                        ) : null}
                        <div className="mt-4 h-56 w-full overflow-hidden rounded-2xl sm:h-72">
                            <iframe
                                title={`Mapa de ${house.name}`}
                                src={mapEmbedSrc}
                                className="h-full w-full border-0"
                                loading="lazy"
                                referrerPolicy="no-referrer-when-downgrade"
                                allowFullScreen
                            />
                        </div>
                    </div>
                )}
            </div>
            <Dialog open={creating} onOpenChange={(open) => { if (!open && !saving) onCancelCreate?.(); }}>
                <DialogContent>
                    <DialogTitle className="sr-only">Cadastrar link</DialogTitle>
                    <CreateLinkError message={createError} />
                    <VenueLinkCreateForm
                        kinds={openKinds}
                        kind={draftKind}
                        url={draftUrl}
                        onKind={(kind) => onDraftKind?.(kind)}
                        onUrl={(url) => onDraftUrl?.(url)}
                        onCancel={() => onCancelCreate?.()}
                        onConfirm={() => onConfirmCreate?.()}
                    />
                </DialogContent>
            </Dialog>
            <Dialog open={confirmingLabel !== null} onOpenChange={(open) => { if (!open && !saving) onCancelRemove?.(); }}>
                <DialogContent>
                    <DialogTitle>Tem certeza que quer remover?</DialogTitle>
                    <DialogDescription>
                        {confirmingLabel} deixa de aparecer nesta página.
                    </DialogDescription>
                    <div className="flex justify-end gap-2">
                        <button type="button" disabled={saving} onClick={onCancelRemove} className="rounded-full px-3 py-1 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-50">
                            Cancelar
                        </button>
                        <button type="button" disabled={saving} onClick={onConfirmRemove} className="rounded-full px-3 py-1 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-50">
                            Remover
                        </button>
                    </div>
                </DialogContent>
            </Dialog>
        </main>
        {showFooter && (
            <footer
                className="flex w-full flex-col items-center justify-between gap-y-8 px-6 py-8 md:flex-row md:items-start md:gap-x-8 md:gap-y-0"
                style={{
                    backgroundColor: house.proposalSecondaryColor || "#4f46e5",
                    color: house.proposalTextColor || "#ffffff",
                }}
            >
                {house.logoUrl && (
                    <div className="flex max-w-xl flex-col items-center md:items-start">
                        <img src={house.logoUrl} alt={`Logo ${house.name}`} className="max-h-16 max-w-48 object-contain" />
                    </div>
                )}
                {footerSocials.length > 0 && (
                    <div className="flex flex-col items-center md:items-start">
                        <span className="mb-4 text-lg font-semibold md:mb-6">Siga nas redes sociais:</span>
                        <div className="flex justify-center gap-8 md:justify-start">
                            {footerSocials.map((link) => (
                                <a
                                    key={link.label}
                                    href={link.href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    title={link.label}
                                    aria-label={link.label}
                                    className="transition-transform hover:scale-110"
                                    style={{ color: "inherit" }}
                                >
                                    <link.icon size={26} />
                                </a>
                            ))}
                        </div>
                    </div>
                )}
            </footer>
        )}
        </div>
    );
}

export default function VenueLinks({ venueKey }: { venueKey?: string } = {}) {
    const { id: paramId } = useParams();
    const id = venueKey || paramId;
    const [house, setHouse] = useState<PublicVenueLinks | null>(null);
    const [links, setLinks] = useState<PublicVenueLink[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [confirmKind, setConfirmKind] = useState<string | null>(null);
    const [usedKinds, setUsedKinds] = useState<string[]>([]);
    const [creating, setCreating] = useState(false);
    const [createError, setCreateError] = useState("");
    const [draftKind, setDraftKind] = useState<VenueLinkKind | "">("");
    const [draftUrl, setDraftUrl] = useState("");
    const sentBeacon = useRef(new Set<string>());

    useEffect(() => {
        if (!id) return;
        let active = true;
        setLoading(true);
        setHouse(null);
        venueService
            .getVenueLinks(id)
            .then((data) => {
                if (!active) return;
                setHouse(data);
                setLinks(data.links);
                setUsedKinds(data.usedKinds ?? []);
            })
            .catch(() => {
                if (active) setHouse(null);
            })
            .finally(() => {
                if (active) setLoading(false);
            });
        return () => {
            active = false;
        };
    }, [id]);

    useEffect(() => {
        document.title = house?.name ? venueTabTitle(house.name, house.slogan) : "EventHub";
        return () => {
            document.title = "EventHub";
        };
    }, [house?.name, house?.slogan]);

    useEffect(() => {
        if (loading || !house || !id) return;
        dispatchPublicSurfaceBeacon("LINKS", id, browserPublicSurfaceTransport(sentBeacon.current));
    }, [loading, house, id]);

    if (loading || !house || !id) {
        return (
            <div className="min-h-screen bg-[#111315]" aria-busy={loading}>
                {!loading && (
                    <p className="px-6 py-16 text-center text-[15px] text-[#f7f7f5]">
                        Não foi possível carregar os links deste espaço.
                    </p>
                )}
            </div>
        );
    }

    const confirming = links.find((link) => link.kind === confirmKind) ?? null;

    async function reorder(kinds: string[]) {
        if (!id || saving) return;
        const previous = links;
        const next = kinds.flatMap((kind) => {
            const link = previous.find((item) => item.kind === kind);
            return link ? [link] : [];
        });
        setLinks(next);
        setSaving(true);
        const saved = await commitLinkChange(previous, async () => (await venueService.orderVenueLinks(id, kinds)).links);
        setLinks(saved.value);
        setSaving(false);
    }

    async function confirmRemove() {
        if (!id || !confirmKind || saving) return;
        const kind = confirmKind;
        const previous = links;
        setLinks(previous.filter((link) => link.kind !== kind));
        setSaving(true);
        const saved = await hideConfirmedLink(previous, kind, true, async (hideKind) => (await venueService.hideVenueLink(id, hideKind)).links);
        setLinks(saved.links);
        setSaving(false);
        if (!saved.failed) setConfirmKind(null);
    }

    async function confirmCreate() {
        if (!id || !draftKind || saving) return;
        const previous = { links, usedKinds };
        setSaving(true);
        const saved = await commitLinkChange(previous, () => venueService.createVenueLink(id, { kind: draftKind, url: draftUrl || null }));
        setLinks(saved.value.links);
        setUsedKinds(saved.value.usedKinds ?? previous.usedKinds);
        setSaving(false);
        if (saved.failed) setCreateError(saved.message);
        else {
            setCreateError("");
            setCreating(false);
        }
    }

    return (
        <VenueLinksView
            cardHref={(kind) => countedCardHref(String(import.meta.env.VITE_API_URL || ""), id, kind)}
            house={{ ...house, links, usedKinds }}
            saving={saving}
            confirmingLabel={confirming?.label ?? null}
            creating={creating}
            createError={createError}
            draftKind={draftKind}
            draftUrl={draftUrl}
            onReorder={(kinds) => { void reorder(kinds); }}
            onAskRemove={setConfirmKind}
            onCancelRemove={() => { if (!saving) setConfirmKind(null); }}
            onConfirmRemove={() => { void confirmRemove(); }}
            onAskCreate={() => {
                setDraftKind("");
                setDraftUrl("");
                setCreateError("");
                setCreating(true);
            }}
            onDraftKind={setDraftKind}
            onDraftUrl={setDraftUrl}
            onCancelCreate={() => { if (!saving) setCreating(false); }}
            onConfirmCreate={() => { void confirmCreate(); }}
        />
    );
}
