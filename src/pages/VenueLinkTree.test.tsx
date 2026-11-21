import { readFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import {
    applyPanelOrder,
    applyVenueLinkVisible,
    linkTreeCanDrag,
    linkTreeSave,
    panelLinksFromHouse,
    pinPanelLinks,
    queueVenueLinkVisible,
    shownPanelLinks,
    LinkTreeQr,
    VenueLinkTreeView,
    type PanelLink,
} from "./VenueLinkTree";

const house = {
    links: [
        { kind: "INSTAGRAM", label: "Instagram", href: "https://instagram.com/ar756_" },
        { kind: "SITE", label: "Site", href: "https://ar756.com" },
    ],
    usedKinds: ["INSTAGRAM", "FACEBOOK", "SITE"],
};

function rows(): PanelLink[] {
    return panelLinksFromHouse(house);
}

describe("tela interna do link tree", () => {
    it("lista o link ja criado e deixa apresentacao, orcamento e regras sempre a disposicao", () => {
        expect(rows()).toEqual([
            { kind: "INSTAGRAM", label: "Instagram", visible: true, created: true },
            { kind: "FACEBOOK", label: "Facebook", visible: false, created: true },
            { kind: "SITE", label: "Site", visible: true, created: true },
            { kind: "PRESENTATION", label: "Apresentação", visible: false, created: false },
            { kind: "BUDGET_FORM", label: "Fazer orçamento", visible: false, created: false },
            { kind: "RULES", label: "Regras", visible: false, created: false },
        ]);
        expect(panelLinksFromHouse({ links: house.links })).toEqual([
            { kind: "INSTAGRAM", label: "Instagram", visible: true, created: true },
            { kind: "SITE", label: "Site", visible: true, created: true },
            { kind: "PRESENTATION", label: "Apresentação", visible: false, created: false },
            { kind: "BUDGET_FORM", label: "Fazer orçamento", visible: false, created: false },
            { kind: "RULES", label: "Regras", visible: false, created: false },
        ]);
        const already = panelLinksFromHouse({
            links: [...house.links, { kind: "PRESENTATION", label: "Apresentação", href: "/espaco/AR756/apresentacao" }],
            usedKinds: ["PRESENTATION", "INSTAGRAM", "SITE"],
        });
        expect(already.filter((row) => row.kind === "PRESENTATION")).toEqual([
            { kind: "PRESENTATION", label: "Apresentação", visible: true, created: true },
        ]);
    });

    it("marcar apresentacao, orcamento ou regras sem linha grava o tipo, sem url", () => {
        const presentation = rows().find((row) => row.kind === "PRESENTATION");
        const budget = rows().find((row) => row.kind === "BUDGET_FORM");
        const instagram = rows().find((row) => row.kind === "INSTAGRAM");
        expect(presentation && linkTreeSave(presentation, true)).toEqual({
            create: { kind: "PRESENTATION", url: null, visible: true },
        });
        expect(budget && linkTreeSave(budget, true)).toEqual({
            create: { kind: "BUDGET_FORM", url: null, visible: true },
        });
        expect(instagram && linkTreeSave(instagram, false)).toEqual({
            visible: { kind: "INSTAGRAM", visible: false },
        });
        expect(presentation && linkTreeSave({ ...presentation, created: true }, false)).toEqual({
            visible: { kind: "PRESENTATION", visible: false },
        });
    });

    it("o clique manda o visivel desejado e o segundo manda o oposto", () => {
        const pending = new Map<string, boolean>();
        const first = queueVenueLinkVisible(pending, rows(), "INSTAGRAM", true);
        expect(first.body).toEqual({ kind: "INSTAGRAM", visible: false });
        const second = queueVenueLinkVisible(pending, first.rows, "INSTAGRAM", true);
        expect(second.body).toEqual({ kind: "INSTAGRAM", visible: true });
    });

    it("repetir o mesmo valor nao muda a lista nem devolve outro corpo", () => {
        const pending = new Map<string, boolean>();
        const current = rows();
        const first = queueVenueLinkVisible(pending, current, "SITE", true);
        const again = queueVenueLinkVisible(pending, current, "SITE", true);
        expect(first.body).toEqual({ kind: "SITE", visible: false });
        expect(again.body).toBeNull();
        expect(again.rows).toBe(current);
        const kept = applyVenueLinkVisible(first.rows, "SITE", false);
        expect(kept.body).toBeNull();
        expect(kept.rows).toBe(first.rows);
    });

    it("quem nao edita o site nao devolve corpo para o PUT", () => {
        const pending = new Map<string, boolean>();
        const blocked = queueVenueLinkVisible(pending, rows(), "INSTAGRAM", false);
        expect(blocked.body).toBeNull();
        expect(blocked.rows).toEqual(rows());
        expect(pending.size).toBe(0);
    });

    it("o select de visibilidade deixa so o que esta no link tree ou fora", () => {
        expect(shownPanelLinks(rows(), "", "on").map((row) => row.kind)).toEqual(["INSTAGRAM", "SITE"]);
        expect(shownPanelLinks(rows(), "", "off").map((row) => row.kind)).toEqual(["FACEBOOK", "PRESENTATION", "BUDGET_FORM", "RULES"]);
        expect(shownPanelLinks(rows(), "site", "on").map((row) => row.label)).toEqual(["Site"]);
    });

    it("video do tour fica no topo e o mapa no fim, sem trocar de lugar", () => {
        const placed = panelLinksFromHouse({
            links: [
                { kind: "INSTAGRAM", label: "Instagram", href: "https://instagram.com/ar756_" },
                { kind: "GOOGLE_MAPS", label: "Google Maps", href: "https://maps.example" },
            ],
            usedKinds: ["INSTAGRAM", "TOUR_VIDEO", "GOOGLE_MAPS", "SITE"],
        });
        expect(placed.map((row) => row.kind)).toEqual([
            "TOUR_VIDEO",
            "INSTAGRAM",
            "SITE",
            "PRESENTATION",
            "BUDGET_FORM",
            "RULES",
            "GOOGLE_MAPS",
        ]);
        expect(placed.find((row) => row.kind === "TOUR_VIDEO")).toMatchObject({ visible: false, created: true });
        expect(placed.find((row) => row.kind === "GOOGLE_MAPS")).toMatchObject({ visible: true, created: true });
        expect(applyPanelOrder(placed, "TOUR_VIDEO", "SITE").kinds).toBeNull();
        expect(applyPanelOrder(placed, "GOOGLE_MAPS", "INSTAGRAM").kinds).toBeNull();
        const moved = applyPanelOrder(placed, "SITE", "INSTAGRAM");
        expect(moved.kinds).toEqual(["TOUR_VIDEO", "SITE", "INSTAGRAM", "GOOGLE_MAPS"]);
        expect(moved.rows.map((row) => row.kind)[0]).toBe("TOUR_VIDEO");
        expect(moved.rows.map((row) => row.kind).at(-1)).toBe("GOOGLE_MAPS");
        expect(pinPanelLinks(placed)).toEqual(placed);

        const open = panelLinksFromHouse({
            links: [],
            usedKinds: [],
            tourVideoUrl: "https://www.youtube.com/watch?v=TfdZorJpR1I",
            mapQuery: "Rua A, 10",
        });
        expect(open.map((row) => row.kind)[0]).toBe("TOUR_VIDEO");
        expect(open.map((row) => row.kind).at(-1)).toBe("GOOGLE_MAPS");
        const tour = open.find((row) => row.kind === "TOUR_VIDEO");
        const map = open.find((row) => row.kind === "GOOGLE_MAPS");
        expect(tour).toMatchObject({ visible: true, created: false });
        expect(map).toMatchObject({ visible: true, created: false });
        expect(tour && linkTreeSave(tour, false)).toEqual({
            create: { kind: "TOUR_VIDEO", url: null, visible: false },
        });
        expect(map && linkTreeSave(map, false)).toEqual({
            create: { kind: "GOOGLE_MAPS", url: null, visible: false },
        });
    });

    it("arrastar troca a ordem dos links criados e ignora quem ainda nao existe", () => {
        const moved = applyPanelOrder(rows(), "FACEBOOK", "INSTAGRAM");
        expect(moved.kinds).toEqual(["FACEBOOK", "INSTAGRAM", "SITE"]);
        expect(moved.rows.map((row) => row.kind)).toEqual(["FACEBOOK", "INSTAGRAM", "SITE", "PRESENTATION", "BUDGET_FORM", "RULES"]);
        expect(applyPanelOrder(rows(), "INSTAGRAM", "INSTAGRAM").kinds).toBeNull();
        expect(applyPanelOrder(rows(), "PRESENTATION", "INSTAGRAM")).toEqual({ rows: rows(), kinds: null });
        expect(linkTreeCanDrag(true, "", "")).toBe(true);
        expect(linkTreeCanDrag(true, "face", "")).toBe(false);
        expect(linkTreeCanDrag(true, "", "on")).toBe(false);
        expect(linkTreeCanDrag(false, "", "")).toBe(false);
    });

    it("arrasta a ordem e nao oferece cadastro nem remocao", () => {
        const html = renderToStaticMarkup(
            <VenueLinkTreeView
                rows={rows()}
                query=""
                onQuery={() => undefined}
                canEdit
                onToggle={() => undefined}
                saveState="idle"
            />,
        );
        expect(html).toContain("Instagram");
        expect(html).toContain("Facebook");
        expect(html).toContain(">6<");
        expect(html).toContain(">2<");
        expect(html).toContain(">4<");
        expect(html).toContain("6 links");
        expect(html).toContain("Apresentação");
        expect(html).toContain("Fazer orçamento");
        expect(html).toContain("Regras");
        const instagram = html.slice(html.lastIndexOf("<tr", html.indexOf(">Instagram<")), html.indexOf("</tr>", html.indexOf(">Instagram<")));
        const facebook = html.slice(html.lastIndexOf("<tr", html.indexOf(">Facebook<")), html.indexOf("</tr>", html.indexOf(">Facebook<")));
        expect(instagram).toContain("bg-emerald-50");
        expect(instagram).toContain('data-state="checked"');
        expect(facebook).not.toContain("bg-emerald-50");
        expect(facebook).toContain('data-state="unchecked"');
        expect(html).toContain('draggable="true"');
        expect(html).toContain('aria-label="Arrastar Instagram"');
        expect(html).not.toContain("Cadastrar");
        expect(html).not.toContain("Remover");
        expect(html).not.toContain("Abrir link tree");
        expect(html).not.toContain("QR code");
        const withLink = renderToStaticMarkup(
            <VenueLinkTreeView
                rows={rows()}
                query=""
                onQuery={() => undefined}
                canEdit
                onToggle={() => undefined}
                saveState="idle"
                venueName="AR756"
            />,
        );
        expect(withLink).toContain("Abrir link tree");
        expect(withLink).toContain('href="https://event-hub-dashboard.vercel.app/espaco/AR756/links"');
        expect(withLink).toContain('target="_blank"');
        expect(withLink).toContain("QR code");
        const qr = renderToStaticMarkup(
            <LinkTreeQr url="https://event-hub-dashboard.vercel.app/espaco/AR756/links" />,
        );
        expect(qr).toContain('data-link="https://event-hub-dashboard.vercel.app/espaco/AR756/links"');
        expect(qr).toContain("<svg");
        const filtered = renderToStaticMarkup(
            <VenueLinkTreeView
                rows={rows()}
                query="face"
                onQuery={() => undefined}
                canEdit={false}
                onToggle={() => undefined}
                saveState="idle"
            />,
        );
        expect(filtered).toContain("Facebook");
        expect(filtered).not.toContain("Instagram");
        expect(filtered).toContain("disabled");
        expect(filtered).not.toContain('draggable="true"');
        const locked = renderToStaticMarkup(
            <VenueLinkTreeView
                rows={rows()}
                query=""
                onQuery={() => undefined}
                canEdit={false}
                onToggle={() => undefined}
                saveState="idle"
            />,
        );
        expect(locked).not.toContain('draggable="true"');
        expect(locked).not.toContain("Arrastar");
        const fixed = panelLinksFromHouse({
            links: [{ kind: "INSTAGRAM", label: "Instagram", href: "https://instagram.com/ar756_" }],
            usedKinds: ["TOUR_VIDEO", "INSTAGRAM", "GOOGLE_MAPS"],
            tourVideoUrl: "https://www.youtube.com/watch?v=TfdZorJpR1I",
            mapQuery: "Rua A, 10",
        });
        const pinned = renderToStaticMarkup(
            <VenueLinkTreeView
                rows={fixed}
                query=""
                onQuery={() => undefined}
                canEdit
                onToggle={() => undefined}
                saveState="idle"
            />,
        );
        expect(pinned).toContain('aria-label="Arrastar Instagram"');
        expect(pinned).not.toContain('aria-label="Arrastar Vídeo do tour"');
        expect(pinned).not.toContain('aria-label="Arrastar Google Maps"');
        expect(pinned).toContain('aria-label="Mostrar Vídeo do tour no link tree"');
        expect(pinned).toContain('aria-label="Mostrar Google Maps no link tree"');
        const tourAt = pinned.indexOf("Vídeo do tour");
        const instagramAt = pinned.indexOf(">Instagram<");
        const mapAt = pinned.indexOf(">Google Maps<");
        expect(tourAt).toBeLessThan(instagramAt);
        expect(instagramAt).toBeLessThan(mapAt);
    });

    it("a pagina so grava quando a fila devolve o corpo", () => {
        const source = readFileSync("src/pages/VenueLinkTree.tsx", "utf8");
        expect(source).toContain("if (!next.body) return;");
        expect(source).toContain("orderVenueLinks(id, kinds)");
        expect(source).toContain("setVenueLinkVisible(id, save.visible)");
        expect(source).toContain("createVenueLink(id, save.create)");
        expect(source).toContain("Permissions.EDIT_VENUE_SITE");
    });
});
