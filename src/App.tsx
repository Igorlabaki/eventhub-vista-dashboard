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
import VenueOwners from "./pages/VenueOwners";
import VenueGoals from "./pages/VenueGoals";
import VenueContacts from "./pages/VenueContacts";
import NewBudget from "./pages/NewBudget";
import NotFound from "./pages/NotFound";
import { GoogleOAuthProvider } from '@react-oauth/google';
import Profile from "./pages/Profile";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

const queryClient = new QueryClient();

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

const App = () => (
  <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/index" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/organization/:id/venues" element={<OrganizationVenues />} />
            <Route path="/organization/:id/owners" element={<OrganizationOwners />} />
            <Route path="/organization/:id/permissions" element={<OrganizationPermissions />} />
            <Route path="/organization/:id/contracts" element={<OrganizationContracts />} />
            <Route path="/venue/notifications" element={<VenueNotifications />} />
            <Route path="/venue" element={<VenueDashboard />} />
            <Route path="/venue/website" element={<VenueWebsite />} />
            <Route path="/venue/budgets" element={<VenueBudgets />} />
            <Route path="/venue/new-budget" element={<NewBudget />} />
            <Route path="/venue/visits" element={<VenueVisits />} />
            <Route path="/venue/events" element={<VenueEvents />} />
            <Route path="/venue/reports" element={<VenueReports />} />
            <Route path="/venue/schedule" element={<VenueSchedule />} />
            <Route path="/venue/settings" element={<VenueSettings />} />
            <Route path="/venue/owners" element={<VenueOwners />} />
            <Route path="/venue/goals" element={<VenueGoals />} />
            <Route path="/venue/contacts" element={<VenueContacts />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  </GoogleOAuthProvider>
);

export default App;
