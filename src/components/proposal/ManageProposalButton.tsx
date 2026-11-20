import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { canManageProposal } from "@/lib/manage-proposal-access";
import { userVenuePermissionService } from "@/services/userVenuePermissions.service";
import { venueService } from "@/services/venue.service";
import { useUserStore } from "@/store/userStore";

export function ManageProposalButton({
  proposalId,
  venueId,
  organizationId,
  backgroundColor,
  color,
}: {
  proposalId: string;
  venueId: string;
  organizationId?: string | null;
  backgroundColor: string;
  color: string;
}) {
  const isAuthenticated = useUserStore((state) => state.isAuthenticated);
  const userId = useUserStore((state) => state.user?.id);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!isAuthenticated || !userId || !proposalId || !venueId) {
      setVisible(false);
      return;
    }
    let cancelled = false;
    const organization = organizationId
      ? Promise.resolve(organizationId)
      : venueService.getVenueById({ venueId, userId }).then((response) => response.data.organizationId);

    organization
      .then((orgId) => {
        if (cancelled || !orgId) return null;
        return userVenuePermissionService.getUserVenuePermission({
          organizationId: orgId,
          venueId,
          userId,
        });
      })
      .then((response) => {
        if (cancelled || !response) return;
        setVisible(canManageProposal(response.data, venueId));
      })
      .catch(() => {
        if (!cancelled) setVisible(false);
      });

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, userId, proposalId, venueId, organizationId]);

  if (!visible) return null;

  return (
    <Link
      to={`/proposal/${proposalId}`}
      className="fixed right-3 top-3 z-20 rounded-xl px-4 py-2 text-sm font-medium shadow-lg"
      style={{ backgroundColor, color }}
    >
      Gerir orçamento
    </Link>
  );
}
