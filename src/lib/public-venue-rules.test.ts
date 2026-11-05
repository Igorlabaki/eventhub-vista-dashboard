import { describe, expect, it } from "vitest";
import { PUBLIC_ROUTES as axiosPublicRoutes } from "@/lib/axios";
import { PUBLIC_ROUTES as bootstrapPublicRoutes } from "@/hooks/useBootstrapUser";
import {
  EMPTY_PUBLIC_VENUE_RULES,
  PUBLIC_VENUE_RULES_LEAD,
  PUBLIC_VENUE_RULES_NOTICE,
  PUBLIC_VENUE_RULES_PATTERN,
  publicRuleCards,
  publicVenueRulesPath,
  publicVenueRulesShareUrl,
} from "@/lib/public-venue-rules";

describe("public venue rules", () => {
  it("mantem a ordem da API e o texto sem titulo", () => {
    const cards = publicRuleCards([
      { id: "b", title: "  ", text: "<b>segundo</b>", position: 2 },
      { id: "a", title: "Horario", text: "Ate as 22h", position: 0 },
    ]);
    expect(cards).toEqual([
      { id: "b", title: null, text: "<b>segundo</b>" },
      { id: "a", title: "Horario", text: "Ate as 22h" },
    ]);
  });

  it("copia o link na base de producao, sem origem da aba", () => {
    expect(publicVenueRulesShareUrl).toHaveLength(1);
    expect(publicVenueRulesShareUrl("venue-1")).toBe(
      "https://event-hub-dashboard.vercel.app/venue/venue-1/rules/view",
    );
    expect(publicVenueRulesShareUrl("venue-1")).not.toContain("localhost");
  });

  it("aponta o endereco publico e a frase de lista vazia", () => {
    expect(publicVenueRulesPath("venue-1")).toBe("/venue/venue-1/rules/view");
    expect(EMPTY_PUBLIC_VENUE_RULES).toBe("Ainda não há regras deste espaço.");
    expect(PUBLIC_VENUE_RULES_LEAD).toBe(
      "Orientações importantes para segurança, conservação e bom uso do espaço durante o evento.",
    );
    expect(PUBLIC_VENUE_RULES_NOTICE).toBe(
      "Estas regras se aplicam a organizadores, convidados e fornecedores.",
    );
    expect(PUBLIC_VENUE_RULES_NOTICE).not.toMatch(/proibido|permitido|orientação/i);
    expect(axiosPublicRoutes).toContain(PUBLIC_VENUE_RULES_PATTERN);
    expect(bootstrapPublicRoutes).toContain(PUBLIC_VENUE_RULES_PATTERN);
  });
});
