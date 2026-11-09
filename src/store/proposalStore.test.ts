import { beforeEach, describe, expect, it, vi } from "vitest";

const listProposals = vi.fn();

vi.mock("@/services/proposal.service", () => ({
  proposalService: { listProposals: (...args: unknown[]) => listProposals(...args) },
}));

import { useProposalStore } from "./proposalStore";

const summary = { total: 2, monthAmount: 9089, amountMax: 9000, conversionRate: 100, daily: [] };

describe("fetchEvents", () => {
  beforeEach(() => {
    listProposals.mockReset();
    useProposalStore.setState({ events: [], eventListPagination: null, eventListSummary: null, eventListError: null });
  });

  it("forca approved e guarda o resumo", async () => {
    listProposals.mockResolvedValue({
      data: { proposalList: [{ id: "p1" }], summary },
      pagination: { page: 1, pageSize: 10, total: 1, totalPages: 1 },
    });

    await useProposalStore.getState().fetchEvents({ venueId: "v1", summary: true, day: "28", minAmount: 4000, approved: false });

    expect(listProposals).toHaveBeenCalledWith(expect.objectContaining({ venueId: "v1", summary: true, day: "28", minAmount: 4000, approved: true }));
    expect(useProposalStore.getState().eventListSummary).toEqual(summary);
    expect(useProposalStore.getState().events).toHaveLength(1);
  });

  it("limpa o resumo no erro", async () => {
    useProposalStore.setState({ eventListSummary: summary });
    listProposals.mockRejectedValue({ response: { data: { message: "falhou" } } });

    await useProposalStore.getState().fetchEvents({ venueId: "v1", summary: true });

    expect(useProposalStore.getState().eventListSummary).toBeNull();
    expect(useProposalStore.getState().eventListError).toBe("falhou");
    expect(useProposalStore.getState().isLoadingEvents).toBe(false);
  });
});
