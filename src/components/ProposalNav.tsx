import { Link, useLocation } from "react-router-dom";
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
  Clipboard,
  LayoutDashboard,
} from "lucide-react";
import { Proposal } from "@/types/proposal";

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
}

export function ProposalNav({
  isCollapsed,
  onNavItemClick,
  proposal,
}: ProposalNavProps) {
  const location = useLocation();

  const proposalNavItems: NavItem[] = [
    {
      title: "Visão Geral",
      href: `/proposal/${proposal?.id}`,
      icon: LayoutDashboard,
    },
    {
      title: "Editar",
      href: `/proposal/${proposal?.id}/edit`,
      icon: Edit,
    },
    {
      title: "Ver Histórico",
      href: `/proposal/${proposal?.id}/history`,
      icon: Clock,
    },
    {
      title: "Entrar em contato",
      href: `/proposal/${proposal?.id}/send-message`,
      icon: MessageCircle,
    },
    {
      title: "Enviar Orçamento",
      href: `/proposal/${proposal?.id}/send-proposal`,
      icon: Send,
    },
    {
      title: "Enviar Contrato",
      href: `/proposal/${proposal?.id}/contract`,
      icon: FileText,
    },
    {
      title: "Agendar Data",
      href: `/proposal/${proposal?.id}/dates`,
      icon: Calendar,
    },
    {
      title: "Efetuar Pagamento",
      href: `/proposal/${proposal?.id}/payment`,
      icon: DollarSign,
    },
    {
      title: "Lista de Presença",
      href: `/proposal/${proposal?.id}/attendance-list`,
      icon: Users,
    },
    {
      title: "Programação",
      href: `/proposal/${proposal?.id}/schedule`,
      icon: List,
    },
    {
      title: "Documentos",
      href: `/proposal/${proposal?.id}/documents`,
      icon: Clipboard,
    },
  ];

  return (
    <div className="pt-3 pb-1">
      {!isCollapsed && (
        <div className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
          {proposal?.completeClientName}
        </div>
      )}

      {proposalNavItems.map((item) =>
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
