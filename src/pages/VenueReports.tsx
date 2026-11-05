import { useState } from "react";
import { useParams } from "react-router-dom";
import { DashboardLayout } from "@/components/DashboardLayout";
import { useVenueReportsStore } from "@/store/venueReportsStore";
import { VenueReportsSkeleton } from "@/components/reports/VenueReportsSkeleton";
import { useVenueStore } from "@/store/venueStore";
import { ReportsHeader } from "@/components/reports/ReportsHeader";
import { EventsReport } from "@/components/reports/EventsReport";
import { BudgetsReport } from "@/components/reports/BudgetsReport";
import { FinancialBalanceReport } from "@/components/reports/FinancialBalanceReport";
import { panelEnter } from "@/components/reports/SlidingSelection";

export default function VenueReports() {
  const { id: venueId } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState("orcamentos");
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const { isLoading: isLoadingVenue } = useVenueStore();
  const { isLoading: isLoadingReports } = useVenueReportsStore();
  const loading = isLoadingVenue || isLoadingReports;

  return (
    <DashboardLayout>
      <ReportsHeader
        activeTab={activeTab}
        onTabChange={setActiveTab}
        selectedYear={selectedYear}
        onYearChange={setSelectedYear}
      />
      <div key={activeTab} className={panelEnter}>
        {loading ? (
          <VenueReportsSkeleton />
        ) : activeTab === "orcamentos" ? (
          <BudgetsReport selectedYear={selectedYear} />
        ) : activeTab === "evento" ? (
          <EventsReport selectedYear={selectedYear} />
        ) : venueId ? (
          <FinancialBalanceReport selectedYear={selectedYear} venueId={venueId} />
        ) : null}
      </div>
    </DashboardLayout>
  );
}
