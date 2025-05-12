
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
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
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
          <Route path="/organization/:id/venues" element={<OrganizationVenues />} />
          <Route path="/organization/:id/owners" element={<OrganizationOwners />} />
          <Route path="/organization/:id/permissions" element={<OrganizationPermissions />} />
          <Route path="/organization/:id/contracts" element={<OrganizationContracts />} />
          <Route path="/venue" element={<VenueDashboard />} />
          <Route path="/venue/budgets" element={<VenueBudgets />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
