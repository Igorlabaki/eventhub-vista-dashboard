import { useEffect, useState } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, Bell, User, LogOut } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SidebarNav } from "./SidebarNav";
import { useOrganizationStore } from "@/store/organizationStore";
import { authService } from "@/services/auth.service";
import { useQueryClient } from "@tanstack/react-query";
import { useUserStore } from "@/store/userStore";
import { useVenueStore } from "@/store/venueStore";

interface HeaderProps {
  title?: string;
  subtitle?: string;
}

export function Header({ title, subtitle }: HeaderProps) {
  const user = useUserStore((state) => state.user);
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();
  
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Verifica se está em uma rota de organização ou venue
  const isOrganizationRoute = location.pathname.includes('/organization/');
  const isVenueRoute = location.pathname.includes('/venue/');

  // Obtém o ID da organização ou venue dos parâmetros
  const organizationId = isOrganizationRoute ? params.id : undefined;
  const venueId = isVenueRoute ? params.id : undefined;

  // Busca os dados da organização ou venue
  const { currentOrganization, fetchOrganizationById } = useOrganizationStore();
  const { selectedVenue, fetchVenueById } = useVenueStore();

  useEffect(() => {
    if (isVenueRoute && venueId && user?.id) {
      fetchVenueById(venueId, user.id);
    }
  }, [isVenueRoute, venueId, user?.id, fetchVenueById]);

  useEffect(() => {
    if (organizationId) {
      fetchOrganizationById(organizationId);
    }
  }, [organizationId, fetchOrganizationById]);



  const logout = () => {
    authService.logout();
    navigate("/login");
  };

  return (
    <>
      <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 sm:px-6 border-b bg-white">
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileMenuOpen(true)}
          >
            <Menu className="h-6 w-6" />
            <span className="sr-only">Open menu</span>
          </Button>

          <div className="ml-4">
            {title && <h1 className="text-xl font-bold text-gray-800">{title}</h1>}
            {subtitle && <p className="text-sm text-gray-500 hidden md:block">{subtitle}</p>}
          </div>
        </div>

        <div className="flex items-center gap-2  md:gap-4">
          {user && <p className="text-sm text-gray-500 hidden md:block">Bem vindo, {user.username}</p>}
       {/*    <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-red-500" />
          </Button> */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <Avatar className="h-10 w- 10">
                  <AvatarImage src={user?.avatarUrl} alt="Usuário" />
                  <AvatarFallback className="bg-eventhub-primary text-white">
                    {user?.username?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <div className="flex items-center justify-start p-2">
                <div className="flex flex-col space-y-1">
                  <p className="font-medium text-sm">{user?.username}</p>
                  <p className="text-xs text-gray-500">{user?.email}</p>
                </div>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate("/profile")}>
                <User className="mr-2 h-4 w-4" />
                <span>Meu Perfil</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={logout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Sair</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Mobile navigation */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 flex">
          <div className="fixed inset-0 bg-black/30" onClick={() => setMobileMenuOpen(false)} />
          <div className="relative flex w-full max-w-xs flex-1 flex-col ">
            <SidebarNav showOnMobile={true} onClose={() => setMobileMenuOpen(false)} />
          </div>
        </div>
      )}
    </>
  );
}
