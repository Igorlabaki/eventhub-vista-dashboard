import { useEffect, useState, useMemo, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useUserStore } from "@/store/userStore";
import { useProposalStore } from "@/store/proposalStore";
import { useVenueStore } from "@/store/venueStore";
import { useOrganizationStore } from "@/store/organizationStore";
import { useUserVenuePermissionStore } from "@/store/userVenuePermissionStore";
import { useUserOrganizationPermissionStore } from "@/store/userOrganizationPermissionStore";
import { AppLoadingScreen, AppErrorScreen } from "@/components/ui/AppLoadingScreen";
import AccessDenied from "./accessDenied";
import { UserVenuePermissionByIdResponse } from "@/types/userVenuePermissions";

interface ProtectedRouteProps {
  children: JSX.Element;
  requiredPermission?: string;
}

export function ProtectedRoute({ children, requiredPermission }: ProtectedRouteProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const isAuthenticated = useUserStore((state) => state.isAuthenticated);
  const user = useUserStore((state) => state.user);
  const userId = user?.id;

  const { fetchProposalById } = useProposalStore();
  const { fetchVenueById, clearSelectedVenue } = useVenueStore();
  const { fetchOrganizationById } = useOrganizationStore();
  const { fetchCurrentUserVenuePermission, currentUserVenuePermission } = useUserVenuePermissionStore();
  const { fetchCurrentUserOrganizationPermission, currentUserOrganizationPermission } = useUserOrganizationPermissionStore();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasPermission, setHasPermission] = useState(true);

  const pathname = location.pathname;

  const extractIdFromPath = (pattern: RegExp): string | null => {
    const match = pathname.match(pattern);
    return match ? match[1] : null;
  };

  const proposalId = useMemo(() => extractIdFromPath(/^\/proposal\/([^/]+)/), [pathname]);
  const venueId = useMemo(() => extractIdFromPath(/^\/venue\/([^/]+)/), [pathname]);
  const organizationId = useMemo(() => extractIdFromPath(/^\/organization\/([^/]+)/), [pathname]);

  // Limpa o selectedVenue sempre que o venueId mudar
  useEffect(() => {
    if (venueId) {
      clearSelectedVenue();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [venueId]);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login", { replace: true, state: { from: location } });
      return;
    }

    // Aguarda o carregamento do usuário
    if (!userId) {
      setLoading(true);
      return;
    }

    let cancelled = false;

    const preloadEntities = async () => {
      setLoading(true);
      setError(null);
      setHasPermission(true); // por padrão

      try {
        if (proposalId) {
          // Proposal
          const currentProposal = useProposalStore.getState().currentProposal;
          if (!currentProposal || currentProposal.id !== proposalId) {
            await fetchProposalById(proposalId);
          }
          const proposal = useProposalStore.getState().currentProposal;
          if (!proposal || proposal.id !== proposalId) throw new Error("Proposta não encontrada");

          // Venue
          const currentVenue = useVenueStore.getState().selectedVenue;
          if (!currentVenue || currentVenue.id !== proposal.venueId) {
            await fetchVenueById(proposal.venueId, userId ?? "");
          }
          const venue = useVenueStore.getState().selectedVenue;
          if (!venue || venue.id !== proposal.venueId) throw new Error("Venue não encontrada");

          // Organization
          const currentOrg = useOrganizationStore.getState().currentOrganization;
          if (!currentOrg || currentOrg.id !== venue.organizationId) {
            await fetchOrganizationById(venue.organizationId);
          }

          if (requiredPermission) {
            await fetchCurrentUserVenuePermission({
              organizationId: venue.organizationId,
              venueId: venue.id,
              userId,
            });
          }
        } else if (venueId) {
          // Venue
          const currentVenue = useVenueStore.getState().selectedVenue;
          if (!currentVenue || currentVenue.id !== venueId) {
            await fetchVenueById(venueId, userId ?? "");
          }
          const venue = useVenueStore.getState().selectedVenue;
          if (!venue || venue.id !== venueId) throw new Error("Venue não encontrada");

          // Organization
          const currentOrg = useOrganizationStore.getState().currentOrganization;
          if (!currentOrg || currentOrg.id !== venue.organizationId) {
            await fetchOrganizationById(venue.organizationId);
          }

          if (requiredPermission) {
            await fetchCurrentUserVenuePermission({
              organizationId: venue.organizationId,
              venueId: venue.id,
              userId,
            });
          }
        } else if (organizationId) {
          // Organization
          const currentOrg = useOrganizationStore.getState().currentOrganization;
          if (!currentOrg || currentOrg.id !== organizationId) {
            await fetchOrganizationById(organizationId);
          }
          if (requiredPermission) {
            await fetchCurrentUserOrganizationPermission({ organizattionId: organizationId, userId });
          }
        } else {
          setHasPermission(true); // rota sem contexto de permissão específica
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
  }, [isAuthenticated, proposalId, venueId, organizationId, userId, fetchProposalById, fetchVenueById, fetchOrganizationById, fetchCurrentUserVenuePermission, fetchCurrentUserOrganizationPermission, navigate, location, requiredPermission]);

  // Checagem de permissão após o carregamento
  useEffect(() => {
    if (requiredPermission) {
      if (venueId || proposalId) {
        if (currentUserVenuePermission && !currentUserVenuePermission.permissions.includes(requiredPermission)) {
          setHasPermission(false);
        } else if (currentUserVenuePermission) {
          setHasPermission(true);
        }
      } else if (organizationId) {
        if (currentUserOrganizationPermission && !currentUserOrganizationPermission.permissions.includes(requiredPermission)) {
          setHasPermission(false);
        } else if (currentUserOrganizationPermission) {
          setHasPermission(true);
        }
      }
    }
  }, [currentUserVenuePermission, currentUserOrganizationPermission, requiredPermission, venueId, proposalId, organizationId]);

  if (!isAuthenticated || !userId) return <AppLoadingScreen />;
  if (loading) return <AppLoadingScreen />;
  if (error) return <AppErrorScreen message={error} />;
  if (!hasPermission) return <AccessDenied />;

  return children;
}