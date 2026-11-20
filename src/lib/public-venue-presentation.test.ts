import { readFileSync } from "fs";
import { describe, expect, it } from "vitest";
import {
  PUBLIC_VENUE_PRESENTATION_PATTERN,
  publicVenueBudgetFormShareUrl,
  publicVenuePresentationPath,
  publicVenuePresentationShareUrl,
  venueIdForPublicForm,
} from "@/lib/public-venue-presentation";

const house = { id: "8159e209-0057-4df3-ae72-855363c3b84e", name: "AR756" };

describe("public venue presentation", () => {
  it("abre o link na base de producao, com o nome do espaco", () => {
    expect(publicVenuePresentationShareUrl).toHaveLength(1);
    expect(publicVenuePresentationShareUrl("AR756")).toBe(
      "https://event-hub-dashboard.vercel.app/espaco/AR756/apresentacao",
    );
    expect(publicVenuePresentationShareUrl("Casa Norte")).toBe(
      "https://event-hub-dashboard.vercel.app/espaco/Casa%20Norte/apresentacao",
    );
    expect(publicVenuePresentationShareUrl("AR756")).not.toContain("localhost");
    expect(publicVenuePresentationPath("AR756")).toBe("/espaco/AR756/apresentacao");
    expect(PUBLIC_VENUE_PRESENTATION_PATTERN).toBe("/espaco/:id/apresentacao");
  });

  it("copia o formulario com o mesmo nome e codifica espaco", () => {
    expect(publicVenueBudgetFormShareUrl("AR756")).toBe(
      "https://event-hub-dashboard.vercel.app/espaco/AR756/formulario",
    );
    expect(publicVenueBudgetFormShareUrl("Casa Norte")).toBe(
      "https://event-hub-dashboard.vercel.app/espaco/Casa%20Norte/formulario",
    );
  });

  it("mantem os cinco caminhos novos no nome e os enderecos velhos registrados", () => {
    const app = readFileSync("src/App.tsx", "utf8");
    for (const path of ["apresentacao", "formulario", "regras", "parceiro", "colaborador"]) {
      expect(app).toContain(`path="/espaco/:id/${path}"`);
    }
    expect(app).toContain('path="/venue/:id/form"');
    expect(app).toContain('path="/venue/:id/apresentacao"');
    expect(app).toContain('path="/venue/:id/rules/view"');
    expect(app).toContain('path="/venue/:id/partner-form"');
    expect(app).toContain('path="/venue/:id/crew-form"');
    const contacts = readFileSync("src/pages/VenueContacts.tsx", "utf8");
    expect(contacts).toContain("publicVenuePartnerShareUrl");
    expect(contacts).toContain("publicVenueCrewShareUrl");
    expect(contacts).not.toContain("partner-form");
  });

  it("o formulario grava o id real quando a url traz o nome ou o uuid", () => {
    expect(venueIdForPublicForm("AR756", house)).toBe(house.id);
    expect(venueIdForPublicForm(house.id, house)).toBe(house.id);
    expect(venueIdForPublicForm("Outra casa", house)).toBeNull();
    expect(venueIdForPublicForm("AR756", null)).toBeNull();
  });
});
