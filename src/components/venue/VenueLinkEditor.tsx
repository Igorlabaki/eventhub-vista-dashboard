import { useState } from "react";
import { Eye, Link2, Pencil, Search, Trash2, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LinkTreeShareActions } from "@/components/venue/LinkTreeShareActions";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
    checkVenueLinkUrl,
    createVenueLink,
    isPastedVenueLink,
    remainingVenueLinkKinds,
    removeVenueLink,
    replaceVenueLinkUrl,
    VENUE_LINK_FORMAT,
    VENUE_LINK_LABEL,
    venueLinkHref,
    venueLinkSourceHint,
    venueLinkSummary,
    venueLinkView,
    type EditorVenueLink,
    type VenueLinkKind,
    type VenueLinkRow,
    type VenueLinkSource,
    type VenueLinkVisibility,
} from "@/lib/venue-link";

type VenueLinkEditorProps = {
    rows: EditorVenueLink[];
    onChange: (rows: EditorVenueLink[]) => void;
    name?: string;
    source?: VenueLinkSource;
};

type UrlModal = { mode: "edit"; kind: VenueLinkKind; url: string };

export function submitVenueLinkDraft(
    rows: EditorVenueLink[],
    kind: VenueLinkKind | "",
    url: string,
    name: string,
    source: VenueLinkSource,
    visible = true,
) {
    if (!kind) return rows;
    return createVenueLink(rows, kind, isPastedVenueLink(kind) ? url : null, name, source, visible);
}

const summaryCards = [
    { key: "total" as const, label: "Total", icon: Users, iconClass: "bg-violet-100 text-violet-600" },
    { key: "onTree" as const, label: "No link tree", icon: Eye, iconClass: "bg-emerald-100 text-emerald-600" },
    { key: "withLink" as const, label: "Com link", icon: Link2, iconClass: "bg-violet-100 text-violet-600" },
];

function asEditorRows(next: VenueLinkRow[], previous: EditorVenueLink[], name: string, source: VenueLinkSource) {
    return next.map((row) => {
        const kept = previous.find((item) => item.kind === row.kind && item.url === row.url);
        if (kept) return { ...kept, visible: row.visible, position: row.position };
        const href = venueLinkHref(name, row, source);
        return {
            ...row,
            label: VENUE_LINK_LABEL[row.kind],
            hint: href ? null : venueLinkSourceHint(row.kind),
        };
    });
}

export function VenueLinkUrlForm({
    modal,
    onUrl,
    onCancel,
    onConfirm,
}: {
    modal: UrlModal;
    onUrl: (url: string) => void;
    onCancel: () => void;
    onConfirm: () => void;
}) {
    const check = checkVenueLinkUrl(modal.kind, modal.url);
    const label = VENUE_LINK_LABEL[modal.kind];
    const title = `Editar ${label}`;
    return (
        <div>
            <h2 className="text-lg font-semibold">{title}</h2>
            <p className="text-sm text-muted-foreground">Cole a URL de {label}.</p>
            <label className="mt-4 block text-sm" htmlFor="venue-link-url">URL</label>
            <Input
                id="venue-link-url"
                value={modal.url}
                placeholder={VENUE_LINK_FORMAT[modal.kind as keyof typeof VENUE_LINK_FORMAT]}
                onChange={(event) => onUrl(event.target.value)}
            />
            <p className={`mt-2 text-sm ${check.status === "green" ? "text-green-700" : check.status === "amber" ? "text-amber-700" : "text-red-600"}`}>
                {check.message}
            </p>
            <div className="mt-4 flex justify-end gap-2">
                <button type="button" onClick={onCancel}>Cancelar</button>
                <button type="button" disabled={check.status !== "green"} onClick={onConfirm}>
                    Salvar
                </button>
            </div>
        </div>
    );
}

