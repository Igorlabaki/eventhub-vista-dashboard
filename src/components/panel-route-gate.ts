export type PanelRouteGate = "session" | "content" | "ready" | "denied" | "error";

export type PanelPermission = {
  permissions?: string | readonly string[] | null;
  venueId?: string | null;
  organizationId?: string | null;
};

export type PanelRouteGateInput = {
  isAuthenticated: boolean;
  hasUser: boolean;
  requiredPermission?: string;
  venueId: string | null;
  proposalId: string | null;
  organizationId: string | null;
  selectedVenueId: string | null;
  selectedVenueOrganizationId: string | null;
  currentProposalId: string | null;
  proposalVenueId: string | null;
  currentOrganizationId: string | null;
  venuePermission: PanelPermission | null;
  organizationPermission: PanelPermission | null;
  error: string | null;
};

function allows(permissions: string | readonly string[] | null | undefined, required: string) {
  if (permissions == null) return false;
  return permissions.includes(required);
}

function venuePermissionGate(
  permission: PanelPermission | null,
  venueId: string,
  required?: string,
): PanelRouteGate {
  if (!required) return "ready";
  if (!permission || permission.venueId !== venueId) return "content";
  return allows(permission.permissions, required) ? "ready" : "denied";
}

function organizationPermissionGate(
  permission: PanelPermission | null,
  organizationId: string,
  required?: string,
): PanelRouteGate {
  if (!required) return "ready";
  if (!permission || permission.organizationId !== organizationId) return "content";
  return allows(permission.permissions, required) ? "ready" : "denied";
}

export function panelRouteGate(input: PanelRouteGateInput): PanelRouteGate {
  if (!input.isAuthenticated || !input.hasUser) return "session";
  if (input.error) return "error";

  if (input.proposalId) {
    const venueReady =
      input.currentProposalId === input.proposalId &&
      !!input.proposalVenueId &&
      input.selectedVenueId === input.proposalVenueId &&
      !!input.selectedVenueOrganizationId &&
      input.currentOrganizationId === input.selectedVenueOrganizationId;
    if (!venueReady) return "content";
    return venuePermissionGate(input.venuePermission, input.proposalVenueId as string, input.requiredPermission);
  }

  if (input.venueId) {
    const venueReady =
      input.selectedVenueId === input.venueId &&
      !!input.selectedVenueOrganizationId &&
      input.currentOrganizationId === input.selectedVenueOrganizationId;
    if (!venueReady) return "content";
    return venuePermissionGate(input.venuePermission, input.venueId, input.requiredPermission);
  }

  if (input.organizationId) {
    if (input.currentOrganizationId !== input.organizationId) return "content";
    return organizationPermissionGate(input.organizationPermission, input.organizationId, input.requiredPermission);
  }

  return "ready";
}
