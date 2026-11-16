import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { VenuePhoto } from "@/types/venue-photo";
import { VenuePhotoCard } from "./VenuePhotoCard";

const photo: VenuePhoto = {
    id: "photo-1",
    venueId: "venue-1",
    url: "https://cdn.example/piscina.webp",
    storageKey: "venues/venue-1/photos/photo-1.webp",
    width: 800,
    height: 600,
    sizeBytes: 1200,
    description: "Piscina da casa",
    createdAt: "2026-11-14T00:00:00.000Z",
    updatedAt: "2026-11-14T00:00:00.000Z",
};

function render(canEdit: boolean) {
    return renderToStaticMarkup(<VenuePhotoCard photo={photo} canEdit={canEdit} onDelete={() => undefined} />);
}

describe("card da biblioteca de fotos", () => {
    it("mostra so a imagem e a lixeira no canto superior direito", () => {
        const html = render(true);
        expect(html).toContain('src="https://cdn.example/piscina.webp"');
        expect(html).toContain('alt="Foto do espaco"');
        expect(html).toContain('aria-label="Excluir foto"');
        expect(html).toContain("absolute right-1.5 top-1.5");
        expect(html).toContain("h-6 w-6");
        expect(html).toContain("bg-red-100");
        expect(html).toContain("opacity-0");
        expect(html).toContain("group-hover:opacity-100");
        expect(html).not.toContain("<input");
        expect(html).not.toContain("Piscina da casa");
        expect(html).not.toContain("Sem descricao");
        expect(html).not.toContain(">Excluir<");
    });

    it("sem permissao de edicao a lixeira nao aparece", () => {
        const html = render(false);
        expect(html).toContain('src="https://cdn.example/piscina.webp"');
        expect(html).not.toContain("<button");
        expect(html).not.toContain("Piscina da casa");
    });
});
