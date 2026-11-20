export function canManageProposal(
  permission: { venueId?: string | null; permissions?: string | readonly string[] | null } | null | undefined,
  venueId: string,
): boolean {
  if (!permission || !venueId) return false;
  if (permission.venueId && permission.venueId !== venueId) return false;
  const permissions = permission.permissions;
  if (permissions == null) return false;
  return permissions.includes("VIEW_PROPOSAL_INFO");
}
