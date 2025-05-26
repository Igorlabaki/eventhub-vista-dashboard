import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { DashboardLayout } from "@/components/DashboardLayout";
import { useVenueReportsStore } from "@/store/venueReportsStore";
import { VenueReportsSkeleton } from "@/components/reports/VenueReportsSkeleton";
import { useVenueStore } from "@/store/venueStore";
import { useUserStore } from "@/store/userStore";
import { ReportsHeader } from "@/components/reports/ReportsHeader";
import { EventsReport } from "@/components/reports/EventsReport";
import { BudgetsReport } from "@/components/reports/BudgetsReport";
import { FinancialBalanceReport } from "@/components/reports/FinancialBalanceReport";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function VenueReports() {
  const { id: venueId } = useParams<{ id: string }>();
  const user = useUserStore((state) => state.user);
  const [activeTab, setActiveTab] = useState("orcamentos");
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const [isFormOpen, setIsFormOpen] = useState(false);

  const {
    isLoading: isLoadingVenue,
  } = useVenueStore();

  const {
    isLoading: isLoadingReports,
  } = useVenueReportsStore();

  if (isLoadingVenue || isLoadingReports) {
    return (
      <DashboardLayout
        title="Relatórios"
        subtitle="Analise o desempenho do seu espaço"
      >
        <VenueReportsSkeleton />
      </DashboardLayout>
    );
  } 
  
  return (
    <DashboardLayout
      title="Relatórios"
      subtitle="Analise o desempenho do seu espaço"
    >
      <ReportsHeader
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onActionClick={() => setIsFormOpen(true)}
        isFormOpen={isFormOpen}
        selectedYear={selectedYear}
        onYearChange={setSelectedYear}
      />
      <div className="flex items-center justify-center gap-4 my-4">
        <button
          onClick={() => setSelectedYear((prev) => (parseInt(prev) - 1).toString())}
          className="px-2 text-2xl text-gray-400 hover:text-blue-400"
          aria-label="Ano anterior"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <span className="text-lg font-semibold text-gray-800">{selectedYear}</span>
        <button
          onClick={() => setSelectedYear((prev) => (parseInt(prev) + 1).toString())}
          className="px-2 text-2xl text-gray-400 hover:text-blue-400"
          aria-label="Próximo ano"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>
      {activeTab === "orcamentos" ? 
        <BudgetsReport selectedYear={selectedYear} /> : 
        activeTab === "evento" ? 
          <EventsReport selectedYear={selectedYear} /> :
          <FinancialBalanceReport selectedYear={selectedYear} venueId={venueId} />
      }
    </DashboardLayout>
  );
}

