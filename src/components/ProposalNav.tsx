import { useEffect } from "react";
import type { ElementType } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Calendar,
  Clipboard,
  Clock,
  DollarSign,
  Edit,
  FileText,
  Ham,
  LayoutDashboard,
  Link2,
  List,
  MessageCircle,
  Send,
  Users,
} from "lucide-react";
import { proposalEventLinksUrl } from "@/lib/event-link";
import { Proposal } from "@/types/proposal";
import { useUserVenuePermissionStore } from "@/store/userVenuePermissionStore";
import { Permissions } from "@/types/permissions";
import { SectionedNav } from "@/components/sidebar/SectionedNav";
import {
  flatNavItems,
  internalItemHref,
  presentNavItems,
  proposalSections,
  visibleSections,
} from "@/components/sidebar/sidebar-nav-model";

interface ProposalNavProps {
  isCollapsed: boolean;
  onNavItemClick: () => void;
  proposal: Proposal;
  hold?: boolean;
}

const proposalIcons: Record<string, ElementType> = {
  "Visão Geral": LayoutDashboard,
  Editar: Edit,
  "Ver Histórico": Clock,
  "Entrar em contato": MessageCircle,
  "Enviar Orçamento": Send,
  "Link do evento": Link2,
  "Indicar parceiros": Ham,
  "Gerar Contrato": FileText,
  "Agendar Data": Calendar,
  "Efetuar Pagamento": DollarSign,
  "Lista de Presença": Users,
  Programação: List,
  Documentos: Clipboard,
};

export function ProposalNav({
  isCollapsed,
  onNavItemClick,
  proposal,
  hold = false,
}: ProposalNavProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUserVenuePermission } = useUserVenuePermissionStore();
  const permissions = currentUserVenuePermission?.permissions;
  const base = `/proposal/${proposal?.id}`;

  const canSee = (permission?: Permissions) => {
    if (!permission) return true;
    if (!permissions) return false;
    return permissions.includes(permission);
  };

  const sections = visibleSections(proposalSections, canSee);

  useEffect(() => {
    if (hold || !proposal?.id) return;

    const allowed = flatNavItems(
      visibleSections(proposalSections, (permission) => {
        if (!permission) return true;
        if (!permissions) return false;
        return permissions.includes(permission);
      }),
    );
    const current = allowed.find((item) => internalItemHref(base, item) === location.pathname);
    if (!current) {
      const next = allowed
        .map((item) => internalItemHref(base, item))
        .find((href): href is string => typeof href === "string");
      if (next) navigate(next);
    }
  }, [hold, location.pathname, permissions, proposal?.id, base, navigate]);

  if (!proposal) {
    return null;
  }

  return (
    <SectionedNav
      heading={proposal.completeClientName}
      sections={sections.map((section) => ({
        ...section,
        items: presentNavItems(section.items, base, proposalIcons, (item) =>
          item.opensExternalUrl && proposal.id ? proposalEventLinksUrl(proposal.id) : null,
        ),
      }))}
      isCollapsed={isCollapsed}
      collapsedMode="always-open"
      isActive={(href) => location.pathname === href}
      onNavigate={onNavItemClick}
    />
  );
}

export default ProposalNav;
