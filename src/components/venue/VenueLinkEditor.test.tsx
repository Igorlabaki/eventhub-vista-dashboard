import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { VenueLinkCreateForm, VenueLinkEditor, VenueLinkUrlForm, submitVenueLinkDraft } from "./VenueLinkEditor";
import {
    createVenueLink,
    isPastedVenueLink,
    remainingVenueLinkKinds,
    reorderVenueLinks,
    replaceVenueLinkUrl,
    VENUE_LINK_KINDS,
    venueLinkSummary,
    venueLinkView,
    type EditorVenueLink,
} from "@/lib/venue-link";

function link(partial: Partial<EditorVenueLink> & Pick<EditorVenueLink, "kind" | "position">): EditorVenueLink {
    return {
        url: null,
        visible: false,
        label: partial.kind,
        hint: null,
        ...partial,
    };
}

const rows = [
    link({ kind: "PRESENTATION", position: 0, visible: true, label: "Apresentação" }),
    link({ kind: "INSTAGRAM", position: 1, label: "Instagram", url: "https://facebook.com/casa" }),
    link({ kind: "WHATSAPP", position: 2, label: "WhatsApp", hint: "Preencha o WhatsApp em Geral." }),
];

describe("aba Redes no desenho de contatos", () => {
    it("mostra faixa, KPIs, contador e tabela sem Subir e Descer", () => {
        const html = renderToStaticMarkup(<VenueLinkEditor rows={rows} onChange={() => undefined} />);

        expect(html).toContain("Buscar redes...");
        expect(html).toContain("Cadastrar link");
        expect(html).not.toContain("QR code");
        expect(html).not.toContain("Escolher rede");
        expect(html).toContain("Ocultas");
        expect(html).not.toContain("bg-emerald-50");
        expect(html).toContain("hover:bg-accent");
        expect(html).toContain("Total");
        expect(html).toContain("No link tree");
        expect(html).toContain("Com link");
        expect(html).toContain(">1<");
        expect(html).toContain(">0<");
        expect(html).toContain("1 redes");
        expect(html).not.toContain("Apresentação");
        expect(html).not.toContain("WhatsApp");
        expect(html).toContain("Instagram");
        expect(html).not.toContain("draggable");
        expect(html).not.toContain("Arrastar");
        expect(html).not.toContain("Esse link não é do Instagram.");
        expect(html).not.toContain("created");
        expect(html).not.toContain('id="venue-link-url"');
        expect(html).not.toContain("—");
        expect(html).toContain('aria-label="Remover Instagram"');
        expect(html).not.toContain('aria-label="Remover Apresentação"');
        expect(html).toContain('aria-label="Editar URL de Instagram"');
        expect(html).not.toContain('aria-label="Editar URL de Apresentação"');
        expect(html).not.toContain('aria-label="Ocultar Apresentação"');
        expect(html).not.toContain('aria-label="Mostrar WhatsApp"');
        expect(html).not.toContain("Mostrar no link tree");
        expect(html).not.toContain("Subir");
        expect(html).not.toContain("Descer");
    });

    it("na faixa de filtros, o qr code aponta para o link tree do espaco", () => {
        const html = renderToStaticMarkup(<VenueLinkEditor rows={rows} onChange={() => undefined} name="AR756" />);
        expect(html).toContain("QR code");
        expect(html).toContain('href="https://event-hub-dashboard.vercel.app/espaco/AR756/links"');
        expect(html).toContain('target="_blank"');
    });

    it("escolher uma rede colada pede a URL e so entra se estiver verde", () => {
        const only = [link({ kind: "INSTAGRAM", position: 0, label: "Instagram", url: "https://instagram.com/ar756_", visible: true })];
        const html = renderToStaticMarkup(<VenueLinkEditor rows={only} onChange={() => undefined} />);
        const form = renderToStaticMarkup(
            <VenueLinkCreateForm
                kinds={remainingVenueLinkKinds(only)}
                kind="INSTAGRAM"
                url=""
                onKind={() => undefined}
                onUrl={() => undefined}
                onCancel={() => undefined}
                onConfirm={() => undefined}
            />,
        );
        expect(form).toContain('id="venue-link-url"');
        const offered = remainingVenueLinkKinds(only).filter((kind) => isPastedVenueLink(kind));
        const system = renderToStaticMarkup(
            <VenueLinkCreateForm
                kinds={offered}
                kind=""
                url=""
                onKind={() => undefined}
                onUrl={() => undefined}
                onCancel={() => undefined}
                onConfirm={() => undefined}
            />,
        );
        expect(system).not.toContain('id="venue-link-url"');
        expect(system).not.toContain(">Apresentação</option>");
        expect(system).not.toContain(">WhatsApp</option>");
        expect(system).not.toContain(">Regras</option>");
        expect(system).not.toContain(">Vídeo do tour</option>");
        expect(system).toContain(">Facebook</option>");
        expect(system).not.toContain(">Instagram</option>");
        expect(html).not.toContain("bg-emerald-50");

        const hidden = [link({ kind: "INSTAGRAM", position: 0, label: "Instagram", url: "https://instagram.com/ar756_", visible: false })];
        const white = renderToStaticMarkup(<VenueLinkEditor rows={hidden} onChange={() => undefined} />);
        expect(white).not.toContain("bg-emerald-50");

        expect(createVenueLink(only, "INSTAGRAM", "https://instagram.com/p/abc", "AR756", {})).toBe(only);
        expect(createVenueLink([], "INSTAGRAM", "", "AR756", {})).toEqual([]);
        const created = createVenueLink([], "INSTAGRAM", "instagram.com/casa", "AR756", {});
        expect(created[0]?.url).toContain("instagram.com/casa");
        const shown = renderToStaticMarkup(
            <VenueLinkEditor
                rows={created.map((row) => link({ ...row, label: "Instagram" }))}
                onChange={() => undefined}
            />,
        );
        expect(shown).not.toContain("bg-emerald-50");
        expect(shown).not.toContain(">Instagram</option>");
    });

    it("apresentacao entra sem modal e WhatsApp sem numero fica branco", () => {
        const presentation = createVenueLink([], "PRESENTATION", null, "AR756", {});
        expect(presentation[0]).toMatchObject({ url: "created", visible: true });
        const html = renderToStaticMarkup(
            <VenueLinkEditor
                rows={presentation.map((row) => link({ ...row, label: "Apresentação", hint: null }))}
                onChange={() => undefined}
            />,
        );
        expect(html).not.toContain("bg-emerald-50");
        expect(html).not.toContain("created");
        expect(html).not.toContain("Apresentação");
        expect(html).toContain("Nenhuma rede criada");
        expect(html).not.toContain('aria-label="Editar URL de Apresentação"');

        const whatsapp = createVenueLink([], "WHATSAPP", null, "AR756", {});
        expect(whatsapp[0]).toMatchObject({ visible: false });
        const quiet = renderToStaticMarkup(
            <VenueLinkEditor
                rows={whatsapp.map((row) => link({ ...row, label: "WhatsApp", hint: "Preencha o WhatsApp em Geral." }))}
                onChange={() => undefined}
            />,
        );
        expect(quiet).not.toContain("bg-emerald-50");
        expect(quiet).not.toContain("WhatsApp");
        expect(quiet).toContain("Nenhuma rede criada");
    });

    it("o lapis abre o modal e uma URL ruim nao troca a anterior", () => {
        const current = [link({ kind: "INSTAGRAM", position: 0, label: "Instagram", url: "https://instagram.com/ar756_", visible: true })];
        const blocked = replaceVenueLinkUrl(current, "INSTAGRAM", "https://instagram.com/p/abc");
        expect(blocked).toBe(current);
        const saved = replaceVenueLinkUrl(current, "INSTAGRAM", "https://instagram.com/casa");
        expect(saved[0]?.url).toContain("instagram.com/casa");
        expect(current[0]?.url).toContain("ar756_");

        const form = renderToStaticMarkup(
            <VenueLinkUrlForm
                modal={{ mode: "edit", kind: "INSTAGRAM", url: "https://instagram.com/p/abc" }}
                onUrl={() => undefined}
                onCancel={() => undefined}
                onConfirm={() => undefined}
            />,
        );
        expect(form).toContain("Editar Instagram");
        expect(form).toContain("Parece um post");
        expect(form).toContain("<button type=\"button\" disabled=\"\">Salvar</button>");
        const ready = renderToStaticMarkup(
            <VenueLinkCreateForm
                kinds={["INSTAGRAM"]}
                kind="INSTAGRAM"
                url="instagram.com/casa"
                onKind={() => undefined}
                onUrl={() => undefined}
                onCancel={() => undefined}
                onConfirm={() => undefined}
            />,
        );
        expect(ready).toContain("Cadastrar link");
        expect(ready).toContain("Link do Instagram reconhecido.");
        expect(ready).toContain("<button type=\"button\">Cadastrar link</button>");
        const drafted = submitVenueLinkDraft([], "INSTAGRAM", "instagram.com/casa", "AR756", {}, true);
        expect(drafted).toHaveLength(1);
        expect(drafted[0]).toMatchObject({ visible: true, url: expect.stringContaining("instagram.com/casa") });
        const hidden = submitVenueLinkDraft([], "INSTAGRAM", "instagram.com/casa", "AR756", {}, false);
        expect(hidden[0]).toMatchObject({ visible: false });
        const asked = renderToStaticMarkup(
            <VenueLinkCreateForm
                kinds={["INSTAGRAM"]}
                kind="INSTAGRAM"
                url="instagram.com/casa"
                visible={false}
                onKind={() => undefined}
                onUrl={() => undefined}
                onVisible={() => undefined}
                onCancel={() => undefined}
                onConfirm={() => undefined}
            />,
        );
        expect(asked).toContain('aria-label="Mostrar no link tree"');
        expect(asked).not.toContain('checked=""');
        expect(submitVenueLinkDraft(drafted, "INSTAGRAM", "instagram.com/casa", "AR756", {})).toBe(drafted);
    });

    it("nenhuma rede criada explica a lista vazia", () => {
        const html = renderToStaticMarkup(<VenueLinkEditor rows={[]} onChange={() => undefined} />);
        expect(html).toContain("Nenhuma rede criada");
        expect(html).toContain("Cadastrar link");
        expect(html).not.toContain("disabled=\"\">Cadastrar link</button>");
        const full = VENUE_LINK_KINDS.map((kind, position) => link({ kind, position, label: kind }));
        const blocked = renderToStaticMarkup(<VenueLinkEditor rows={full} onChange={() => undefined} />);
        expect(blocked).toContain("disabled=\"\">Cadastrar link</button>");
    });

    it("KPIs ficam na lista inteira e o contador acompanha o recorte", () => {
        const hidden = venueLinkView(rows, "", "hidden");
        expect(venueLinkSummary(rows)).toEqual({ total: 3, onTree: 1, withLink: 0 });
        expect(venueLinkSummary(hidden.shown)).not.toEqual(venueLinkSummary(rows));
        expect(hidden.shown.map((row) => row.kind)).toEqual(["INSTAGRAM", "WHATSAPP"]);
        expect(hidden.dragEnabled).toBe(false);

        const search = venueLinkView(rows, "insta", "all");
        expect(search.shown.map((row) => row.label)).toEqual(["Instagram"]);
        expect(search.dragEnabled).toBe(false);
        expect(venueLinkSummary(rows).total).toBe(3);
    });

    it("soltar uma linha acima de outra regrava a posicao e o mesmo indice nao duplica", () => {
        const moved = reorderVenueLinks(rows, 1, 0);
        expect(moved.map((row) => row.kind)).toEqual(["INSTAGRAM", "PRESENTATION", "WHATSAPP"]);
        expect(moved.map((row) => row.position)).toEqual([0, 1, 2]);
        expect(reorderVenueLinks(rows, 1, 1)).toBe(rows);
    });
});
