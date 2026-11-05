import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useUserStore } from "@/store/userStore";
import { useProposalStore } from "@/store/proposalStore";
import { useVenueStore } from "@/store/venueStore";
import { useOrganizationStore } from "@/store/organizationStore";
import { useUserVenuePermissionStore } from "@/store/userVenuePermissionStore";
import { useUserOrganizationPermissionStore } from "@/store/userOrganizationPermissionStore";
import { AppLoadingScreen } from "@/components/ui/AppLoadingScreen";
import { DashboardLayout } from "./DashboardLayout";
import AccessDenied from "./accessDenied";
import { PanelRouteGateInput, panelRouteGate } from "./panel-route-gate";

interface ProtectedRouteProps {
  children: JSX.Element;
  requiredPermission?: string;
}

function panelGateNow(input: Omit<
  PanelRouteGateInput,
  | "selectedVenueId"
  | "selectedVenueOrganizationId"
  | "currentProposalId"
  | "proposalVenueId"
  | "currentOrganizationId"
  | "venuePermission"
  | "organizationPermission"
>): PanelRouteGateInput {
  const venue = useVenueStore.getState().selectedVenue;
  const proposal = useProposalStore.getState().currentProposal;
  const organization = useOrganizationStore.getState().currentOrganization;
  return {
    ...input,
    selectedVenueId: venue?.id ?? null,
    selectedVenueOrganizationId: venue?.organizationId ?? null,
    currentProposalId: proposal?.id ?? null,
    proposalVenueId: proposal?.venueId ?? null,
    currentOrganizationId: organization?.id ?? null,
    venuePermission: useUserVenuePermissionStore.getState().currentUserVenuePermission,
    organizationPermission: useUserOrganizationPermissionStore.getState().currentUserOrganizationPermission,
  };
}

