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
import OrganizationWebsite from "./pages/OrganizationWebsite";
import VenueDashboard from "./pages/VenueDashboard";
import VenueBudgets from "./pages/VenueBudgets";
import VenueNotifications from "./pages/VenueNotifications";
import VenueWebsite from "./pages/VenueWebsite";
import VenueWebsiteTexts from "./pages/website/VenueWebsiteTexts";
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
import VenueServices from "./pages/VenueServices";
import ProposalDetails from "./pages/ProposalDetails";
import ProposalEdit from "./pages/ProposalEdit";
import ProposalHistory from "./pages/ProposalHistory";
import { ProposalPayment } from "@/components/proposal/proposal-payment";
import { ProposalSchedule } from "@/components/proposal/proposal-schedule";
import ProposalAttendanceListPage from "./pages/ProposalAttendanceList";
import { DateEventListPage } from "./pages/DateEventList";
import { ScheduleListPage } from "./pages/ScheduleList";
import ProposalDocuments from "./pages/ProposalDocuments";
import VenueExpenses from "./pages/VenueExpenses";
import VenueWebsiteFaq from "./pages/website/VenueWebsiteFaq";
import VenueWebsiteImages from "./pages/website/VenueWebsiteImages";
import OrganizationSettings from "./pages/OrganizationSettings";
import SendMessagePage from "./pages/SendMessagePage";
import SendProposalPage from "./pages/SendProposalPage";
import ProposalContract from "./pages/ProposalContract";
import OrganizationWebsiteTexts from "./pages/website/OrganizationWebsiteTexts";
import OrganizationWebsiteVenues from "./pages/website/OrganizationWebsiteVenues";
import GuestListPage from "./pages/GuestList";
import WorkerListPage from "./pages/WorkerList";
import ProposalView from "./pages/ProposalView";
import { ProposalForm } from "./pages/ProposalForm";
import { ScheduleSection } from "./components/schedule/schedule-section";
import ProposalSchedulePage from "./pages/ProposalSchedule";
import OrganizationPermissionsV2 from "./pages/OrganizationPermissionsv2";
import { ContarctPjFormPage } from "./pages/ContarctPjForm";
import { ContarctPFFormPage } from "./pages/ContarctPFForm";

const queryClient = new QueryClient();

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

function AppInitializer() {
  useBootstrapUser();
  return null;
}

