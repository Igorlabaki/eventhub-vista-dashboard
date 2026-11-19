import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { PUBLIC_ROUTES as axiosPublicRoutes } from "@/lib/axios";
import { PUBLIC_ROUTES as bootstrapPublicRoutes } from "@/hooks/useBootstrapUser";
import { venuePresentationView, type VenuePresentationImage } from "@/lib/venue-presentation";

function source(path: string) {
  return readFileSync(resolve(process.cwd(), path), "utf8");
}

function photo(id: string, position: number): VenuePresentationImage {
  return { id, imageUrl: `https://cdn.example/${id}.png`, description: null, position };
}

const base = {
  amenityCount: 1,
  serviceCount: 2,
  amount: 150,
  minimumPrice: 0,
  whatsapp: "5511999999999",
  neighborhood: "Centro",
  city: "Ubatuba",
  street: "Rua das Flores",
  streetNumber: "10",
  state: "SP",
  model: "PER_PERSON" as const,
  name: "Casa Aurora",
  slogan: "O OASIS URBANO",
  description: "Um jardim com piscina.",
  maxGuest: 120,
  hasOvernightStay: false,
  checkIn: null,
  checkOut: null,
  minimumNights: null,
  openingHour: "08:00",
  closingHour: "22:00",
};

describe("apresentacao publica do espaco", () => {
  it("com video coloca a primeira foto no terceiro bloco e o resto no grid", () => {
    const view = venuePresentationView({
      ...base,
      hasVideo: true,
      images: [photo("a", 1), photo("b", 2), photo("c", 3)],
    });
    expect(view.blocks.slice(0, 6)).toEqual(["logo", "video", "house", "solo-photo", "amenities", "services"]);
    expect(view.soloPhoto?.id).toBe("a");
    expect(view.grid.map((image) => image.id)).toEqual(["b", "c"]);
    expect(view.blocks.indexOf("grid")).toBeGreaterThan(view.blocks.indexOf("services"));
    expect(view.blocks.indexOf("investment")).toBeGreaterThan(view.blocks.indexOf("grid"));
    expect(view.blocks.at(-2)).toBe("map");
  });

  it("sem video a capa e o hero e a foto seguinte fica sozinha", () => {
    const view = venuePresentationView({
      ...base,
      hasVideo: false,
      images: [photo("a", 1), photo("b", 2), photo("c", 3)],
    });
    expect(view.blocks.slice(0, 4)).toEqual(["logo", "hero-photo", "house", "solo-photo"]);
    expect(view.heroPhoto?.id).toBe("a");
    expect(view.soloPhoto?.id).toBe("b");
    expect(view.grid.map((image) => image.id)).toEqual(["c"]);
  });

  it("sem foto tira os tres blocos de imagem", () => {
    const view = venuePresentationView({ ...base, hasVideo: false, images: [] });
    expect(view.hero).toBe("none");
    expect(view.soloPhoto).toBeNull();
    expect(view.grid).toEqual([]);
    expect(view.blocks).toContain("house");
    expect(view.blocks).not.toEqual(expect.arrayContaining(["video", "hero-photo", "solo-photo", "grid"]));
  });

  it("investimento mostra o rotulo do modelo e o minimo so quando e maior que zero", () => {
    const priced = venuePresentationView({ ...base, hasVideo: false, images: [], minimumPrice: 500 });
    expect(priced.priceLabel).toBe("Por pessoa");
    expect(priced.amount).toBe(150);
    expect(priced.minimumPrice).toBe(500);
    expect(priced.mapLabel).toBe("Centro — Ubatuba");

    const noMinimum = venuePresentationView({ ...base, hasVideo: false, images: [], amount: null, minimumPrice: 0, whatsapp: "" });
    expect(noMinimum.showInvestment).toBe(false);
    expect(noMinimum.blocks).not.toContain("investment");
  });

  it("a rota publica entra nas duas allowlists e nao usa ProtectedRoute", () => {
    expect(axiosPublicRoutes).toContain("/venue/:id/apresentacao");
    expect(bootstrapPublicRoutes).toContain("/venue/:id/apresentacao");
    const app = source("src/App.tsx");
    const route = app.slice(app.indexOf('path="/venue/:id/apresentacao"'), app.indexOf('path="/venue/:id/apresentacao"') + 180);
    expect(route).toContain("<VenuePresentation");
    expect(route).not.toContain("ProtectedRoute");
  });

  it("o card da casa usa descricao, horario, capacidade e local, e o slogan fica no topo", () => {
    const day = venuePresentationView({ ...base, hasVideo: true, images: [photo("a", 1)] });
    expect(day.slogan).toBe("O OASIS URBANO");
    expect(day.houseCard).toEqual({
      description: "Um jardim com piscina.",
      capacityLabel: "Até 120 pessoas",
      schedule: { label: "Horário de funcionamento", value: "8h às 22h" },
      minimumNightsLabel: null,
      placeLabel: "Centro — Ubatuba",
    });

    const blank = venuePresentationView({
      ...base,
      hasVideo: false,
      images: [],
      slogan: "   ",
      description: "\n",
      openingHour: "08:30",
      closingHour: " ",
      neighborhood: "",
      city: "Ubatuba",
    });
    expect(blank.slogan).toBeNull();
    expect(blank.houseCard.description).toBeNull();
    expect(blank.houseCard.schedule).toEqual({ label: "Horário de funcionamento", value: "8h30" });
    expect(blank.houseCard.placeLabel).toBe("Ubatuba");

    const closingOnly = venuePresentationView({
      ...base,
      hasVideo: false,
      images: [],
      openingHour: null,
      closingHour: "22:00",
      neighborhood: "Centro",
      city: "",
    });
    expect(closingOnly.houseCard.schedule).toEqual({ label: "Horário de funcionamento", value: "até 22h" });
    expect(closingOnly.houseCard.placeLabel).toBe("Centro");

    const stay = venuePresentationView({
      ...base,
      hasVideo: false,
      images: [],
      hasOvernightStay: true,
      checkIn: "14:00",
      checkOut: "12:00",
      minimumNights: 2,
      openingHour: "08:00",
      closingHour: "22:00",
    });
    expect(stay.houseCard.schedule).toEqual({ label: "Estadia", value: "Check-in 14h · Check-out 12h" });
    expect(stay.houseCard.minimumNightsLabel).toBe("Mínimo de 2 noites.");

    const oneNight = venuePresentationView({
      ...base,
      hasVideo: false,
      images: [],
      hasOvernightStay: true,
      checkIn: "  ",
      checkOut: null,
      minimumNights: 1,
    });
    expect(oneNight.houseCard.schedule).toBeNull();
    expect(oneNight.houseCard.minimumNightsLabel).toBe("Mínimo de 1 noite.");

    const noNights = venuePresentationView({
      ...base,
      hasVideo: false,
      images: [],
      hasOvernightStay: true,
      minimumNights: 0,
    });
    expect(noNights.houseCard.minimumNightsLabel).toBeNull();
  });

  it("a pagina nova nao leva preco de servico nem total, e o orcamento continua com os dois blocos", () => {
    const page = source("src/pages/VenuePresentation.tsx");
    const proposal = source("src/pages/ProposalView.tsx");
    expect(page).toContain("A casa");
    expect(page).toContain("view.slogan");
    expect(page).toContain("view.houseCard");
    expect(page).toContain("venueTabTitle(house.name, view.slogan)");
    expect(page).toContain("Serviços disponíveis");
    expect(page).toContain("Seu investimento");
    expect(page).toContain("Fazer orçamento");
    expect(page).toContain("`/venue/${house.name}/form`");
    expect(page.indexOf("Fazer orçamento")).toBeLessThan(page.indexOf("Conversar com nossa equipe"));
    expect(page).not.toContain("Alterar serviços");
    expect(page).not.toContain("Investimento total");
    expect(page).not.toContain("Alterar orçamento");
    expect(proposal).toContain("house?.description");
    expect(proposal).toContain("Sua experiência inclui");
    expect(proposal).toContain("Seu investimento");
    expect(proposal).toContain("Investimento total");
  });
});