export function ProtectedRoute({ children, requiredPermission }: ProtectedRouteProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const isAuthenticated = useUserStore((state) => state.isAuthenticated);
  const user = useUserStore((state) => state.user);
  const userId = user?.id;

  const selectedVenue = useVenueStore((state) => state.selectedVenue);
  const currentProposal = useProposalStore((state) => state.currentProposal);
  const currentOrganization = useOrganizationStore((state) => state.currentOrganization);
  const currentUserVenuePermission = useUserVenuePermissionStore((state) => state.currentUserVenuePermission);
  const currentUserOrganizationPermission = useUserOrganizationPermissionStore((state) => state.currentUserOrganizationPermission);

  const { fetchProposalById } = useProposalStore();
  const { fetchVenueById, clearSelectedVenue } = useVenueStore();
  const { fetchOrganizationById } = useOrganizationStore();
  const { fetchCurrentUserVenuePermission, setCurrentUserVenuePermission } = useUserVenuePermissionStore();
  const { fetchCurrentUserOrganizationPermission, setCurrentUserOrganizationPermission } = useUserOrganizationPermissionStore();

  const [error, setError] = useState<string | null>(null);
  const errorRef = useRef(error);
  errorRef.current = error;

  const pathname = location.pathname;
  const proposalId = useMemo(() => pathname.match(/^\/proposal\/([^/]+)/)?.[1] ?? null, [pathname]);
  const venueId = useMemo(() => pathname.match(/^\/venue\/([^/]+)/)?.[1] ?? null, [pathname]);
  const organizationId = useMemo(() => pathname.match(/^\/organization\/([^/]+)/)?.[1] ?? null, [pathname]);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login", { replace: true, state: { from: location } });
      return;
    }

    if (!userId) return;

    const known = panelRouteGate(panelGateNow({
      isAuthenticated,
      hasUser: true,
      requiredPermission,
      venueId,
      proposalId,
      organizationId,
      error: null,
    }));
    if (known === "ready" || known === "denied") {
      if (errorRef.current) setError(null);
      return;
    }
    if (errorRef.current) setError(null);

    let cancelled = false;

    const preloadEntities = async () => {
      try {
        if (venueId) {
          const currentVenue = useVenueStore.getState().selectedVenue;
          if (currentVenue && currentVenue.id !== venueId) clearSelectedVenue();
          const permission = useUserVenuePermissionStore.getState().currentUserVenuePermission;
          if (permission?.venueId && permission.venueId !== venueId) setCurrentUserVenuePermission(null);
        }
        if (organizationId) {
          const currentOrg = useOrganizationStore.getState().currentOrganization;
          if (!currentOrg || currentOrg.id !== organizationId) setCurrentUserOrganizationPermission(null);
        }

        if (proposalId) {
          const currentProposalState = useProposalStore.getState().currentProposal;
          if (!currentProposalState || currentProposalState.id !== proposalId) {
            await fetchProposalById(proposalId);
          }
          const proposal = useProposalStore.getState().currentProposal;
          if (!proposal || proposal.id !== proposalId) throw new Error("Proposta não encontrada");

          const currentVenue = useVenueStore.getState().selectedVenue;
          if (!currentVenue || currentVenue.id !== proposal.venueId) {
            await fetchVenueById(proposal.venueId, userId);
          }
          const venue = useVenueStore.getState().selectedVenue;
          if (!venue || venue.id !== proposal.venueId) throw new Error("Venue não encontrada");

          const currentOrg = useOrganizationStore.getState().currentOrganization;
          if (!currentOrg || currentOrg.id !== venue.organizationId) {
            await fetchOrganizationById(venue.organizationId);
          }

          if (requiredPermission) {
            const permission = useUserVenuePermissionStore.getState().currentUserVenuePermission;
            if (!permission || permission.venueId !== venue.id) {
              await fetchCurrentUserVenuePermission({
                organizationId: venue.organizationId,
                venueId: venue.id,
                userId,
              });
              const loaded = useUserVenuePermissionStore.getState().currentUserVenuePermission;
              if (loaded && !loaded.venueId) setCurrentUserVenuePermission({ ...loaded, venueId: venue.id });
            }
          }
        } else if (venueId) {
          const currentVenue = useVenueStore.getState().selectedVenue;
          if (!currentVenue || currentVenue.id !== venueId) {
            await fetchVenueById(venueId, userId);
          }
          const venue = useVenueStore.getState().selectedVenue;
          if (!venue || venue.id !== venueId) throw new Error("Venue não encontrada");

          const currentOrg = useOrganizationStore.getState().currentOrganization;
          if (!currentOrg || currentOrg.id !== venue.organizationId) {
            await fetchOrganizationById(venue.organizationId);
          }

          if (requiredPermission) {
            const permission = useUserVenuePermissionStore.getState().currentUserVenuePermission;
            if (!permission || permission.venueId !== venue.id) {
              await fetchCurrentUserVenuePermission({
                organizationId: venue.organizationId,
                venueId: venue.id,
                userId,
              });
              const loaded = useUserVenuePermissionStore.getState().currentUserVenuePermission;
              if (loaded && !loaded.venueId) setCurrentUserVenuePermission({ ...loaded, venueId: venue.id });
            }
          }
        } else if (organizationId) {
          const currentOrg = useOrganizationStore.getState().currentOrganization;
          if (!currentOrg || currentOrg.id !== organizationId) {
            await fetchOrganizationById(organizationId);
          }
          if (requiredPermission) {
            const permission = useUserOrganizationPermissionStore.getState().currentUserOrganizationPermission;
            if (!permission || permission.organizationId !== organizationId) {
              await fetchCurrentUserOrganizationPermission({ organizattionId: organizationId, userId });
              const loaded = useUserOrganizationPermissionStore.getState().currentUserOrganizationPermission;
              if (loaded && loaded.organizationId !== organizationId) {
                setCurrentUserOrganizationPermission({ ...loaded, organizationId });
              }
            }
          }
        }

        if (!cancelled) {
          const after = panelRouteGate(panelGateNow({
            isAuthenticated: true,
            hasUser: true,
            requiredPermission,
            venueId,
            proposalId,
            organizationId,
            error: null,
          }));
          if (after === "content") setError("Não foi possível carregar esta página.");
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Erro ao carregar dados");
        }
      }
    };

    preloadEntities();

    return () => {
      cancelled = true;
    };
  }, [
    isAuthenticated,
    proposalId,
    venueId,
    organizationId,
    userId,
    fetchProposalById,
    fetchVenueById,
    fetchOrganizationById,
    fetchCurrentUserVenuePermission,
    fetchCurrentUserOrganizationPermission,
    setCurrentUserVenuePermission,
    setCurrentUserOrganizationPermission,
    clearSelectedVenue,
    navigate,
    location,
    requiredPermission,
  ]);

  const gateInput = {
    isAuthenticated,
    hasUser: Boolean(userId),
    requiredPermission,
    venueId,
    proposalId,
    organizationId,
    selectedVenueId: selectedVenue?.id ?? null,
    selectedVenueOrganizationId: selectedVenue?.organizationId ?? null,
    currentProposalId: currentProposal?.id ?? null,
    proposalVenueId: currentProposal?.venueId ?? null,
    currentOrganizationId: currentOrganization?.id ?? null,
    venuePermission: currentUserVenuePermission,
    organizationPermission: currentUserOrganizationPermission,
  };
  const liveGate = panelRouteGate({ ...gateInput, error: null });
  const gate = liveGate === "ready" || liveGate === "denied"
    ? liveGate
    : panelRouteGate({ ...gateInput, error });

  if (gate === "session") return <AppLoadingScreen />;
  if (gate === "content") {
    return (
      <DashboardLayout>
        <div
          className="flex min-h-[50vh] items-center justify-center"
          data-panel-loading="content"
          role="status"
        >
          <Loader2 className="h-8 w-8 animate-spin text-eventhub-primary" />
          <span className="sr-only">Carregando</span>
        </div>
      </DashboardLayout>
    );
  }
  if (gate === "error") {
    return (
      <DashboardLayout title="Erro">
        <p className="text-center text-red-700">{error}</p>
      </DashboardLayout>
    );
  }
  if (gate === "denied") return <AccessDenied />;

  return children;
}
