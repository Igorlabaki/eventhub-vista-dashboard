import { describe, expect, it } from "vitest";
import { venueTabTitle } from "./venue-tab-title";

describe("venueTabTitle", () => {
  it("junta nome e descricao", () => {
    expect(venueTabTitle("Casa Aurora", "Espaco para festas no jardim")).toBe(
      "Casa Aurora — Espaco para festas no jardim"
    );
  });

  it.each([undefined, null, "", "   ", "\n\t"])("sem descricao util mostra so o nome (%j)", (description) => {
    expect(venueTabTitle("Casa Aurora", description)).toBe("Casa Aurora");
  });

  it("mantem o texto da descricao e junta quebras numa linha", () => {
    expect(venueTabTitle("Casa Aurora", "  Jardim\ncom piscina  ")).toBe(
      "Casa Aurora — Jardim com piscina"
    );
  });
});
