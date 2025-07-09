import { useEffect } from "react";
import { useUserStore } from "@/store/userStore";
import { userService } from "@/services/user.service";
import { useNavigate, useLocation } from "react-router-dom";

// Rotas públicas que não precisam de autenticação
const PUBLIC_ROUTES = [
  '/venue/:id/form',
  '/proposal/:id/guest-list',
  '/proposal/:id/worker-list', 
  '/proposal/:id/schedule-list',
  '/proposal/:id/view'
];

export function useBootstrapUser() {
  const user = useUserStore((state) => state.user);
  const setUser = useUserStore((state) => state.setUser);
  const setIsAuthenticated = useUserStore((state) => state.setIsAuthenticated);
  const navigate = useNavigate();
  const location = useLocation();

  // Verifica se a rota atual é pública
  const isPublicRoute = PUBLIC_ROUTES.some(route => {
    const routePattern = route.replace(/:[^/]+/g, '[^/]+');
    const regex = new RegExp(`^${routePattern}$`);
    return regex.test(location.pathname);
  });

  useEffect(() => {
    async function fetchUser() {
      const token = localStorage.getItem("@EventHub:token");
      if (token && !user) {
        const session = JSON.parse(localStorage.getItem("@EventHub:session") || "{}");
        if (session?.userId) {
          try {
            const userData = await userService.getById(session.userId);
            setUser(userData);
            setIsAuthenticated(true);
          } catch (error) {
            setUser(null);
            setIsAuthenticated(false);
            localStorage.removeItem("@EventHub:token");
            localStorage.removeItem("@EventHub:session");
            // Só redireciona para login se não for uma rota pública
            if (!isPublicRoute) {
              navigate("/login", { replace: true });
            }
          }
        }
      }
    }
    fetchUser();
  }, [user, setUser, setIsAuthenticated, navigate, isPublicRoute]);
} 