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
import OrganizationWebsiteImages from "./pages/website/OrganizationWebsiteImages";
import SendSuppliers from "./pages/SendSuppliers";

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
              {/* Public */}
                <Route path="/index" element={<Index />} />
                <Route path="/login" element={<Login />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/register" element={<Register />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="*" element={<NotFound />} />
                <Route path="/" element={<Navigate to="/login" replace />} />
              {/* Organization */}
                <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                <Route path="/organization/:id/venues" element={<ProtectedRoute requiredPermission="VIEW_ORG_VENUES"><OrganizationVenues /></ProtectedRoute>} />
                <Route path="/organization/:id/owners" element={<ProtectedRoute requiredPermission="VIEW_ORG_OWNERS"><OrganizationOwners /></ProtectedRoute>} />
                <Route path="/organization/:id/website" element={<ProtectedRoute requiredPermission="VIEW_ORG_SITE"><OrganizationWebsite /></ProtectedRoute>} />
                <Route path="/organization/:id/settings" element={<ProtectedRoute requiredPermission="VIEW_ORG_INFO"><OrganizationSettings /></ProtectedRoute>} />
                <Route path="/organization/:id/website/texts" element={<ProtectedRoute requiredPermission="VIEW_ORG_SITE"><OrganizationWebsiteTexts /></ProtectedRoute>} />
                <Route path="/organization/:id/contracts" element={<ProtectedRoute requiredPermission="VIEW_ORG_CONTRACTS"><OrganizationContracts /></ProtectedRoute>} />
                <Route path="/organization/:id/website/venues" element={<ProtectedRoute requiredPermission="VIEW_ORG_SITE"><OrganizationWebsiteVenues /></ProtectedRoute>} />
                <Route path="/organization/:id/permissions" element={<ProtectedRoute requiredPermission="VIEW_ORG_PERMISSIONS"><OrganizationPermissionsV2 /></ProtectedRoute>} />
                <Route path="/organization/:id/website/images" element={<ProtectedRoute requiredPermission="VIEW_ORG_SITE"><OrganizationWebsiteImages /></ProtectedRoute>} />
              {/* Venue */}
                <Route path="/venue/:id/goals" element={<ProtectedRoute requiredPermission="VIEW_VENUE_PRICES"><VenueGoals /></ProtectedRoute>} />
                <Route path="/venue/:id" element={<ProtectedRoute requiredPermission="VIEW_VENUE_INFO"><VenueDashboard /></ProtectedRoute>} />
                <Route path="/venue/:id/events" element={<ProtectedRoute requiredPermission="VIEW_VENUE_EVENTS"><VenueEvents /></ProtectedRoute>} />
                <Route path="/venue/:id/budgets" element={<ProtectedRoute requiredPermission="VIEW_VENUE_PROPOSALS"><VenueBudgets /></ProtectedRoute>} />
                <Route path="/venue/:id/reports" element={<ProtectedRoute requiredPermission="VIEW_VENUE_ANALYSIS"><VenueReports /></ProtectedRoute>} />
                <Route path="/venue/:id/website" element={<ProtectedRoute requiredPermission="VIEW_VENUE_SITES"><VenueWebsite /></ProtectedRoute>} />
                <Route path="/venue/:id/expenses" element={<ProtectedRoute requiredPermission="VIEW_VENUE_EXPENSES"><VenueExpenses /></ProtectedRoute>} />
                <Route path="/venue/:id/new-budget" element={<ProtectedRoute requiredPermission="VIEW_VENUE_NEW_BUDGET"><NewBudget /></ProtectedRoute>} />
                <Route path="/venue/:id/services" element={<ProtectedRoute requiredPermission="VIEW_VENUE_SERVICES"><VenueServices /></ProtectedRoute>} />
                <Route path="/venue/:id/contacts" element={<ProtectedRoute requiredPermission="VIEW_VENUE_CONTACTS"><VenueContacts /></ProtectedRoute>} />
                <Route path="/venue/:id/schedule" element={<ProtectedRoute requiredPermission="VIEW_VENUE_CALENDAR"><VenueSchedule /></ProtectedRoute>} />
                <Route path="/venue/:id/settings" element={<ProtectedRoute requiredPermission="EDIT_VENUE_INFO"><VenueSettings /></ProtectedRoute>} />
                <Route path="/venue/:id/website/faq" element={<ProtectedRoute requiredPermission="VIEW_VENUE_SITES"><VenueWebsiteFaq /></ProtectedRoute>} />
                <Route path="/venue/:id/website/texts" element={<ProtectedRoute requiredPermission="VIEW_VENUE_SITES"><VenueWebsiteTexts /></ProtectedRoute>} />
                <Route path="/venue/:id/notifications" element={<ProtectedRoute requiredPermission="VIEW_VENUE_SITES"><VenueNotifications /></ProtectedRoute>} />
                <Route path="/venue/:id/website/images" element={<ProtectedRoute requiredPermission="VIEW_VENUE_SITES"><VenueWebsiteImages /></ProtectedRoute>} />
              {/* Proposal */}
                <Route path="/proposal/:id/view" element={<ProposalView  />} />
                <Route path="/proposal/:id/guest-list" element={<GuestListPage />} />
                <Route path="/proposal/:id/staff-list" element={<WorkerListPage />} />
                <Route path="/proposal/:id/schedule-list" element={<ScheduleListPage />} />
                <Route path="/proposal/:id/send" element={<ProtectedRoute requiredPermission="VIEW_PROPOSAL_SEND"><ProposalSend /></ProtectedRoute>} />
                <Route path="/proposal/:id/edit" element={<ProtectedRoute requiredPermission="EDIT_VENUE_INFO"><ProposalEdit /></ProtectedRoute>} />
                <Route path="/proposal/:id" element={<ProtectedRoute requiredPermission="VIEW_PROPOSAL_INFO"><ProposalDetails /></ProtectedRoute>} />
                <Route path="/proposal/:id/dates" element={<ProtectedRoute requiredPermission="VIEW_PROPOSAL_DATES"><DateEventListPage /></ProtectedRoute>} />
                <Route path="/proposal/:id/history" element={<ProtectedRoute requiredPermission="VIEW_PROPOSAL_HISTORY"><ProposalHistory /></ProtectedRoute>} />
                <Route path="/proposal/:id/contact" element={<ProtectedRoute requiredPermission="VIEW_PROPOSAL_CONTACT"><ProposalContact /></ProtectedRoute>} />
                <Route path="/proposal/:id/payment" element={<ProtectedRoute requiredPermission="VIEW_PROPOSAL_PAYMENT"><ProposalPayment /></ProtectedRoute>} />
                <Route path="/proposal/:id/contract" element={<ProtectedRoute requiredPermission="SEND_PROPOSAL_DOCUMENTS"><ProposalContract /></ProtectedRoute>} />
                <Route path="/proposal/:id/documents" element={<ProtectedRoute requiredPermission="VIEW_PROPOSAL_DOCUMENTS"><ProposalDocuments /></ProtectedRoute>} />
                <Route path="/proposal/:id/schedule" element={<ProtectedRoute requiredPermission="VIEW_PROPOSAL_SCHEDULE"><ProposalSchedulePage /></ProtectedRoute>} />
                <Route path="/proposal/:id/send-message" element={<ProtectedRoute requiredPermission="SEND_PROPOSAL_TEXT"><SendMessagePage /></ProtectedRoute>} />
                <Route path="/proposal/:id/send-suppliers" element={<ProtectedRoute requiredPermission="SEND_PROPOSAL_INFO"><SendSuppliers /></ProtectedRoute>} />
                <Route path="/proposal/:id/send-proposal" element={<ProtectedRoute requiredPermission="SEND_PROPOSAL_INFO"><SendProposalPage /></ProtectedRoute>} />
                <Route path="/proposal/:id/attendance-list" element={<ProtectedRoute requiredPermission="VIEW_PROPOSAL_ATTENDANCE_LIST"><ProposalAttendanceListPage /></ProtectedRoute>} />
              {/* Public Form */}
                <Route path="/venue/:id/form" element={<ProposalForm />} />
                <Route path="/proposal/:id/b2b-contract" element={<ContarctPjFormPage />} />
                <Route path="/proposal/:id/person-contract" element={<ContarctPFFormPage />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </GoogleOAuthProvider>
  );
};

export default App;
