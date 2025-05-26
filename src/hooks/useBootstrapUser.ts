import { useEffect } from "react";
import { useUserStore } from "@/store/userStore";
import { userService } from "@/services/user.service";
import { useNavigate } from "react-router-dom";

export function useBootstrapUser() {
  const user = useUserStore((state) => state.user);
  const setUser = useUserStore((state) => state.setUser);
  const setIsAuthenticated = useUserStore((state) => state.setIsAuthenticated);
  const navigate = useNavigate();

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
            navigate("/login", { replace: true });
          }
        }
      }
    }
    fetchUser();
  }, [user, setUser, setIsAuthenticated, navigate]);
} 