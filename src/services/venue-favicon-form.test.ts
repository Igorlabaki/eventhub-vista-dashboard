import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { appendVenueImageFiles } from "./venue.service";

const settings = readFileSync(new URL("../pages/VenueSettings.tsx", import.meta.url), "utf8");
const create = readFileSync(new URL("../components/venue/CreateVenueForm.tsx", import.meta.url), "utf8");

describe("campo icone da aba", () => {
  it("fica ao lado do logo, aceita imagem e avisa que fica melhor quadrado", () => {
    for (const source of [settings, create]) {
      expect(source).toContain("Logo do Espaço");
      expect(source).toContain("Icone da aba");
      expect(source).toContain('accept="image/*"');
      expect(source).toContain("O icone fica melhor quadrado e pequeno.");
    }
  });

  it("manda o icone em favicon e o logo em file, e omite os dois quando nao ha arquivo", () => {
    const form = new FormData();
    const logo = new File(["logo"], "logo.png", { type: "image/png" });
    const icon = new File(["icone"], "icone.png", { type: "image/png" });
    appendVenueImageFiles(form, { logoFile: logo, faviconFile: icon });
    expect((form.get("file") as File).name).toBe("logo.png");
    expect((form.get("favicon") as File).name).toBe("icone.png");

    const empty = new FormData();
    appendVenueImageFiles(empty, {});
    expect(empty.get("file")).toBeNull();
    expect(empty.get("favicon")).toBeNull();
  });
});
