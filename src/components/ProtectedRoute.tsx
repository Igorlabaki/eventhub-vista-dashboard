import { useEffect, useState, useMemo, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useUserStore } from "@/store/userStore";
import { useProposalStore } from "@/store/proposalStore";
import { useVenueStore } from "@/store/venueStore";
import { useOrganizationStore } from "@/store/organizationStore";
import { useUserVenuePermissionStore } from "@/store/userVenuePermissionStore";
import { useUserOrganizationPermissionStore } from "@/store/userOrganizationPermissionStore";
import { AppLoadingScreen, AppErrorScreen } from "@/components/ui/AppLoadingScreen";

export function ProtectedRoute({ children }: { children: JSX.Element }) {
  const navigate = useNavigate();
  const location = useLocation();

  const isAuthenticated = useUserStore((state) => state.isAuthenticated);
  const userId = useUserStore((state) => state.user?.id);

  const { fetchProposalById } = useProposalStore();
  const { fetchVenueById } = useVenueStore();
  const { fetchOrganizationById } = useOrganizationStore();
  const { fetchCurrentUserVenuePermission } = useUserVenuePermissionStore();
  const { fetchCurrentUserOrganizationPermission } = useUserOrganizationPermissionStore();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pathname = location.pathname;

  const extractIdFromPath = (pattern: RegExp): string | null => {
    const match = pathname.match(pattern);
    return match ? match[1] : null;
  };

  const proposalId = useMemo(() => extractIdFromPath(/^\/proposal\/([^/]+)/), [pathname]);
  const venueId = useMemo(() => extractIdFromPath(/^\/venue\/([^/]+)/), [pathname]);
  const organizationId = useMemo(() => extractIdFromPath(/^\/organization\/([^/]+)/), [pathname]);

  const fetchUserPermissions = useCallback(
    async (orgId: string, venueId?: string) => {
      if (!userId) return;
      await fetchCurrentUserVenuePermission({
        organizationId: orgId,
        venueId: venueId || "",
        userId,
      });
    },
    [userId, fetchCurrentUserVenuePermission]
  );

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login", { replace: true, state: { from: location } });
      return;
    }

    let cancelled = false;

    const preloadEntities = async () => {
      setLoading(true);
      setError(null);

      try {
        if (proposalId) {
          await fetchProposalById(proposalId);

          const proposal = useProposalStore.getState().currentProposal;
          if (!proposal || proposal.id !== proposalId) throw new Error("Proposta não encontrada");

          await fetchVenueById(proposal.venueId, userId ?? "");
          const venue = useVenueStore.getState().selectedVenue;
          if (!venue || venue.id !== proposal.venueId) throw new Error("Venue não encontrada");

          await fetchOrganizationById(venue.organizationId);
          await fetchCurrentUserVenuePermission({
            organizationId: venue.organizationId,
            venueId: venue.id,
            userId,
          });
        } else if (venueId) {
          await fetchVenueById(venueId, userId ?? "");
          const venue = useVenueStore.getState().selectedVenue;
          if (!venue || venue.id !== venueId) throw new Error("Venue não encontrada");

          await fetchOrganizationById(venue.organizationId);
          await fetchCurrentUserVenuePermission({
            organizationId: venue.organizationId,
            venueId: venue.id,
            userId,
          });
        } else if (organizationId) {
          await fetchOrganizationById(organizationId);
          await fetchCurrentUserOrganizationPermission({ organizattionId: organizationId, userId });
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Erro ao carregar dados");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    preloadEntities();

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, proposalId, venueId, organizationId, userId, fetchProposalById, fetchVenueById, fetchOrganizationById, fetchCurrentUserVenuePermission, fetchCurrentUserOrganizationPermission]);

  if (!isAuthenticated) return null;
  if (loading) return <AppLoadingScreen />;
  if (error) return <AppErrorScreen message={error} />;

  return children;
}