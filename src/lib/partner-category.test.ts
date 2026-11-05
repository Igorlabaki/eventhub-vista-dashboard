import { describe, expect, it } from "vitest";
import {
  PARTNER_CATEGORIES,
  PARTNER_CATEGORY_LABELS,
  groupIndicationsByCategory,
} from "./partner-category";

describe("partner category", () => {
  it("lista os dezessete rotulos de Buffet a Outros", () => {
    expect(PARTNER_CATEGORIES).toHaveLength(17);
    expect(PARTNER_CATEGORY_LABELS.BUFFET).toBe("Buffet");
    expect(PARTNER_CATEGORY_LABELS.MUSICA_AO_VIVO).toBe("Musica ao vivo");
    expect(PARTNER_CATEGORY_LABELS.BOLOS_DOCES).toBe("Bolos e doces");
    expect(PARTNER_CATEGORY_LABELS.OUTROS).toBe("Outros");
    expect(PARTNER_CATEGORIES.map((category) => PARTNER_CATEGORY_LABELS[category])[0]).toBe("Buffet");
    expect(PARTNER_CATEGORIES.map((category) => PARTNER_CATEGORY_LABELS[category]).at(-1)).toBe("Outros");
  });

  it("agrupa na ordem do enum e mantem a ordem de chegada", () => {
    const groups = groupIndicationsByCategory([
      { id: "dj-1", category: "DJ" },
      { id: "buffet", category: "BUFFET" },
      { id: "dj-2", category: "DJ" },
      { id: "vazio", category: null },
      { id: "outros", category: "OUTROS" },
    ]);

    expect(groups.map((group) => group.category)).toEqual(["BUFFET", "DJ", "OUTROS"]);
    expect(groups.find((group) => group.category === "DJ")?.items.map((item) => item.id)).toEqual(["dj-1", "dj-2"]);
    expect(groups.find((group) => group.category === "OUTROS")?.items.map((item) => item.id)).toEqual(["vazio", "outros"]);
    expect(groups.find((group) => group.category === "BAR")).toBeUndefined();
  });

  it("lista vazia nao cria grupo", () => {
    expect(groupIndicationsByCategory([])).toEqual([]);
  });
});
