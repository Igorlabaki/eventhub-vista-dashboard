import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { venueSocialIcons, venueSocialLinks } from "./venue-social-icons";

const links = [
    { kind: "WHATSAPP", label: "WhatsApp", href: "https://wa.me/5511999999999" },
    { kind: "INSTAGRAM", label: "Instagram", href: "https://instagram.com/ar756_" },
    { kind: "FACEBOOK", label: "Facebook", href: "https://facebook.com/casa" },
    { kind: "RULES", label: "Regras", href: "https://event-hub-dashboard.vercel.app/espaco/AR756/regras" },
    { kind: "SITE", label: "Site", href: "https://ar756.com" },
];

const icons = {
    WHATSAPP: "wa",
    INSTAGRAM: "ig",
    FACEBOOK: "fb",
    TIKTOK: "tt",
    SITE: "site",
};

const surfaces = [
    "src/pages/VenuePresentation.tsx",
    "src/pages/ProposalView.tsx",
    "src/pages/ProposalForm.tsx",
    "src/components/proposal/PublicVenueListShell.tsx",
    "src/components/proposalFooter.tsx",
    "src/components/email-config/EmailTab.tsx",
    "src/components/organization/venue-web/VenuesList.tsx",
    "../guaeca-house-escapade/src/components/layout/Footer.tsx",
];

describe("icones de rede a partir da lista", () => {
    it("instagram, facebook, tiktok e site saem da lista", () => {
        expect(venueSocialIcons(links, icons).map((item) => [item.kind, item.href])).toEqual([
            ["WHATSAPP", "https://wa.me/5511999999999"],
            ["INSTAGRAM", "https://instagram.com/ar756_"],
            ["FACEBOOK", "https://facebook.com/casa"],
            ["SITE", "https://ar756.com"],
        ]);
    });

    it("link ausente nao entra e o whatsapp usa o href da lista", () => {
        const hidden = links.filter((link) => link.kind !== "TIKTOK" && link.kind !== "INSTAGRAM");
        const shown = venueSocialIcons(hidden, icons);
        expect(shown.map((item) => item.kind)).toEqual(["WHATSAPP", "FACEBOOK", "SITE"]);
        expect(shown[0]?.href).toBe("https://wa.me/5511999999999");
        expect(venueSocialLinks(undefined)).toEqual([]);
    });

    it("as superficies listadas nao montam o href pela coluna", () => {
        for (const file of surfaces) {
            const source = readFileSync(file, "utf8");
            expect(source, file).not.toMatch(/href[=:{][^;\n]*instagramUrl/);
            expect(source, file).not.toMatch(/href[=:{][^;\n]*facebookUrl/);
            expect(source, file).not.toMatch(/href[=:{][^;\n]*tiktokUrl/);
            expect(source, file).toMatch(/links/);
        }
        const presentation = readFileSync("src/pages/VenuePresentation.tsx", "utf8");
        const proposal = readFileSync("src/pages/ProposalView.tsx", "utf8");
        expect(presentation).toContain("resolveTourVideo(house.tourVideoUrl)");
        expect(proposal).toContain("resolveTourVideo(house.tourVideoUrl)");
        expect(proposal).toContain("resolveTourVideo(house?.tourVideoUrl)");
    });
});
