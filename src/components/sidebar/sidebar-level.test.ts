import { describe, expect, it } from "vitest";
import { sidebarLevel } from "./sidebar-level";

const memory = {
  selectedVenueId: "v1",
  currentProposalId: null as string | null,
  currentOrganizationId: "o1",
};

describe("sidebarLevel", () => {
  it("segura o menu do espaco enquanto o orcamento ainda nao chegou", () => {
    expect(sidebarLevel({
      ...memory,
      pathname: "/proposal/p1",
    })).toEqual({ kind: "venue", hold: true });
  });

  it("segura o menu do orcamento anterior ao abrir outro orcamento", () => {
    expect(sidebarLevel({
      ...memory,
      currentProposalId: "p1",
      pathname: "/proposal/p2",
    })).toEqual({ kind: "proposal", hold: true });
  });

  it("mostra o menu do orcamento quando a proposta ja e a da rota", () => {
    expect(sidebarLevel({
      ...memory,
      currentProposalId: "p1",
      pathname: "/proposal/p1",
    })).toEqual({ kind: "proposal", hold: false });
  });

  it("mantem o menu do espaco na troca de item do mesmo espaco", () => {
    expect(sidebarLevel({
      ...memory,
      pathname: "/venue/v1/budgets",
    })).toEqual({ kind: "venue", hold: false });
  });

  it("segura o menu do orcamento ao voltar para um espaco que ainda nao esta na memoria", () => {
    expect(sidebarLevel({
      ...memory,
      selectedVenueId: null,
      currentProposalId: "p1",
      pathname: "/venue/v2",
    })).toEqual({ kind: "proposal", hold: true });
  });

  it("segura o menu da organizacao ao abrir um espaco ainda nao carregado", () => {
    expect(sidebarLevel({
      ...memory,
      selectedVenueId: null,
      pathname: "/venue/v2",
    })).toEqual({ kind: "organization", hold: true });
  });

  it("segura o menu do espaco ao abrir uma organizacao que ainda nao e a atual", () => {
    expect(sidebarLevel({
      ...memory,
      pathname: "/organization/o2/venues",
    })).toEqual({ kind: "venue", hold: true });
  });

  it("mostra o menu da organizacao quando ela ja e a da rota", () => {
    expect(sidebarLevel({
      ...memory,
      pathname: "/organization/o1/venues",
    })).toEqual({ kind: "organization", hold: false });
  });

  it("deixa a coluna sem menu so quando nenhum nivel anterior existe", () => {
    expect(sidebarLevel({
      pathname: "/proposal/p9",
      selectedVenueId: null,
      currentProposalId: null,
      currentOrganizationId: null,
    })).toEqual({ kind: "empty", hold: false });
  });
});
