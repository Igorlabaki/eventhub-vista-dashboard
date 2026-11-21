import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { VenueLinksView, CreateLinkError, blockDraggedClick, commitLinkChange, hideConfirmedLink, moveLinkBefore, RemoveLinkPrompt } from "./VenueLinks";
import type { PublicVenueLinks } from "@/services/venue.service";

function house(overrides: Partial<PublicVenueLinks> = {}): PublicVenueLinks {
    return {
        name: "AR756",
        logoUrl: "https://cdn.example/ar756.png",
        slogan: "O OASIS URBANO",
        proposalPrimaryColor: "#111315",
        proposalSecondaryColor: "#111111",
        proposalTextColor: "#f7f7f5",
        canReorder: false,
        links: [
            { kind: "PRESENTATION", label: "Apresentação", subtitle: "Conheça o espaço", href: "https://event-hub-dashboard.vercel.app/espaco/AR756/apresentacao" },
            { kind: "WHATSAPP", label: "WhatsApp", subtitle: "Fale pelo WhatsApp", href: "https://wa.me/5511999999999" },
            { kind: "EMAIL", label: "E-mail", subtitle: "Envie um e-mail", href: "mailto:ar756@example.com" },
        ],
        ...overrides,
    };
}

describe("pagina publica de links", () => {
    it("mostra logo e slogan sem repetir o nome", () => {
        const html = renderToStaticMarkup(<VenueLinksView house={house()} />);

        expect(html).toContain('alt="Logo AR756"');
        expect(html).toContain("O OASIS URBANO");
        expect(html).not.toContain("<h1");
        expect(html).not.toContain(">AR756<");
    });

    it("pinta o card com a cor secundaria e a letra com a cor do texto", () => {
        const html = renderToStaticMarkup(<VenueLinksView house={house()} />);

        expect(html).toContain("rounded-xl");
        expect(html).not.toContain("rounded-full");
        expect(html).toContain("<footer");
        expect(html).toContain("Siga nas redes sociais:");
        expect(html).toContain("background-color:#111111");
        expect(html).toContain("color:#f7f7f5");
        expect(html).not.toContain("background-color:#f7f7f5");
        expect(html).toContain("Apresentação");
        expect(html).toContain("WhatsApp");
        expect(html).toContain("mt-6 block text-left");
        expect(html).toContain("<svg");
        expect(html).toContain('href="mailto:ar756@example.com"');
        const mail = html.slice(html.indexOf('href="mailto:'));
        expect(mail.slice(0, mail.indexOf(">"))).not.toContain("target");
        expect(html).toContain('target="_blank"');
    });

    it("sem logo usa a marca EventHub e sem links nao abre a lista", () => {
        const html = renderToStaticMarkup(
            <VenueLinksView house={house({ logoUrl: null, links: [], slogan: "   " })} />,
        );

        expect(html).toContain("EventHub");
        expect(html).not.toContain(">AR756<");
        expect(html).not.toContain("<ul");
        expect(html).not.toContain("<footer");
        expect(html).not.toContain("O OASIS URBANO");
        expect(html).not.toContain("Ainda não há link cadastrado na sua link tree");
        expect(html).not.toContain("Cadastrar link");
    });

    it("mostra o mapa e o video do tour como na apresentacao", () => {
        const html = renderToStaticMarkup(
            <VenueLinksView
                house={house({
                    mapLabel: "Vila Prudente — Sao Paulo",
                    mapQuery: "Avenida Alberto Ramos, 756, Vila Prudente, Sao Paulo, SP",
                    tourVideoUrl: "https://www.youtube.com/watch?v=TfdZorJpR1I",
                })}
            />,
        );

        expect(html).toContain("Vila Prudente — Sao Paulo");
        expect(html).toContain('aria-label="Abrir a localização no Google Maps"');
        expect(html).toContain("Mapa de AR756");
        expect(html).toContain("maps.google.com/maps?q=Avenida%20Alberto%20Ramos");
        expect(html).toContain('title="Tour do espaço"');
        expect(html).toContain("youtube.com/embed/TfdZorJpR1I");
        const video = html.indexOf("youtube.com/embed/TfdZorJpR1I");
        const list = html.indexOf("<ul");
        const map = html.indexOf("Mapa de AR756");
        expect(video).toBeLessThan(list);
        expect(list).toBeLessThan(map);
    });

    it("video e mapa nao entram na lista, mesmo quando o link existe", () => {
        const html = renderToStaticMarkup(
            <VenueLinksView
                house={house({
                    mapLabel: "Vila Prudente — Sao Paulo",
                    mapQuery: "Avenida Alberto Ramos, 756, Vila Prudente, Sao Paulo, SP",
                    tourVideoUrl: "https://www.youtube.com/watch?v=TfdZorJpR1I",
                    links: [
                        ...house().links,
                        { kind: "TOUR_VIDEO", label: "Vídeo do tour", href: "https://www.youtube.com/watch?v=TfdZorJpR1I" },
                        { kind: "GOOGLE_MAPS", label: "Google Maps", href: "https://www.google.com/maps/search/?api=1&query=Rua" },
                    ],
                })}
            />,
        );
        expect(html).toContain("youtube.com/embed/TfdZorJpR1I");
        expect(html).toContain("Mapa de AR756");
        expect(html).not.toContain(">Vídeo do tour<");
        expect(html).not.toContain(">Google Maps<");
        expect(html).toContain("Apresentação");
    });

    it("mostra o subtitulo embaixo do titulo e esconde alca e remover de quem visita", () => {
        const html = renderToStaticMarkup(<VenueLinksView house={house()} />);
        const title = html.indexOf("Apresentação");
        const subtitle = html.indexOf("Conheça o espaço");
        expect(subtitle).toBeGreaterThan(title);
        expect(html).not.toContain("Arrastar link");
        expect(html).not.toContain("Remover Apresentação");
    });

    it("o dono tambem nao ve cadastrar, alca nem remover", () => {
        const html = renderToStaticMarkup(
            <VenueLinksView house={house({ canReorder: true, links: [house().links[0]!] })} />,
        );
        expect(html).toContain("Apresentação");
        expect(html).toContain("Conheça o espaço");
        expect(html).toContain("<svg");
        expect(html).not.toContain('aria-label="Remover Apresentação"');
        expect(html).not.toContain("Cadastrar link");
        expect(html).not.toContain("Arrastar link");
        expect(html).not.toContain('draggable="true"');
    });

    it("com mais de um botao o dono tambem nao arrasta", () => {
        const html = renderToStaticMarkup(<VenueLinksView house={house({ canReorder: true })} />);
        expect(html).not.toContain("Arrastar link");
        expect(html).not.toContain('draggable="true"');
        expect(html).not.toContain("Remover Apresentação");
        expect(html).not.toContain("Cadastrar link");
        const flag = { current: true };
        expect(blockDraggedClick(flag)).toBe(true);
        expect(flag.current).toBe(false);
        expect(blockDraggedClick(flag)).toBe(false);
        const moved = moveLinkBefore(house().links, "WHATSAPP", "PRESENTATION");
        expect(moved.map((link) => link.kind)).toEqual(["WHATSAPP", "PRESENTATION", "EMAIL"]);
    });

    it("cancelar nao oculta, confirmar tira o botao e a falha devolve", async () => {
        const links = house().links;
        const request = async () => links.filter((link) => link.kind !== "EMAIL");
        const cancelled = await hideConfirmedLink(links, "EMAIL", false, request);
        expect(cancelled.called).toBe(false);
        expect(cancelled.links).toHaveLength(3);
        const confirmed = await hideConfirmedLink(links, "EMAIL", true, request);
        expect(confirmed.called).toBe(true);
        expect(confirmed.links.map((link) => link.kind)).toEqual(["PRESENTATION", "WHATSAPP"]);
        const failed = await hideConfirmedLink(links, "EMAIL", true, async () => {
            throw new Error("rede");
        });
        expect(failed.failed).toBe(true);
        expect(failed.links).toEqual(links);
        expect(renderToStaticMarkup(<RemoveLinkPrompt label="Instagram" />)).toContain("Tem certeza que quer remover?");
        expect(renderToStaticMarkup(<RemoveLinkPrompt label="Instagram" />)).toContain("Instagram deixa de aparecer nesta página.");
    });

    it("lista vazia abre sem lista e sem chamada para cadastrar", () => {
        const html = renderToStaticMarkup(
            <VenueLinksView house={house({ canReorder: true, links: [] })} />,
        );
        expect(html).not.toContain("Ainda não há link cadastrado na sua link tree");
        expect(html).not.toContain("Cadastrar link");
        expect(html).not.toContain("<ul");
    });

    it("visitante e dono veem o card e nenhum controle", () => {
        const owner = renderToStaticMarkup(<VenueLinksView house={house({ canReorder: true })} />);
        const guest = renderToStaticMarkup(<VenueLinksView house={house()} />);
        for (const html of [owner, guest]) {
            expect(html).toContain("Apresentação");
            expect(html).toContain("Conheça o espaço");
            expect(html).toContain("<svg");
            expect(html).not.toContain("Cadastrar link");
            expect(html).not.toContain("Arrastar link");
            expect(html).not.toContain("Remover Apresentação");
        }
    });

    it("falha do create devolve a lista e a mensagem", async () => {
        const previous = { links: house().links, usedKinds: ["PRESENTATION"] };
        const saved = await commitLinkChange(previous, async () => ({
            links: [house().links[0]!],
            usedKinds: ["PRESENTATION", "INSTAGRAM"],
        }));
        expect(saved.failed).toBe(false);
        expect(saved.value.usedKinds).toEqual(["PRESENTATION", "INSTAGRAM"]);
        const failed = await commitLinkChange(previous, async () => {
            throw { response: { data: { message: "Essa rede ja existe." } } };
        });
        expect(failed.value).toBe(previous);
        expect(failed.message).toBe("Essa rede ja existe.");
        expect(renderToStaticMarkup(<CreateLinkError message={failed.message} />)).toContain("Essa rede ja existe.");
    });

    it("mantem o titulo da aba com o nome e o slogan", () => {
        const source = readFileSync(resolve(process.cwd(), "src/pages/VenueLinks.tsx"), "utf8");
        expect(source).toContain("venueTabTitle(house.name, house.slogan)");
    });
});
