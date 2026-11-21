import { readFileSync } from "fs";
import { describe, expect, it } from "vitest";
import { PUBLIC_ROUTES as axiosPublicRoutes } from "@/lib/axios";
import { PUBLIC_ROUTES as bootstrapPublicRoutes } from "@/hooks/useBootstrapUser";
import { presentNavItems, venueSections } from "@/components/sidebar/sidebar-nav-model";
import { Permissions } from "@/types/permissions";
import {
    PUBLIC_VENUE_LINKS_ALIAS,
    PUBLIC_VENUE_LINKS_PATTERN,
    publicVenueLinksShareUrl,
} from "./public-venue-links";

describe("link tree publico", () => {
    it("abre pelo nome na base de producao e entra nas allowlists", () => {
        expect(publicVenueLinksShareUrl("AR756")).toBe(
            "https://event-hub-dashboard.vercel.app/espaco/AR756/links",
        );
        expect(publicVenueLinksShareUrl("AR756")).not.toContain("localhost");
        expect(axiosPublicRoutes).toContain(PUBLIC_VENUE_LINKS_PATTERN);
        expect(axiosPublicRoutes).toContain(PUBLIC_VENUE_LINKS_ALIAS);
        expect(bootstrapPublicRoutes).toContain(PUBLIC_VENUE_LINKS_PATTERN);
        expect(bootstrapPublicRoutes).toContain(PUBLIC_VENUE_LINKS_ALIAS);
        const app = readFileSync("src/App.tsx", "utf8");
        expect(app).toContain('path="/espaco/:id/links"');
        expect(app).toContain('path="/venue/:id/links"');
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