export function VenueLinkCreateForm({
    kinds,
    kind,
    url,
    onKind,
    onUrl,
    visible = true,
    onVisible,
    onCancel,
    onConfirm,
}: {
    kinds: VenueLinkKind[];
    kind: VenueLinkKind | "";
    url: string;
    visible?: boolean;
    onKind: (kind: VenueLinkKind | "") => void;
    onUrl: (url: string) => void;
    onVisible?: (visible: boolean) => void;
    onCancel: () => void;
    onConfirm: () => void;
}) {
    const pasted = kind !== "" && isPastedVenueLink(kind);
    const check = pasted ? checkVenueLinkUrl(kind, url) : null;
    const ready = kind !== "" && (!pasted || check?.status === "green");
    return (
        <div>
            <h2 className="text-lg font-semibold">Cadastrar link</h2>
            <label className="mt-4 block text-sm" htmlFor="venue-link-kind">Rede</label>
            <select
                id="venue-link-kind"
                aria-label="Rede"
                className="mt-1 h-10 w-full rounded-md border bg-white px-3"
                value={kind}
                onChange={(event) => onKind(event.target.value as VenueLinkKind | "")}
            >
                <option value="">Selecione</option>
                {kinds.map((item) => (
                    <option key={item} value={item}>{VENUE_LINK_LABEL[item]}</option>
                ))}
            </select>
            {pasted && (
                <>
                    <label className="mt-4 block text-sm" htmlFor="venue-link-url">URL</label>
                    <Input
                        id="venue-link-url"
                        value={url}
                        placeholder={VENUE_LINK_FORMAT[kind as keyof typeof VENUE_LINK_FORMAT]}
                        onChange={(event) => onUrl(event.target.value)}
                    />
                    <p className={`mt-2 text-sm ${check?.status === "green" ? "text-green-700" : check?.status === "amber" ? "text-amber-700" : "text-red-600"}`}>
                        {check?.message}
                    </p>
                    <label className="mt-4 flex items-center gap-2 text-sm">
                        <input
                            type="checkbox"
                            checked={visible}
                            aria-label="Mostrar no link tree"
                            onChange={(event) => onVisible?.(event.target.checked)}
                        />
                        Mostrar no link tree
                    </label>
                </>
            )}
            <div className="mt-4 flex justify-end gap-2">
                <button type="button" onClick={onCancel}>Cancelar</button>
                <button type="button" disabled={!ready} onClick={onConfirm}>Cadastrar link</button>
            </div>
        </div>
    );
}

