import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useUserStore } from "@/store/userStore";
import { useProposalStore } from "@/store/proposalStore";
import { useVenueStore } from "@/store/venueStore";
import { useOrganizationStore } from "@/store/organizationStore";
import { Calendar } from "lucide-react";
import { AppLoadingScreen } from "@/components/ui/AppLoadingScreen";

export function ProtectedRoute({ children }: { children: JSX.Element }) {
  const navigate = useNavigate();
  const location = useLocation();

  const isAuthenticated = useUserStore((state) => state.isAuthenticated);
  const userId = useUserStore((state) => state.user?.id);

  const { currentProposal, fetchProposalById } = useProposalStore();
  const { selectedVenue, fetchVenueById } = useVenueStore();
  const { currentOrganization, fetchOrganizationById } = useOrganizationStore();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pathname = location.pathname;

  function extractIdFromPath(pattern: RegExp): string | null {
    const match = pathname.match(pattern);
    return match ? match[1] : null;
  }

  const proposalId = extractIdFromPath(/^\/proposal\/([^/]+)/);
  const venueId = extractIdFromPath(/^\/venue\/([^/]+)/);
  const organizationId = extractIdFromPath(/^\/organization\/([^/]+)/);

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
          if (!currentProposal || currentProposal.id !== proposalId) {
            await fetchProposalById(proposalId);
          }
          const proposal = currentProposal && currentProposal.id === proposalId ? currentProposal : undefined;
          if (!proposal) throw new Error("Proposal não encontrada");

          if (!selectedVenue || selectedVenue.id !== proposal.venueId) {
            await fetchVenueById(proposal.venueId, userId ?? "");
          }
          const venue = selectedVenue && selectedVenue.id === proposal.venueId ? selectedVenue : undefined;
          if (!venue) throw new Error("Venue não encontrada");

          if (!currentOrganization || currentOrganization.id !== venue.organizationId) {
            await fetchOrganizationById(venue.organizationId);
          }
          const organization = currentOrganization && currentOrganization.id === venue.organizationId ? currentOrganization : undefined;
          if (!organization) throw new Error("Organização não encontrada");
        } else if (venueId) {
          if (!selectedVenue || selectedVenue.id !== venueId) {
            await fetchVenueById(venueId, userId ?? "");
          }
          const venue = selectedVenue && selectedVenue.id === venueId ? selectedVenue : undefined;
          if (!venue) throw new Error("Venue não encontrada");

          if (!currentOrganization || currentOrganization.id !== venue.organizationId) {
            await fetchOrganizationById(venue.organizationId);
          }
          const organization = currentOrganization && currentOrganization.id === venue.organizationId ? currentOrganization : undefined;
          if (!organization) throw new Error("Organização não encontrada");
        } else if (organizationId) {
          if (!currentOrganization || currentOrganization.id !== organizationId) {
            await fetchOrganizationById(organizationId);
          }
          const organization = currentOrganization && currentOrganization.id === organizationId ? currentOrganization : undefined;
          if (!organization) throw new Error("Organização não encontrada");
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
  }, [isAuthenticated, pathname, currentProposal, selectedVenue, currentOrganization, fetchProposalById, fetchVenueById, fetchOrganizationById, userId, location]);

  function LoadingScreen() {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #f5f6fa 0%, #e9eafc 100%)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <Calendar className="h-14 w-14 animate-bounce text-eventhub-primary" />
          <span style={{ fontWeight: 700, fontSize: 36, color: '#5b21b6', letterSpacing: 1 }}>EventHub</span>
        </div>
        <div className="loader-spinner" style={{ marginTop: 24 }}>
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="24" cy="24" r="20" stroke="#a5b4fc" strokeWidth="6" opacity="0.3" />
            <path d="M44 24c0-11.046-8.954-20-20-20" stroke="#5b21b6" strokeWidth="6" strokeLinecap="round">
              <animateTransform attributeName="transform" type="rotate" from="0 24 24" to="360 24 24" dur="1s" repeatCount="indefinite" />
            </path>
          </svg>
        </div>
        <div style={{ marginTop: 32, color: '#5b21b6', fontWeight: 500, fontSize: 18, letterSpacing: 0.5 }}>Carregando plataforma...</div>
      </div>
    );
  }

  if (!isAuthenticated) return null;
  if (loading) return <AppLoadingScreen />;
  if (error) return <div>Erro: {error}</div>;

  return children;
}