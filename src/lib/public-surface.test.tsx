import { readFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { VenueLinksView } from "@/pages/VenueLinks";
import type { PublicVenueLinks } from "@/services/venue.service";
import {
    countedCardHref,
    dispatchPublicSurfaceBeacon,
    readVisitorId,
    saoPauloMonthStart,
    type PublicSurfaceTransport,
    visitorCookie,
} from "./public-surface";

const VISITOR = "11111111-1111-4111-8111-111111111111";
const API = "https://api.example";

function house(): PublicVenueLinks {
    return {
        name: "AR756",
        logoUrl: "https://cdn.example/ar756.png",
        slogan: "Casa",
        proposalPrimaryColor: "#111315",
        proposalSecondaryColor: "#111111",
        proposalTextColor: "#f7f7f5",
        canReorder: false,
        links: [
            { kind: "EMAIL", label: "E-mail", subtitle: "Envie um e-mail", href: "mailto:casa@example.com" },
            { kind: "WHATSAPP", label: "WhatsApp", subtitle: "Fale pelo WhatsApp", href: "https://wa.me/5511999999999" },
            { kind: "BUDGET_FORM", label: "Fazer orçamento", subtitle: "Peça um orçamento", href: "https://event-hub-dashboard.vercel.app/espaco/AR756/formulario" },
        ],
    };
}

function transport(jar = "", sticky = true): PublicSurfaceTransport & { bodies: string[]; jar: string } {
    const state = { jar, bodies: [] as string[] };
    const value: PublicSurfaceTransport & { bodies: string[]; jar: string } = {
        apiBase: API,
        now: new Date("2026-11-20T15:00:00.000Z"),
        secure: true,
        randomId: VISITOR,
        sent: new Set<string>(),
        bodies: state.bodies,
        get jar() { return state.jar; },
        readCookie: () => state.jar,
        writeCookie: (cookie) => {
            if (sticky) state.jar = cookie;
        },
        send: (_url, body) => { state.bodies.push(body); },
    };
    return value;
}

describe("coleta publica", () => {
    it("envia um beacon por carga pronta e ignora o refetch", () => {
        const link = transport();
        const first = dispatchPublicSurfaceBeacon("LINKS", "AR756", link);
        const second = dispatchPublicSurfaceBeacon("LINKS", "AR756", link);
        expect(first.sent).toBe(true);
        expect(second.sent).toBe(false);
        expect(link.bodies).toEqual([JSON.stringify({ surface: "LINKS", visitorKey: VISITOR })]);
        expect(link.send).toBeTypeOf("function");
    });

    it("reaproveita o mesmo cookie na recarga e segue sem chave se o cookie falhar", () => {
        const saved = visitorCookie(VISITOR, new Date("2026-11-20T15:00:00.000Z"), true);
        expect(saved).toContain("Secure");
        expect(saved).toContain("SameSite=Lax");
        expect(saved).toContain("Path=/");
        expect(saved).toContain(`Expires=${saoPauloMonthStart(2026, 12).toUTCString()}`);
        const reloaded = transport(saved);
        reloaded.randomId = "22222222-2222-4222-8222-222222222222";
        dispatchPublicSurfaceBeacon("LINKS", "AR756", reloaded);
        expect(JSON.parse(reloaded.bodies[0]!).visitorKey).toBe(VISITOR);

        const blocked = transport("", false);
        dispatchPublicSurfaceBeacon("LINKS", "AR756", blocked);
        expect(JSON.parse(blocked.bodies[0]!)).toEqual({ surface: "LINKS" });
        expect(readVisitorId(blocked.jar)).toBeNull();
    });

    it("conta o formulario resolvido sem a chave e separa o dominio", () => {
        const form = transport(`eh_vid=${VISITOR}`);
        dispatchPublicSurfaceBeacon("FORM", "venue-1", form);
        dispatchPublicSurfaceBeacon("FORM", "venue-1", form);
        expect(form.bodies).toEqual([JSON.stringify({ surface: "FORM" })]);
        const domain = transport();
        dispatchPublicSurfaceBeacon("LINKS", "Casa Aurora", domain);
        expect(domain.bodies).toHaveLength(1);
        expect(countedCardHref(API, "Casa Aurora", "BUDGET_FORM")).toBe(
            `${API}/venue/links/Casa%20Aurora/go/BUDGET_FORM`,
        );
    });

    it("troca o href dos cards e preserva o e-mail e o rodape", () => {
        const html = renderToStaticMarkup(
            <VenueLinksView house={house()} cardHref={(kind) => countedCardHref(API, "AR756", kind)} />,
        );
        expect(html).toContain(`href="${API}/venue/links/AR756/go/EMAIL"`);
        expect(html).toContain(`href="${API}/venue/links/AR756/go/WHATSAPP"`);
        expect(html).toContain(`href="${API}/venue/links/AR756/go/BUDGET_FORM"`);
        const mail = html.slice(html.indexOf('href="https://api.example/venue/links/AR756/go/EMAIL"'));
        expect(mail.slice(0, mail.indexOf(">"))).not.toContain("target");
        expect(html).toContain('href="https://wa.me/5511999999999"');
        expect(html).not.toContain("mailto:casa@example.com");
        const app = readFileSync("src/App.tsx", "utf8");
        const form = readFileSync("src/pages/ProposalForm.tsx", "utf8");
        const host = readFileSync("src/pages/HostVenueLinks.tsx", "utf8");
        expect(app).toContain('path="/espaco/:id/formulario"');
        expect(app).toContain('path="/venue/:id/form"');
        expect(form).toContain('dispatchPublicSurfaceBeacon("FORM", resolvedVenueId');
        expect(host).toContain("<VenueLinks venueKey={venueName} />");
        expect(readFileSync("src/pages/VenuePresentation.tsx", "utf8")).toContain("formulario");
    });
});