export function VenueLinkEditor({ rows, onChange, name = "", source = {} }: VenueLinkEditorProps) {
    const [query, setQuery] = useState("");
    const [visibility, setVisibility] = useState<VenueLinkVisibility>("all");
    const [modal, setModal] = useState<UrlModal | null>(null);
    const [creating, setCreating] = useState(false);
    const [draftKind, setDraftKind] = useState<VenueLinkKind | "">("");
    const [draftUrl, setDraftUrl] = useState("");
    const [draftVisible, setDraftVisible] = useState(true);
    const networks = rows.filter((row) => isPastedVenueLink(row.kind));
    const remaining = remainingVenueLinkKinds(rows).filter((kind) => isPastedVenueLink(kind));
    const summary = venueLinkSummary(networks);
    const view = venueLinkView(networks, query, visibility);
    const emptyCreated = networks.length === 0 && query.trim() === "" && visibility === "all";

    const apply = (next: VenueLinkRow[]) => {
        if (next === rows) return;
        onChange(asEditorRows(next, rows, name, source));
    };

    const confirmModal = () => {
        if (!modal) return;
        const next = replaceVenueLinkUrl(rows, modal.kind, modal.url);
        if (next === rows) return;
        apply(next);
        setModal(null);
    };

    const confirmCreate = () => {
        const next = submitVenueLinkDraft(rows, draftKind, draftUrl, name, source, draftVisible);
        if (next === rows) return;
        apply(next);
        setCreating(false);
    };

    return (
        <div className="space-y-4">
            <div className="rounded-3xl border bg-white p-4 shadow-sm sm:p-5">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
                    <div className="relative min-w-0 flex-1">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            value={query}
                            onChange={(event) => setQuery(event.target.value)}
                            placeholder="Buscar redes..."
                            aria-label="Buscar redes"
                            className="h-10 rounded-full bg-white pl-9"
                        />
                    </div>
                    <Button
                        type="button"
                        variant="outline"
                        className="h-10 shrink-0 rounded-full"
                        disabled={remaining.length === 0}
                        onClick={() => {
                            setDraftKind("");
                            setDraftUrl("");
                            setDraftVisible(true);
                            setCreating(true);
                        }}
                    >
                        Cadastrar link
                    </Button>
                    <label className="flex h-10 shrink-0 items-center gap-2 rounded-full border bg-white px-3 text-sm text-foreground">
                        Visibilidade
                        <select
                            aria-label="Visibilidade"
                            className="bg-transparent pr-1 outline-none"
                            value={visibility}
                            onChange={(event) => setVisibility(event.target.value as VenueLinkVisibility)}
                        >
                            <option value="all">Todas</option>
                            <option value="visible">No link tree</option>
                            <option value="hidden">Ocultas</option>
                        </select>
                    </label>
                    <LinkTreeShareActions venueName={name} />
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                {summaryCards.map((card) => (
                    <div key={card.label} className="flex items-center gap-3 rounded-2xl border bg-white px-5 py-4">
                        <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${card.iconClass}`}>
                            <card.icon className="h-5 w-5" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">{card.label}</p>
                            <p className="text-2xl font-semibold tracking-tight tabular-nums">{summary[card.key]}</p>
                        </div>
                    </div>
                ))}
            </div>

            <p className="text-sm text-muted-foreground">{view.shown.length} redes</p>

            {view.shown.length === 0 ? (
                <p className="rounded-md border bg-white px-4 py-6 text-sm text-muted-foreground">
                    {emptyCreated ? "Nenhuma rede criada" : "Nenhuma rede encontrada"}
                </p>
            ) : (
                <Table className="bg-white rounded-md shadow-lg">
                    <TableHeader>
                        <TableRow>
                            <TableHead>Nome</TableHead>
                            <TableHead>Link</TableHead>
                            <TableHead className="w-[140px] text-center">Ações</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {view.shown.map((row) => {
                            const index = rows.indexOf(row);
                            return (
                                <TableRow
                                    key={`${row.kind}-${index}`}
                                    className="hover:bg-gray-50"
                                >
                                    <TableCell className="font-medium">{row.label}</TableCell>
                                    <TableCell>
                                        <span className="text-sm text-gray-700">
                                            {isPastedVenueLink(row.kind) && row.url && row.url !== "created" ? row.url : "—"}
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <div className="flex items-center justify-center gap-2">
                                            {isPastedVenueLink(row.kind) && (
                                                <button
                                                    type="button"
                                                    className="rounded-full p-2 text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                                                    aria-label={`Editar URL de ${row.label}`}
                                                    onClick={() => setModal({ mode: "edit", kind: row.kind, url: row.url ?? "" })}
                                                >
                                                    <Pencil className="h-4 w-4" />
                                                </button>
                                            )}
                                            <button
                                                type="button"
                                                className="rounded-full p-2 text-gray-500 hover:bg-red-50 hover:text-red-600"
                                                aria-label={`Remover ${row.label}`}
                                                onClick={() => onChange(removeVenueLink(rows, index))}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            )}

            <Dialog open={modal !== null} onOpenChange={(open) => { if (!open) setModal(null); }}>
                <DialogContent>
                    {modal && (
                        <>
                            <DialogTitle className="sr-only">{`Editar ${VENUE_LINK_LABEL[modal.kind]}`}</DialogTitle>
                            <VenueLinkUrlForm
                                modal={modal}
                                onUrl={(url) => setModal({ ...modal, url })}
                                onCancel={() => setModal(null)}
                                onConfirm={confirmModal}
                            />
                        </>
                    )}
                </DialogContent>
            </Dialog>
            <Dialog open={creating} onOpenChange={(open) => { if (!open) setCreating(false); }}>
                <DialogContent>
                    <DialogTitle className="sr-only">Cadastrar link</DialogTitle>
                    <VenueLinkCreateForm
                        kinds={remaining}
                        kind={draftKind}
                        url={draftUrl}
                        visible={draftVisible}
                        onKind={setDraftKind}
                        onUrl={setDraftUrl}
                        onVisible={setDraftVisible}
                        onCancel={() => setCreating(false)}
                        onConfirm={confirmCreate}
                    />
                </DialogContent>
            </Dialog>
        </div>
    );
}
