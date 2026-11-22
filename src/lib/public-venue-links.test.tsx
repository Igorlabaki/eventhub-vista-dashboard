import { readFileSync } from "fs";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { LinkTreeQr, LinkTreeShareActions } from "@/components/venue/LinkTreeShareActions";
import { PUBLIC_ROUTES as axiosPublicRoutes } from "@/lib/axios";
import { PUBLIC_ROUTES as bootstrapPublicRoutes } from "@/hooks/useBootstrapUser";
import { presentNavItems, venueSections } from "@/components/sidebar/sidebar-nav-model";
import { HostVenueLinks } from "@/pages/HostVenueLinks";
import { Permissions } from "@/types/permissions";
import { venueLinkHref } from "./venue-link";
import {
    PUBLIC_VENUE_LINKS_ALIAS,
    PUBLIC_VENUE_LINKS_HOST_PATH,
    PUBLIC_VENUE_LINKS_PATTERN,
    publicVenueLinksShareUrl,
    shouldResolvePublicLinksHost,
} from "./public-venue-links";

describe("link tree publico", () => {
    it("abre pelo nome na base de producao e entra nas allowlists", () => {
        expect(publicVenueLinksShareUrl("AR756")).toBe(
            "https://event-hub-dashboard.vercel.app/espaco/AR756/links",
        );
        expect(publicVenueLinksShareUrl("AR756")).not.toContain("localhost");
        expect(axiosPublicRoutes).toContain(PUBLIC_VENUE_LINKS_PATTERN);
        expect(axiosPublicRoutes).toContain(PUBLIC_VENUE_LINKS_ALIAS);
        expect(axiosPublicRoutes).toContain(PUBLIC_VENUE_LINKS_HOST_PATH);
        expect(bootstrapPublicRoutes).toContain(PUBLIC_VENUE_LINKS_PATTERN);
        expect(bootstrapPublicRoutes).toContain(PUBLIC_VENUE_LINKS_ALIAS);
        expect(bootstrapPublicRoutes).toContain(PUBLIC_VENUE_LINKS_HOST_PATH);
        const app = readFileSync("src/App.tsx", "utf8");
        expect(app).toContain('path="/espaco/:id/links"');
        expect(app).toContain('path="/venue/:id/links"');
        expect(app).toContain('path="/links"');
    });

    it("sem dominio, abrir e QR ficam no host padrao; com dominio ativo, usam /links", () => {
        expect(publicVenueLinksShareUrl("Casa")).toBe(
            "https://event-hub-dashboard.vercel.app/espaco/Casa/links",
        );
        expect(publicVenueLinksShareUrl("Casa", "www.casa.com")).toBe("https://www.casa.com/links");
        const open = renderToStaticMarkup(<LinkTreeShareActions venueName="Casa" activeHost="www.casa.com" />);
        expect(open).toContain('href="https://www.casa.com/links"');
        const qr = renderToStaticMarkup(<LinkTreeQr url={publicVenueLinksShareUrl("Casa", "www.casa.com")} />);
        expect(qr).toContain('data-link="https://www.casa.com/links"');
        expect(venueLinkHref("Casa", { kind: "PRESENTATION", url: null, visible: true, position: 0 }, {})).toBe(
            "https://event-hub-dashboard.vercel.app/espaco/Casa/apresentacao",
        );
        expect(venueLinkHref("Casa", { kind: "BUDGET_FORM", url: null, visible: true, position: 0 }, {})).toBe(
            "https://event-hub-dashboard.vercel.app/espaco/Casa/formulario",
        );
        expect(venueLinkHref("Casa", { kind: "RULES", url: null, visible: true, position: 0 }, {})).toBe(
            "https://event-hub-dashboard.vercel.app/espaco/Casa/regras",
        );
    });

    it("no host padrao, /links nao resolve uma casa", () => {
        expect(shouldResolvePublicLinksHost("localhost")).toBe(false);
        expect(shouldResolvePublicLinksHost("event-hub-dashboard.vercel.app")).toBe(false);
        expect(shouldResolvePublicLinksHost("preview.vercel.app")).toBe(false);
        expect(shouldResolvePublicLinksHost("www.casa.com")).toBe(true);
        const html = renderToStaticMarkup(<HostVenueLinks hostname="localhost" />);
        expect(html).toContain("não abre um espaço");
        expect(html).not.toContain("Casa");
    });

    it("coloca o item na secao A casa, na mesma permissao do site, abrindo a tela do painel", () => {
        const item = venueSections.flatMap((section) => section.items).find((entry) => entry.title === "Link tree");
        const icon = () => null;
        expect(item?.permission).toBe(Permissions.VIEW_VENUE_SITES);
        expect(item?.opensExternalUrl).toBeUndefined();
        expect(presentNavItems([item!], "/venue/venue-1", { "Link tree": icon }, () => publicVenueLinksShareUrl("AR756"))).toEqual([
            { title: "Link tree", href: "/venue/venue-1/link-tree", icon },
        ]);
    });
});
