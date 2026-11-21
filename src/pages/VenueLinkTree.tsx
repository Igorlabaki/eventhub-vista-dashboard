import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { Check, CircleCheck, CircleDashed, GripVertical, Link2, Loader2, Search } from "lucide-react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { ErrorPage } from "@/components/ErrorPage";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { LinkTreeShareActions } from "@/components/venue/LinkTreeShareActions";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { handleBackendError } from "@/lib/error-handler";
import { VENUE_LINK_LABEL, type VenueLinkKind } from "@/lib/venue-link";
import { venueService, type PublicVenueLinks } from "@/services/venue.service";
import { useUserVenuePermissionStore } from "@/store/userVenuePermissionStore";
import { Permissions } from "@/types/permissions";

export const INTERNAL_LINK_TREE_KINDS = ["PRESENTATION", "BUDGET_FORM", "RULES"] as const;

export const LINK_TREE_TOP = "TOUR_VIDEO";
export const LINK_TREE_BOTTOM = "GOOGLE_MAPS";

export function linkTreePlaceFixed(kind: string) {
    return kind === LINK_TREE_TOP || kind === LINK_TREE_BOTTOM;
}

export { LinkTreeQr } from "@/components/venue/LinkTreeShareActions";

export type PanelLink = {
    kind: string;
    label: string;
    visible: boolean;
    created: boolean;
};

export function pinPanelLinks(rows: PanelLink[]): PanelLink[] {
    const top = rows.find((row) => row.kind === LINK_TREE_TOP);
    const bottom = rows.find((row) => row.kind === LINK_TREE_BOTTOM);
    const middle = rows.filter((row) => !linkTreePlaceFixed(row.kind));
    return [...(top ? [top] : []), ...middle, ...(bottom ? [bottom] : [])];
}

export function panelLinksFromHouse(house: Pick<PublicVenueLinks, "links" | "usedKinds" | "tourVideoUrl" | "mapQuery">): PanelLink[] {
    const labels = new Map(house.links.map((link) => [link.kind, link.label]));
    const visible = new Set(house.links.map((link) => link.kind));
    const known = house.usedKinds ?? house.links.map((link) => link.kind);
    const created = new Set(known);
    const kinds = [...known];
    for (const kind of INTERNAL_LINK_TREE_KINDS) {
        if (!kinds.includes(kind)) kinds.push(kind);
    }
    if (house.tourVideoUrl?.trim() && !kinds.includes(LINK_TREE_TOP)) kinds.unshift(LINK_TREE_TOP);
    if (house.mapQuery?.trim() && !kinds.includes(LINK_TREE_BOTTOM)) kinds.push(LINK_TREE_BOTTOM);
    const seen = new Set<string>();
    const rows: PanelLink[] = [];
    for (const kind of kinds) {
        if (seen.has(kind)) continue;
        seen.add(kind);
        const onPage = visible.has(kind) || (!created.has(kind) && linkTreePlaceFixed(kind));
        rows.push({
            kind,
            label: labels.get(kind) ?? VENUE_LINK_LABEL[kind as VenueLinkKind] ?? kind,
            visible: onPage,
            created: created.has(kind),
        });
    }
    return pinPanelLinks(rows);
}

export function linkTreeSave(row: Pick<PanelLink, "kind" | "created">, visible: boolean) {
    if (!row.created) return { create: { kind: row.kind, url: null, visible } };
    return { visible: { kind: row.kind, visible } };
}

export type LinkTreeVisibility = "" | "on" | "off";

export function linkTreeCanDrag(canEdit: boolean, query: string, visibility: LinkTreeVisibility) {
    return canEdit && query.trim().length === 0 && visibility === "";
}

export function applyPanelOrder(rows: PanelLink[], fromKind: string, toKind: string) {
    if (fromKind === toKind || linkTreePlaceFixed(fromKind)) return { rows, kinds: null as string[] | null };
    const from = rows.findIndex((row) => row.kind === fromKind);
    const to = rows.findIndex((row) => row.kind === toKind);
    if (from < 0 || to < 0) return { rows, kinds: null };
    const next = rows.slice();
    const [item] = next.splice(from, 1);
    next.splice(next.findIndex((row) => row.kind === toKind), 0, item!);
    const pinned = pinPanelLinks(next);
    const kinds = pinned.filter((row) => row.created).map((row) => row.kind);
    const before = rows.filter((row) => row.created).map((row) => row.kind);
    if (kinds.length === before.length && kinds.every((kind, index) => kind === before[index])) {
        return { rows, kinds: null };
    }
    return { rows: pinned, kinds };
}

export function shownPanelLinks(rows: PanelLink[], query: string, visibility: LinkTreeVisibility = "") {
    const term = query.trim().toLowerCase();
    return rows.filter((row) => {
        if (term && !row.label.toLowerCase().includes(term)) return false;
        if (visibility === "on") return row.visible;
        if (visibility === "off") return !row.visible;
        return true;
    });
}