const ProposalContact = () => <div>Entrar em contato</div>;
const ProposalSend = () => <div>Enviar Orçamento</div>;

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
              <Route path="/organization/:id/permissions" element={<ProtectedRoute><OrganizationPermissionsV2 /></ProtectedRoute>} />
              <Route path="/organization/:id/contracts" element={<ProtectedRoute><OrganizationContracts /></ProtectedRoute>} />
              <Route path="/organization/:id/settings" element={<ProtectedRoute><OrganizationSettings /></ProtectedRoute>} />
              <Route path="/organization/:id/website" element={<ProtectedRoute><OrganizationWebsite /></ProtectedRoute>} />
              <Route path="/organization/:id/website/venues" element={<ProtectedRoute><OrganizationWebsiteVenues /></ProtectedRoute>} />
              <Route path="/venue/:id/notifications" element={<ProtectedRoute><VenueNotifications /></ProtectedRoute>} />
              <Route path="/venue/:id" element={<ProtectedRoute><VenueDashboard /></ProtectedRoute>} />
              <Route path="/venue/:id/website" element={<ProtectedRoute><VenueWebsite /></ProtectedRoute>} />
              <Route path="/venue/:id/website/texts" element={<ProtectedRoute><VenueWebsiteTexts /></ProtectedRoute>} />
              <Route path="/organization/:id/website/texts" element={<ProtectedRoute><OrganizationWebsiteTexts /></ProtectedRoute>} />
              <Route path="/venue/:id/website/images" element={<ProtectedRoute><VenueWebsiteImages /></ProtectedRoute>} />
              <Route path="/organization/:organizationId/website/images" element={<ProtectedRoute><VenueWebsiteImages /></ProtectedRoute>} />
              <Route path="/venue/:id/website/faq" element={<ProtectedRoute><VenueWebsiteFaq /></ProtectedRoute>} />
              <Route path="/venue/:id/budgets" element={<ProtectedRoute><VenueBudgets /></ProtectedRoute>} />
              <Route path="/venue/:id/expenses" element={<ProtectedRoute><VenueExpenses /></ProtectedRoute>} />
              <Route path="/venue/:id/new-budget" element={<ProtectedRoute><NewBudget /></ProtectedRoute>} />
              <Route path="/venue/:id/services" element={<ProtectedRoute><VenueServices /></ProtectedRoute>} />
              <Route path="/venue/:id/events" element={<ProtectedRoute><VenueEvents /></ProtectedRoute>} />
              <Route path="/venue/:id/reports" element={<ProtectedRoute><VenueReports /></ProtectedRoute>} />
              <Route path="/venue/:id/schedule" element={<ProtectedRoute><VenueSchedule /></ProtectedRoute>} />
              <Route path="/venue/:id/settings" element={<ProtectedRoute><VenueSettings /></ProtectedRoute>} />
              <Route path="/venue/:id/goals" element={<ProtectedRoute><VenueGoals /></ProtectedRoute>} />
              <Route path="/venue/:id/contacts" element={<ProtectedRoute><VenueContacts /></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
              <Route path="/proposal/:id" element={<ProtectedRoute><ProposalDetails /></ProtectedRoute>} />
              <Route path="/proposal/:id/edit" element={<ProtectedRoute><ProposalEdit /></ProtectedRoute>} />
              <Route path="/proposal/:id/history" element={<ProtectedRoute><ProposalHistory /></ProtectedRoute>} />
              <Route path="/proposal/:id/contact" element={<ProtectedRoute><ProposalContact /></ProtectedRoute>} />
              <Route path="/proposal/:id/send" element={<ProtectedRoute><ProposalSend /></ProtectedRoute>} />
              <Route path="/proposal/:id/contract" element={<ProtectedRoute><ProposalContract /></ProtectedRoute>} />
              <Route path="/proposal/:id/dates" element={<ProtectedRoute><DateEventListPage /></ProtectedRoute>} />
              <Route path="/proposal/:id/payment" element={<ProtectedRoute><ProposalPayment /></ProtectedRoute>} />
              <Route path="/proposal/:id/attendance-list" element={<ProtectedRoute><ProposalAttendanceListPage /></ProtectedRoute>} />
              <Route path="/proposal/:id/documents" element={<ProtectedRoute><ProposalDocuments /></ProtectedRoute>} />
              <Route path="/proposal/:id/schedule" element={<ProtectedRoute><ProposalSchedulePage /></ProtectedRoute>} />
              <Route path="/proposal/:id/send-message" element={<ProtectedRoute><SendMessagePage /></ProtectedRoute>} />
              <Route path="/proposal/:id/send-proposal" element={<ProtectedRoute><SendProposalPage /></ProtectedRoute>} />
              <Route path="/proposal/:id/contract" element={<ProtectedRoute><ProposalContract /></ProtectedRoute>} />
              <Route path="/proposal/:id/guest-list" element={<GuestListPage />} />
              <Route path="/proposal/:id/worker-list" element={<WorkerListPage />} />
              <Route path="/proposal/:id/schedule-list" element={<ScheduleListPage />} />
              <Route path="/proposal/:id/view" element={<ProposalView  />} />
              <Route path="/venue/:id/form" element={<ProposalForm />} />
              <Route path="/proposal/:id/b2b-contract" element={<ContarctPjFormPage />} />
              <Route path="/proposal/:id/person-contract" element={<ContarctPFFormPage />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </GoogleOAuthProvider>
  );
};

export default App;
