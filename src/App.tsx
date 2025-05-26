import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import OrganizationVenues from "./pages/OrganizationVenues";
import OrganizationOwners from "./pages/OrganizationOwners";
import OrganizationPermissions from "./pages/OrganizationPermissions";
import OrganizationContracts from "./pages/OrganizationContracts";
import VenueDashboard from "./pages/VenueDashboard";
import VenueBudgets from "./pages/VenueBudgets";
import VenueNotifications from "./pages/VenueNotifications";
import VenueWebsite from "./pages/VenueWebsite";
import VenueVisits from "./pages/VenueVisits";
import VenueEvents from "./pages/VenueEvents";
import VenueReports from "./pages/VenueReports";
import VenueSchedule from "./pages/VenueSchedule";
import VenueSettings from "./pages/VenueSettings";
import VenueGoals from "./pages/VenueGoals";
import VenueContacts from "./pages/VenueContacts";
import NewBudget from "./pages/NewBudget";
import NotFound from "./pages/NotFound";
import { GoogleOAuthProvider } from '@react-oauth/google';
import Profile from "./pages/Profile";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useBootstrapUser } from "@/hooks/useBootstrapUser";

const queryClient = new QueryClient();

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

function AppInitializer() {
  useBootstrapUser();
  return null;
}

const App = () => {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AppInitializer />
            <Routes>
              <Route path="/" element={<Navigate to="/login" replace />} />
              <Route path="/index" element={<Index />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/organization/:id/venues" element={<ProtectedRoute><OrganizationVenues /></ProtectedRoute>} />
              <Route path="/organization/:id/owners" element={<ProtectedRoute><OrganizationOwners /></ProtectedRoute>} />
              <Route path="/organization/:id/permissions" element={<ProtectedRoute><OrganizationPermissions /></ProtectedRoute>} />
              <Route path="/organization/:id/contracts" element={<ProtectedRoute><OrganizationContracts /></ProtectedRoute>} />
              <Route path="/venue/:id/notifications" element={<ProtectedRoute><VenueNotifications /></ProtectedRoute>} />
              <Route path="/venue/:id" element={<ProtectedRoute><VenueDashboard /></ProtectedRoute>} />
              <Route path="/venue/:id/website" element={<ProtectedRoute><VenueWebsite /></ProtectedRoute>} />
              <Route path="/venue/:id/budgets" element={<ProtectedRoute><VenueBudgets /></ProtectedRoute>} />
              <Route path="/venue/:id/new-budget" element={<ProtectedRoute><NewBudget /></ProtectedRoute>} />
              <Route path="/venue/:id/visits" element={<ProtectedRoute><VenueVisits /></ProtectedRoute>} />
              <Route path="/venue/:id/events" element={<ProtectedRoute><VenueEvents /></ProtectedRoute>} />
              <Route path="/venue/:id/reports" element={<ProtectedRoute><VenueReports /></ProtectedRoute>} />
              <Route path="/venue/:id/schedule" element={<ProtectedRoute><VenueSchedule /></ProtectedRoute>} />
              <Route path="/venue/:id/settings" element={<ProtectedRoute><VenueSettings /></ProtectedRoute>} />
              <Route path="/venue/:id/goals" element={<ProtectedRoute><VenueGoals /></ProtectedRoute>} />
              <Route path="/venue/:id/contacts" element={<ProtectedRoute><VenueContacts /></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </GoogleOAuthProvider>
  );
};

export default App;
