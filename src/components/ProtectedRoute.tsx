import { useEffect, useState, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useUserStore } from "@/store/userStore";
import { useProposalStore } from "@/store/proposalStore";
import { useVenueStore } from "@/store/venueStore";
import { useOrganizationStore } from "@/store/organizationStore";

import { AppLoadingScreen } from "@/components/ui/AppLoadingScreen";

export function ProtectedRoute({ children }: { children: JSX.Element }) {
  const navigate = useNavigate();
  const location = useLocation();

  const isAuthenticated = useUserStore((state) => state.isAuthenticated);
  const userId = useUserStore((state) => state.user?.id);

  const { fetchProposalById } = useProposalStore();
  const { fetchVenueById } = useVenueStore();
  const { fetchOrganizationById } = useOrganizationStore();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pathname = location.pathname;

  function extractIdFromPath(pattern: RegExp): string | null {
    const match = pathname.match(pattern);
    return match ? match[1] : null;
  }

  const proposalId = useMemo(() => extractIdFromPath(/^\/proposal\/([^/]+)/), [pathname]);
  const venueId = useMemo(() => extractIdFromPath(/^\/venue\/([^/]+)/), [pathname]);
  const organizationId = useMemo(() => extractIdFromPath(/^\/organization\/([^/]+)/), [pathname]);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login", { replace: true, state: { from: location } });
      return;
    }

    let cancelled = false;

    async function preloadEntities() {
      setLoading(true);
      setError(null);

      try {
        if (proposalId) {
          // Sempre buscar a proposal se temos um ID
          await fetchProposalById(proposalId);
          
          // Aguardar um pouco para garantir que os dados foram atualizados
          await new Promise(resolve => setTimeout(resolve, 100));
          
          // Buscar venue e organization baseado na proposal
          const proposal = useProposalStore.getState().currentProposal;
          if (proposal && proposal.id === proposalId) {
            await fetchVenueById(proposal.venueId, userId ?? "");
            
            await new Promise(resolve => setTimeout(resolve, 100));
            
            const venue = useVenueStore.getState().selectedVenue;
            if (venue && venue.id === proposal.venueId) {
              await fetchOrganizationById(venue.organizationId);
            }
          }
        } else if (venueId) {
          // Sempre buscar a venue se temos um ID
          await fetchVenueById(venueId, userId ?? "");
          
          await new Promise(resolve => setTimeout(resolve, 100));
          
          // Buscar organization baseado na venue
          const venue = useVenueStore.getState().selectedVenue;
          if (venue && venue.id === venueId) {
            await fetchOrganizationById(venue.organizationId);
          }
        } else if (organizationId) {
          // Sempre buscar a organization se temos um ID
          await fetchOrganizationById(organizationId);
        }
      } catch (err) {
        if (!cancelled) {
          if (err instanceof Error) {
            setError(err.message || "Erro ao carregar dados");
          } else {
            setError("Erro ao carregar dados");
          }
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    preloadEntities();
    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, proposalId, venueId, organizationId, userId]);



  if (!isAuthenticated) return null;
  if (loading) return <AppLoadingScreen />;
  if (error) return <div>Erro: {error}</div>;

  return children;
}