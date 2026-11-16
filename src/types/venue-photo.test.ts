import { describe, expect, it } from "vitest";
import { toggleVenuePhoto, venuePhotoFilesTooLarge, venuePhotoUsageLines, VENUE_PHOTO_IN_USE_MESSAGE, VENUE_PHOTO_MAX_BYTES } from "@/types/venue-photo";

describe("biblioteca de fotos no front", () => {
    it("seleciona uma ou varias fotos ate o limite", () => {
        const a = { id: "a" };
        const b = { id: "b" };
        const c = { id: "c" };
        expect(toggleVenuePhoto([], a, "single")).toEqual([a]);
        expect(toggleVenuePhoto([b], a, "single")).toEqual([a]);
        expect(toggleVenuePhoto([a], b, "multiple", 2)).toEqual([a, b]);
        expect(toggleVenuePhoto([a, b], c, "multiple", 2)).toEqual([a, b]);
        expect(toggleVenuePhoto([a, b], a, "multiple", 2)).toEqual([b]);
    });

    it("o aviso de foto em uso nao cita os lugares", () => {
        const lines = venuePhotoUsageLines({
            siteImages: [{ id: "1", name: "Piscina" }],
            services: [{ id: "2", name: "Painel de Led" }],
            amenities: [{ id: "3", name: "Varanda" }],
            emailConfigs: [{ id: "4", name: "Convite" }],
        });
        expect(lines).toEqual(["Site: Piscina", "Servico: Painel de Led", "Caracteristica: Varanda", "E-mail: Convite"]);
        for (const line of lines) {
            expect(VENUE_PHOTO_IN_USE_MESSAGE).not.toContain(line);
        }
    });

    it("marca arquivo acima de 5 MB", () => {
        expect(venuePhotoFilesTooLarge([{ size: VENUE_PHOTO_MAX_BYTES }, { size: VENUE_PHOTO_MAX_BYTES + 1 }])).toHaveLength(1);
    });
});
