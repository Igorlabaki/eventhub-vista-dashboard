export type SidebarMenuKind = "organization" | "venue" | "proposal" | "website" | "org-website" | "empty";

export type SidebarLevel = {
  kind: SidebarMenuKind;
  hold: boolean;
};

export type SidebarLevelInput = {
  pathname: string;
  selectedVenueId: string | null;
  currentProposalId: string | null;
  currentOrganizationId: string | null;
};

const emptyLevel: SidebarLevel = { kind: "empty", hold: false };

function pathId(pathname: string, pattern: RegExp) {
  return pathname.match(pattern)?.[1] ?? null;
}

function holdLoadedLevel(input: SidebarLevelInput): SidebarLevel {
  if (input.selectedVenueId) return { kind: "venue", hold: true };
  if (input.currentProposalId) return { kind: "proposal", hold: true };
  if (input.currentOrganizationId) return { kind: "organization", hold: true };
  return emptyLevel;
}

export function sidebarLevel(input: SidebarLevelInput): SidebarLevel {
  const proposalId = pathId(input.pathname, /^\/proposal\/([^/]+)/);
  const venueId = pathId(input.pathname, /^\/venue\/([^/]+)/);
  const organizationId = pathId(input.pathname, /^\/organization\/([^/]+)/);
  const website = input.pathname.includes("/website");

  if (proposalId) {
    if (input.currentProposalId === proposalId) return { kind: "proposal", hold: false };
    if (input.currentProposalId) return { kind: "proposal", hold: true };
    return holdLoadedLevel(input);
  }

  if (venueId) {
    if (input.selectedVenueId === venueId) {
      return website ? { kind: "website", hold: false } : { kind: "venue", hold: false };
    }
    if (input.selectedVenueId) return { kind: "venue", hold: true };
    return holdLoadedLevel(input);
  }

  if (organizationId) {
    if (input.currentOrganizationId === organizationId) {
      return website ? { kind: "org-website", hold: false } : { kind: "organization", hold: false };
    }
    if (input.selectedVenueId) return { kind: "venue", hold: true };
    if (input.currentProposalId) return { kind: "proposal", hold: true };
    if (input.currentOrganizationId) return { kind: "organization", hold: true };
    return emptyLevel;
  }

  return emptyLevel;
}
