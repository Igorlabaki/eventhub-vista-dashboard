import { Link, useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { cn } from "@/lib/utils";
import {
  Edit,
  Clock,
  MessageCircle,
  Send,
  FileText,
  Calendar,
  DollarSign,
  Users,
  List,
  Ham,
  Clipboard,
  LayoutDashboard,
} from "lucide-react";
import { Proposal } from "@/types/proposal";
import { useUserVenuePermissionStore } from "@/store/userVenuePermissionStore";
import { proposalViewPermissions, proposalEditPermissions, Permissions } from "@/types/permissions";

interface ProposalNavProps {
  isCollapsed: boolean;
  onNavItemClick: () => void;
  proposal: Proposal;
}

interface NavItem {
  title: string;
  href?: string;
  action?: () => void;
  icon: React.ElementType;
  permissionRequired?: Permissions;
}

export function ProposalNav({
  isCollapsed,
  onNavItemClick,
  proposal,
}: ProposalNavProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUserVenuePermission } = useUserVenuePermissionStore();

  const proposalNavItems: NavItem[] = [
    {
      title: "Visão Geral",
      href: `/proposal/${proposal?.id}`,
      icon: LayoutDashboard,
      permissionRequired: Permissions.VIEW_PROPOSAL_INFO,
    },
    {
      title: "Editar",
      href: `/proposal/${proposal?.id}/edit`,
      icon: Edit,
      permissionRequired: Permissions.EDIT_VENUE_PROPOSALS,
    },
    {
      title: "Ver Histórico",
      href: `/proposal/${proposal?.id}/history`,
      icon: Clock,
      permissionRequired: Permissions.VIEW_PROPOSAL_HISTORY,
    },
    {
      title: "Entrar em contato",
      href: `/proposal/${proposal?.id}/send-message`,
      icon: MessageCircle,
      permissionRequired: Permissions.SEND_PROPOSAL_TEXT,
    },
    {
      title: "Enviar Orçamento",
      href: `/proposal/${proposal?.id}/send-proposal`,
      icon: Send,
      permissionRequired: Permissions.SEND_PROPOSAL_INFO,
    },
    {
      title: "Enviar Parceiros",
      href: `/proposal/${proposal?.id}/send-suppliers`,
      icon: Ham,
      permissionRequired: Permissions.SEND_PROPOSAL_INFO,
    },
    {
      title: "Gerar Contrato",
      href: `/proposal/${proposal?.id}/contract`,
      icon: FileText,
      permissionRequired: Permissions.SEND_PROPOSAL_INFO,
    },
    {
      title: "Agendar Data",
      href: `/proposal/${proposal?.id}/dates`,
      icon: Calendar,
      permissionRequired: Permissions.VIEW_PROPOSAL_DATES,
    },
    {
      title: "Efetuar Pagamento",
      href: `/proposal/${proposal?.id}/payment`,
      icon: DollarSign,
      permissionRequired: Permissions.VIEW_PROPOSAL_PAYMENTS,
    },
    {
      title: "Lista de Presença",
      href: `/proposal/${proposal?.id}/attendance-list`,
      icon: Users,
      permissionRequired: Permissions.VIEW_PROPOSAL_ATTENDANCE_LIST,
    },
    {
      title: "Programação",
      href: `/proposal/${proposal?.id}/schedule`,
      icon: List,
      permissionRequired: Permissions.VIEW_PROPOSAL_SCHEDULE,
    },
    {
      title: "Documentos",
      href: `/proposal/${proposal?.id}/documents`,
      icon: Clipboard,
      permissionRequired: Permissions.VIEW_PROPOSAL_DOCUMENTS,
    },
  ];

  // Função para verificar se o usuário tem a permissão necessária
  const hasPermission = (requiredPermission?: Permissions) => {
    if (!requiredPermission) return true; // Se não há permissão requerida, permite acesso
    if (!currentUserVenuePermission?.permissions) return false;
    return currentUserVenuePermission.permissions.includes(requiredPermission);
  };

  // Filtrar itens baseado nas permissões
  const filteredNavItems = proposalNavItems.filter(item => 
    hasPermission(item.permissionRequired)
  );

  // Verificar se a página atual é acessível e redirecionar se necessário
  useEffect(() => {
    if (!proposal?.id ) return;

    const currentPath = location.pathname;
    const currentItem = proposalNavItems.find(item => item.href === currentPath);
    
    // Se a página atual não existe ou o usuário não tem permissão
    if (!currentItem || !hasPermission(currentItem.permissionRequired)) {
      // Encontrar a primeira página disponível
      const firstAvailableItem = proposalNavItems.find(item => 
        hasPermission(item.permissionRequired)
      );
      
      // Redirecionar para a primeira página disponível
      if (firstAvailableItem) {
        navigate(firstAvailableItem.href);
      }
    }
  }, [location.pathname, currentUserVenuePermission?.permissions, proposal?.id]);

  if (!proposal) {
    return null;
  }

  return (
    <div className="pt-3 pb-1">
      {!isCollapsed && (
        <div className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
          {proposal?.completeClientName}
        </div>
      )}

      {filteredNavItems.map((item) =>
        item.href ? (
          <Link
            key={item.href}
            to={item.href}
            className={cn(
              "flex items-center px-3 py-2 mt-1 text-sm font-medium rounded-md hover:bg-eventhub-tertiary/20 hover:text-eventhub-primary",
              location.pathname === item.href
                ? "bg-eventhub-tertiary/30 text-eventhub-primary"
                : "text-gray-700"
            )}
            onClick={onNavItemClick}
          >
            <item.icon className="h-5 w-5 mr-2" />
            {!isCollapsed && <span>{item.title}</span>}
          </Link>
        ) : (
          <button
            key={item.title}
            type="button"
            className={cn(
              "flex items-center px-3 py-2 mt-1 text-sm font-medium rounded-md hover:bg-eventhub-tertiary/20 hover:text-eventhub-primary",
              "text-gray-700"
            )}
            onClick={() => {
              item.action?.();
              onNavItemClick();
            }}
          >
            <item.icon className="h-5 w-5 mr-2" />
            {!isCollapsed && <span>{item.title}</span>}
          </button>
        )
      )}
    </div>
  );
}

export default ProposalNav;
