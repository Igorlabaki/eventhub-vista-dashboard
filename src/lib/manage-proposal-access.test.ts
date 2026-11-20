import { readFileSync } from "fs";
import { describe, expect, it } from "vitest";
import { canManageProposal } from "./manage-proposal-access";

const venueId = "venue-ar756";

describe("canManageProposal", () => {
  it("allows the venue permission that opens the proposal panel", () => {
    expect(canManageProposal({ venueId, permissions: "VIEW_PROPOSAL_INFO" }, venueId)).toBe(true);
    expect(canManageProposal({ venueId, permissions: ["VIEW_VENUE_INFO", "VIEW_PROPOSAL_INFO"] }, venueId)).toBe(true);
  });

  it("hides the button without that permission, without a session payload, or for another venue", () => {
    expect(canManageProposal(null, venueId)).toBe(false);
    expect(canManageProposal({ venueId, permissions: "VIEW_VENUE_INFO" }, venueId)).toBe(false);
    expect(canManageProposal({ venueId: "other-venue", permissions: "VIEW_PROPOSAL_INFO" }, venueId)).toBe(false);
    expect(canManageProposal({ permissions: "VIEW_PROPOSAL_INFO" }, "")).toBe(false);
  });
});

describe("manage proposal button placement", () => {
  const source = (path: string) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

  it("puts the button on the public proposal pages and leaves the house rules page alone", () => {
    const shell = source("components/proposal/PublicVenueListShell.tsx");
    const view = source("pages/ProposalView.tsx");
    const rules = source("pages/PublicVenueRules.tsx");
    const button = source("components/proposal/ManageProposalButton.tsx");
    expect(shell).toContain("ManageProposalButton");
    expect(shell).toContain("proposalId");
    expect(view).toContain("ManageProposalButton");
    expect(button).toContain("Gerir orçamento");
    expect(button).toContain("rounded-xl");
    expect(rules).not.toContain("proposalId=");
    for (const page of [
      "pages/GuestList.tsx",
      "pages/WorkerList.tsx",
      "pages/ScheduleList.tsx",
      "pages/ProposalIndications.tsx",
      "pages/ProposalEventLink.tsx",
      "pages/ContarctPFForm.tsx",
      "pages/ContarctPjForm.tsx",
    ]) {
      expect(source(page)).toContain("proposalId=");
    }
  });
});
