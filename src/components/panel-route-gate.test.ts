import { describe, expect, it } from "vitest";
import { PanelRouteGateInput, panelRouteGate } from "./panel-route-gate";

const readyVenue: PanelRouteGateInput = {
  isAuthenticated: true,
  hasUser: true,
  requiredPermission: "VIEW_VENUE_PROPOSALS",
  venueId: "v1",
  proposalId: null,
  organizationId: null,
  selectedVenueId: "v1",
  selectedVenueOrganizationId: "o1",
  currentProposalId: null,
  proposalVenueId: null,
  currentOrganizationId: "o1",
  venuePermission: { venueId: "v1", permissions: "VIEW_VENUE_SITES,VIEW_VENUE_PROPOSALS" },
  organizationPermission: null,
  error: null,
};

describe("panelRouteGate", () => {
  it("mantem a tela cheia sem sessao", () => {
    expect(panelRouteGate({ ...readyVenue, isAuthenticated: false })).toBe("session");
    expect(panelRouteGate({ ...readyVenue, hasUser: false })).toBe("session");
  });

  it("abre a pagina quando o mesmo espaco ja tem a permissao", () => {
    expect(panelRouteGate(readyVenue)).toBe("ready");
  });

  it("nega a rota sem a permissao deste espaco", () => {
    expect(panelRouteGate({
      ...readyVenue,
      venuePermission: { venueId: "v1", permissions: "VIEW_VENUE_SITES" },
    })).toBe("denied");
  });

  it("espera no miolo quando o espaco ou a permissao ainda nao sao deste destino", () => {
    expect(panelRouteGate({ ...readyVenue, selectedVenueId: null })).toBe("content");
    expect(panelRouteGate({
      ...readyVenue,
      venuePermission: { venueId: "v2", permissions: "VIEW_VENUE_PROPOSALS" },
    })).toBe("content");
  });

  it("abre outro item da organizacao quando a permissao ja e dela", () => {
    expect(panelRouteGate({
      ...readyVenue,
      venueId: null,
      organizationId: "o1",
      requiredPermission: "VIEW_ORG_VENUES",
      organizationPermission: { organizationId: "o1", permissions: ["VIEW_ORG_VENUES"] },
    })).toBe("ready");
  });

  it("nao usa a permissao de outra organizacao", () => {
    expect(panelRouteGate({
      ...readyVenue,
      venueId: null,
      organizationId: "o2",
      currentOrganizationId: "o2",
      requiredPermission: "VIEW_ORG_VENUES",
      organizationPermission: { organizationId: "o1", permissions: ["VIEW_ORG_VENUES"] },
    })).toBe("content");
  });

  it("abre outro item do orcamento quando proposta, espaco e permissao ja conferem", () => {
    expect(panelRouteGate({
      ...readyVenue,
      venueId: null,
      proposalId: "p1",
      requiredPermission: "VIEW_PROPOSAL_INFO",
      currentProposalId: "p1",
      proposalVenueId: "v1",
      venuePermission: { venueId: "v1", permissions: "VIEW_PROPOSAL_INFO" },
    })).toBe("ready");
  });

  it("mostra o erro no lugar de um loading sem fim", () => {
    expect(panelRouteGate({ ...readyVenue, error: "Espaço não encontrado" })).toBe("error");
  });

  it("nao bloqueia o painel quando a rota nao pede um espaco", () => {
    expect(panelRouteGate({
      ...readyVenue,
      venueId: null,
      requiredPermission: undefined,
      selectedVenueId: null,
      currentOrganizationId: null,
      venuePermission: null,
    })).toBe("ready");
  });
});
