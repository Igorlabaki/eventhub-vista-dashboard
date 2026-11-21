import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { EVENTHUB_TAB_ICON, venueTabIconHref } from "./venue-tab-icon";

const pages = [
  "../pages/ProposalView.tsx",
  "../pages/VenuePresentation.tsx",
  "../components/proposal/PublicVenueListShell.tsx",
  "../pages/VenueDashboard.tsx",
  "../pages/ProposalForm.tsx",
];

describe("icone da aba", () => {
  it("usa a URL do espaco e volta o favicon do EventHub quando nao ha icone", () => {
    expect(venueTabIconHref(" https://cdn.example/icone.png ")).toBe("https://cdn.example/icone.png");
    expect(venueTabIconHref(null)).toBe(EVENTHUB_TAB_ICON);
    expect(venueTabIconHref("")).toBe(EVENTHUB_TAB_ICON);
    expect(venueTabIconHref("   ")).toBe(EVENTHUB_TAB_ICON);
  });

  it("as cinco telas que trocam o titulo tambem trocam o icone e nao criam outro tipo de icone", () => {
    for (const page of pages) {
      const source = readFileSync(new URL(page, import.meta.url), "utf8");
      expect(source).toContain("applyVenueTabIcon(");
      expect(source).not.toContain("apple-touch-icon");
      expect(source).not.toContain("manifest");
    }
  });
});