export function applyVenueLinkVisible(rows: PanelLink[], kind: string, visible: boolean) {
    const current = rows.find((row) => row.kind === kind);
    if (!current || current.visible === visible) return { rows, body: null };
    return {
        rows: rows.map((row) => (row.kind === kind ? { ...row, visible } : row)),
        body: { kind, visible },
    };
}

export function queueVenueLinkVisible(
    pending: Map<string, boolean>,
    rows: PanelLink[],
    kind: string,
    canEdit: boolean,
) {
    if (!canEdit) return { rows, body: null };
    const current = rows.find((row) => row.kind === kind);
    if (!current) return { rows, body: null };
    const desired = !current.visible;
    if (pending.get(kind) === desired) return { rows, body: null };
    const next = applyVenueLinkVisible(rows, kind, desired);
    if (!next.body) return { rows, body: null };
    pending.set(kind, desired);
    return next;
}

type SaveState = "idle" | "saving" | "saved";

export function VenueLinkTreeView({
    rows,
    query,
    onQuery,
    canEdit,
    onToggle,
    onReorder,
    saveState,
    venueName = "",
}: {
    rows: PanelLink[];
    query: string;
    onQuery: (value: string) => void;
    canEdit: boolean;
    onToggle: (kind: string) => void;
    onReorder?: (rows: PanelLink[]) => void;
    saveState: SaveState;
    venueName?: string;
}) {
    const [visibility, setVisibility] = useState<LinkTreeVisibility>("");
    const canDrag = linkTreeCanDrag(canEdit, query, visibility);
    const dragging = useRef<string | null>(null);
    const dragMoved = useRef(false);
    const shown = shownPanelLinks(rows, query, visibility);
    const onTree = rows.filter((row) => row.visible).length;
    const cards = [
        { label: "Links", value: rows.length, icon: Link2, iconClass: "bg-violet-100 text-violet-600" },
        { label: "No link tree", value: onTree, icon: CircleCheck, iconClass: "bg-emerald-100 text-emerald-600" },
        { label: "Fora", value: Math.max(rows.length - onTree, 0), icon: CircleDashed, iconClass: "bg-gray-100 text-gray-500" },
    ];

    return (
        <div>
            <div className="mb-6 rounded-3xl border bg-white p-4 shadow-sm sm:p-5">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
                    <div className="relative min-w-0 flex-1">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            value={query}
                            onChange={(event) => onQuery(event.target.value)}
                            placeholder="Buscar links..."
                            aria-label="Buscar links"
                            className="h-10 rounded-full bg-white pl-9"
                        />
                    </div>
                    <label className="flex h-10 shrink-0 items-center gap-2 rounded-full border bg-white px-3 text-sm text-foreground">
                        Visibilidade
                        <select
                            aria-label="Visibilidade"
                            className="bg-transparent pr-1 outline-none"
                            value={visibility}
                            onChange={(event) => setVisibility(event.target.value as LinkTreeVisibility)}
                        >
                            <option value="">Todas</option>
                            <option value="on">No link tree</option>
                            <option value="off">Fora</option>
                        </select>
                    </label>
                    <LinkTreeShareActions venueName={venueName} />
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                {cards.map((card) => (
                    <div key={card.label} className="flex items-center gap-3 rounded-2xl border bg-white px-5 py-4">
                        <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${card.iconClass}`}>
                            <card.icon className="h-5 w-5" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">{card.label}</p>
                            <p className="text-2xl font-semibold tracking-tight tabular-nums">{card.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="mb-2 mt-4 flex items-center justify-between text-sm text-muted-foreground">
                <span>{shown.length} links</span>
                {saveState === "saving" && (
                    <span className="flex items-center gap-1" aria-live="polite">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Salvando...
                    </span>
                )}
                {saveState === "saved" && (
                    <span className="flex items-center gap-1 text-emerald-600" aria-live="polite">
                        <Check className="h-4 w-4" />
                        Salvo
                    </span>
                )}
            </div>

            {shown.length === 0 ? (
                <p className="rounded-lg border border-dashed border-gray-300 bg-gray-50 py-10 text-center text-gray-500">
                    {query.trim() || visibility ? "Nenhum link encontrado" : "Nenhum link cadastrado"}
                </p>
            ) : (
                <Table className="rounded-md bg-white shadow-lg">
                    <TableHeader>
                        <TableRow>
                            {canDrag ? (
                                <TableHead className="w-12">
                                    <span className="sr-only">Ordem</span>
                                </TableHead>
                            ) : null}
                            <TableHead className="w-12">
                                <span className="sr-only">No link tree</span>
                            </TableHead>
                            <TableHead>Nome</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {shown.map((row) => {
                            const canDragRow = canDrag && !linkTreePlaceFixed(row.kind);
                            return (
                            <TableRow
                                key={row.kind}
                                isSelectable={canEdit}
                                draggable={canDragRow ? true : undefined}
                                data-visible={row.visible ? "on" : "off"}
                                onDragStart={(event) => {
                                    if (!canDragRow) return;
                                    dragMoved.current = true;
                                    dragging.current = row.kind;
                                    event.dataTransfer.setData("text/plain", row.kind);
                                    event.dataTransfer.effectAllowed = "move";
                                }}
                                onDragOver={(event) => {
                                    if (canDrag) event.preventDefault();
                                }}
                                onDrop={(event) => {
                                    event.preventDefault();
                                    const from = event.dataTransfer.getData("text/plain") || dragging.current;
                                    dragging.current = null;
                                    if (!from || !onReorder) return;
                                    const next = applyPanelOrder(rows, from, row.kind);
                                    if (next.kinds) onReorder(next.rows);
                                }}
                                onClick={() => {
                                    if (dragMoved.current) {
                                        dragMoved.current = false;
                                        return;
                                    }
                                    if (canEdit) onToggle(row.kind);
                                }}
                                className={cn(
                                    "border-l-4",
                                    row.visible
                                        ? "border-l-emerald-500 bg-emerald-50 hover:bg-emerald-100"
                                        : "border-l-transparent hover:bg-gray-50",
                                )}
                            >
                                {canDrag ? (
                                    <TableCell className="w-12">
                                        {canDragRow ? (
                                            <span aria-label={`Arrastar ${row.label}`} className="text-muted-foreground">
                                                <GripVertical className="h-4 w-4" aria-hidden="true" />
                                            </span>
                                        ) : null}
                                    </TableCell>
                                ) : null}
                                <TableCell className="w-12">
                                    <Checkbox
                                        checked={row.visible}
                                        disabled={!canEdit}
                                        aria-label={row.visible ? `Tirar ${row.label} do link tree` : `Mostrar ${row.label} no link tree`}
                                        onClick={(event) => event.stopPropagation()}
                                        onCheckedChange={() => {
                                            if (canEdit) onToggle(row.kind);
                                        }}
                                        className="border-emerald-600 data-[state=checked]:bg-emerald-600 data-[state=checked]:text-white"
                                    />
                                </TableCell>
                                <TableCell className="font-medium text-gray-900">{row.label}</TableCell>
                            </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            )}
        </div>
    );
}

export default function VenueLinkTree() {
    const { id } = useParams();
    const { toast } = useToast();
    const { currentUserVenuePermission } = useUserVenuePermissionStore();
    const canEdit = currentUserVenuePermission?.permissions?.includes(Permissions.EDIT_VENUE_SITE) ?? false;
    const [rows, setRows] = useState<PanelLink[] | null>(null);
    const [venueName, setVenueName] = useState("");
    const [query, setQuery] = useState("");
    const [failed, setFailed] = useState(false);
    const [saveState, setSaveState] = useState<SaveState>("idle");
    const pending = useRef(new Map<string, boolean>());

    useEffect(() => {
        if (!id) return;
        let active = true;
        setFailed(false);
        venueService
            .getVenueLinks(id)
            .then((data) => {
                if (!active) return;
                setVenueName(data.name);
                setRows(panelLinksFromHouse(data));
            })
            .catch(() => {
                if (active) setFailed(true);
            });
        return () => {
            active = false;
        };
    }, [id]);

    const onReorder = (nextRows: PanelLink[]) => {
        if (!id || !rows || saveState === "saving") return;
        const kinds = nextRows.filter((row) => row.created).map((row) => row.kind);
        const previous = rows;
        setRows(nextRows);
        setSaveState("saving");
        void venueService.orderVenueLinks(id, kinds).then(
            () => setSaveState("saved"),
            (error) => {
                setRows(previous);
                setSaveState("idle");
                const { title, message } = handleBackendError(error, "Não foi possível salvar a ordem.");
                toast({ title, description: message, variant: "destructive" });
            },
        );
    };

    const onToggle = (kind: string) => {
        if (!id || !rows) return;
        const next = queueVenueLinkVisible(pending.current, rows, kind, canEdit);
        if (!next.body) return;
        const previous = rows;
        const body = next.body;
        const row = previous.find((item) => item.kind === kind);
        const save = row ? linkTreeSave(row, body.visible) : { visible: body };
        setRows(next.rows.map((item) => (item.kind === kind && "create" in save ? { ...item, created: true } : item)));
        setSaveState("saving");
        const request = "create" in save
            ? venueService.createVenueLink(id, save.create)
            : venueService.setVenueLinkVisible(id, save.visible);
        void request.then(
            () => {
                pending.current.delete(kind);
                setSaveState("saved");
            },
            (error) => {
                pending.current.delete(kind);
                setRows(previous);
                setSaveState("idle");
                const { title, message } = handleBackendError(error, "Não foi possível salvar o link.");
                toast({ title, description: message, variant: "destructive" });
            },
        );
    };

    if (failed) return <ErrorPage />;

    return (
        <DashboardLayout title="Link tree" subtitle="Escolha o que aparece na página pública">
            {rows ? (
                <VenueLinkTreeView
                    rows={rows}
                    query={query}
                    onQuery={setQuery}
                    canEdit={canEdit}
                    onToggle={onToggle}
                    onReorder={onReorder}
                    saveState={saveState}
                    venueName={venueName}
                />
            ) : (
                <p className="text-sm text-muted-foreground">Carregando links...</p>
            )}
        </DashboardLayout>
    );
}
