import { describe, expect, it } from "vitest";
import {
    canShowVenueLink,
    checkVenueLinkUrl,
    moveVenueLink,
    createdVenueLinks,
    remainingVenueLinkKinds,
    venueLinkSaveError,
    withoutVenueLinkColumns,
    type EditorVenueLink,
} from "./venue-link";

const row = (partial: Partial<EditorVenueLink> & Pick<EditorVenueLink, "kind" | "position">): EditorVenueLink => ({
    url: null,
    visible: false,
    label: partial.kind,
    hint: null,
    ...partial,
});

describe("checagem do link na aba Redes", () => {
    it("reconhece o Instagram e recusa o Facebook no mesmo campo", () => {
        expect(checkVenueLinkUrl("INSTAGRAM", "instagram.com/ar756_").status).toBe("green");
        expect(checkVenueLinkUrl("INSTAGRAM", "instagram.com/ar756_").href).toMatch(/^https:\/\//);
        expect(venueLinkSaveError([{ kind: "INSTAGRAM", url: "https://facebook.com/casa" }])).toMatch(/Instagram/);
    });

    it("aceita o perfil numerico do Facebook e separa video de canal", () => {
        expect(checkVenueLinkUrl("FACEBOOK", "https://www.facebook.com/profile.php?id=100085832906065").status).toBe("green");
        expect(checkVenueLinkUrl("YOUTUBE", "https://www.youtube.com/@ar756").status).toBe("green");
        expect(checkVenueLinkUrl("YOUTUBE", "https://youtu.be/TfdZorJpR1I").status).toBe("amber");
    });

    it("tira do seletor a rede ja colocada", () => {
        expect(remainingVenueLinkKinds([{ kind: "INSTAGRAM" }])).not.toContain("INSTAGRAM");
        expect(remainingVenueLinkKinds([])).toContain("INSTAGRAM");
        expect(remainingVenueLinkKinds([])).toContain("PRESENTATION");
        expect(createdVenueLinks([
            row({ kind: "PRESENTATION", position: 0 }),
            row({ kind: "INSTAGRAM", position: 1, url: "https://instagram.com/ar756_" }),
        ]).map((item) => item.kind)).toEqual(["INSTAGRAM"]);
    });

    it("sobe e desce sem sair da lista", () => {
        const rows = [row({ kind: "SITE", position: 0 }), row({ kind: "INSTAGRAM", position: 1 })];
        expect(moveVenueLink(rows, 1, -1).map((item) => item.kind)).toEqual(["INSTAGRAM", "SITE"]);
        expect(moveVenueLink(rows, 0, -1)).toBe(rows);
    });

    it("nao liga o olho quando a origem esta vazia ou o link nao e verde", () => {
        expect(canShowVenueLink(row({ kind: "WHATSAPP", position: 0, hint: "Preencha o WhatsApp em Geral." }))).toBe(false);
        expect(canShowVenueLink(row({ kind: "INSTAGRAM", position: 0, url: "https://facebook.com/casa" }))).toBe(false);
        expect(canShowVenueLink(row({ kind: "INSTAGRAM", position: 0, url: "https://instagram.com/ar756_" }))).toBe(true);
    });

    it("tira as quatro colunas do salvamento geral", () => {
        const payload = withoutVenueLinkColumns({
            name: "AR756",
            url: "https://www.ar756.com/",
            instagramUrl: "https://instagram.com/ar756_",
            facebookUrl: "https://facebook.com/casa",
            tiktokUrl: "https://tiktok.com/@ar756_",
            email: "a@b.com",
        });
        expect(payload).toEqual({ name: "AR756", email: "a@b.com" });
    });
});
