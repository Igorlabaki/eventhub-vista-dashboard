
import { useState } from "react";
import { Link, useLocation, useParams, useNavigate } from "react-router-dom";
import {
  Calendar,
  ChevronRight,
  ClipboardList,
  CreditCard,
  Home,
  LayoutDashboard,
  Menu,
  Settings,
  Users,
  BarChart,
  Bell,
  FileText,
  Building,
  Edit,
  Trash2,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

type NavItem = {
  title: string;
  href: string;
  icon: React.ElementType;
  action?: () => void;
};

const venueNavItems: NavItem[] = [
  {
    title: "Visão Geral",
    href: "/venue",
    icon: LayoutDashboard,
  },
  {
    title: "Orçamentos",
    href: "/venue/budgets",
    icon: ClipboardList,
  },
  {
    title: "Eventos",
    href: "/venue/events",
    icon: Calendar,
  },
  {
    title: "Visitas",
    href: "/venue/visits",
    icon: Users,
  },
  {
    title: "Contratos",
    href: "/venue/contracts",
    icon: FileText,
  },
  {
    title: "Pagamentos",
    href: "/venue/payments",
    icon: CreditCard,
  },
  {
    title: "Notificações",
    href: "/venue/notifications",
    icon: Bell,
  },
  {
    title: "Relatórios",
    href: "/venue/reports",
    icon: BarChart,
  },
  {
    title: "Configurações",
    href: "/venue/settings",
    icon: Settings,
  },
];

export function SidebarNav({
  showOnMobile = false,
  onClose,
}: {
  showOnMobile?: boolean;
  onClose?: () => void;
}) {
  const location = useLocation();
  const params = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isCollapsed, setIsCollapsed] = useState(false);
  
  // State for dialogs
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [organizationName, setOrganizationName] = useState("Best Eventos Ltda");
  
  // Determine if we're in a venue section
  const isInVenue = location.pathname.startsWith('/venue');
  
  // Determine if we're in an organization section
  const isInOrg = location.pathname.includes('/organization/');
  
  // Get organization ID from URL params
  const organizationId = params.id;

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const handleNavItemClick = () => {
    if (showOnMobile && onClose) {
      onClose();
    }
  };
  
  const handleDeleteOrganization = () => {
    // Open delete confirmation dialog
    setDeleteDialogOpen(true);
  };
  
  const handleConfirmDelete = () => {
    // Here we would call an API to delete the organization
    toast({
      title: "Sucesso",
      description: "Organização excluída com sucesso."
    });
    setDeleteDialogOpen(false);
    
    // Navigate back to dashboard
    navigate('/dashboard');
  };
  
  const handleEditOrganization = () => {
    setEditDialogOpen(true);
  };
  
  const handleSaveEdit = () => {
    if (!organizationName.trim()) {
      toast({
        title: "Erro",
        description: "O nome da organização não pode estar vazio."
      });
      return;
    }
    
    // Here we would call an API to update the organization name
    toast({
      title: "Sucesso",
      description: "Nome da organização atualizado com sucesso!"
    });
    setEditDialogOpen(false);
  };
  
  // Create organization action items dynamically
  const organizationActionItems: NavItem[] = [
    {
      title: "Editar Organização",
      href: "#",
      icon: Edit,
      action: handleEditOrganization
    },
    {
      title: "Espaços",
      href: `/organization/${organizationId}/venues`,
      icon: Building,
    },
    {
      title: "Permissões",
      href: `/organization/${organizationId}/permissions`,
      icon: Users,
    },
    {
      title: "Proprietários",
      href: `/organization/${organizationId}/owners`,
      icon: User,
    },
    {
      title: "Contratos",
      href: `/organization/${organizationId}/contracts`,
      icon: FileText,
    },
    {
      title: "Deletar Organização",
      href: "#",
      icon: Trash2,
      action: handleDeleteOrganization
    },
  ];

  return (
    <>
      <div
        className={cn(
          "flex flex-col h-full border-r bg-white transition-all duration-300",
          isCollapsed ? "w-16" : "w-64",
          showOnMobile ? "block" : "hidden md:flex"
        )}
      >
        <div className="flex items-center justify-between h-16 px-4 border-b">
          <div className="flex items-center">
            <Calendar className="h-6 w-6 text-eventhub-primary" />
            {!isCollapsed && (
              <span className="ml-2 font-bold text-eventhub-primary">EventHub</span>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="md:flex hidden"
            onClick={toggleSidebar}
          >
            <ChevronRight
              className={cn(
                "h-4 w-4 transition-transform",
                isCollapsed ? "" : "rotate-180"
              )}
            />
          </Button>
          {showOnMobile && onClose && (
            <Button variant="ghost" size="icon" onClick={onClose}>
              <Menu className="h-4 w-4" />
            </Button>
          )}
        </div>

        <div className="flex flex-col flex-1 overflow-y-auto py-4">
          <nav className="flex-1 px-2 space-y-1">
            <Link
              to="/dashboard"
              className={cn(
                "flex items-center px-3 py-2 text-sm font-medium rounded-md hover:bg-eventhub-tertiary/20 hover:text-eventhub-primary",
                location.pathname === "/dashboard"
                  ? "bg-eventhub-tertiary/30 text-eventhub-primary"
                  : "text-gray-700"
              )}
              onClick={handleNavItemClick}
            >
              <Building className="h-5 w-5 mr-2" />
              {!isCollapsed && <span>Organizações</span>}
            </Link>

            {isInOrg && !isCollapsed && (
              <div className="pt-3 pb-1">
                <div className="px-3 mt-4 mb-2 text-sm font-semibold text-eventhub-primary">
                  {organizationName}
                </div>
                
                {organizationActionItems.map((item) => (
                  <Link
                    key={item.title}
                    to={item.href}
                    onClick={(e) => {
                      if (item.action) {
                        e.preventDefault();
                        item.action();
                      }
                      handleNavItemClick();
                    }}
                    className={cn(
                      "flex w-full items-center px-3 py-2 mt-1 text-sm font-medium rounded-md hover:bg-eventhub-tertiary/20 hover:text-eventhub-primary",
                      location.pathname === item.href
                        ? "bg-eventhub-tertiary/30 text-eventhub-primary"
                        : "text-gray-700"
                    )}
                  >
                    <item.icon className="h-5 w-5 mr-2" />
                    <span>{item.title}</span>
                  </Link>
                ))}
              </div>
            )}

            {isInVenue && (
              <div className="pt-3 pb-1">
                {!isCollapsed && (
                  <div className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Espaço atual
                  </div>
                )}

                {venueNavItems.map((item) => (
                  <Link
                    key={item.href}
                    to={item.href}
                    className={cn(
                      "flex items-center px-3 py-2 mt-1 text-sm font-medium rounded-md hover:bg-eventhub-tertiary/20 hover:text-eventhub-primary",
                      location.pathname === item.href
                        ? "bg-eventhub-tertiary/30 text-eventhub-primary"
                        : "text-gray-700"
                    )}
                    onClick={handleNavItemClick}
                  >
                    <item.icon className="h-5 w-5 mr-2" />
                    {!isCollapsed && <span>{item.title}</span>}
                  </Link>
                ))}
              </div>
            )}
          </nav>
        </div>
      </div>
      
      {/* Edit Organization Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Organização</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Nome da Organização</Label>
              <Input
                id="name"
                value={organizationName}
                onChange={(e) => setOrganizationName(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleSaveEdit}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Organization Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Essa ação não pode ser desfeita. Esta operação irá excluir permanentemente a organização "{organizationName}" e todos os seus dados associados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} className="bg-red-600 hover:bg-red-700">
              Deletar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
