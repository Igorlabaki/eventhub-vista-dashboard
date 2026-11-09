import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { StatCard } from "@/components/StatCard";
import { FloatingActionButton } from "@/components/FloatingActionButton";
import {
  CalendarDays,
  ClipboardList,
  Users,
  CreditCard,
  BarChart,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { wallClockDateTimeBr } from "@/lib/wall-clock-datetime";
import { useUserStore } from "@/store/userStore";
import { VenueDashboardSkeleton } from "@/components/venue/VenueDashboardSkeleton";
import { useGetVenueDashBoardData } from "@/hooks/venue/queries/venueDashBoardData";
import { useGetVenuesList } from "@/hooks/venue/queries/list";
import { VenueStatsPanel } from "@/components/venue/VenueStatsPanel";
import { useGetGoals } from "@/hooks/goal/queries/useGetGoals";
import { VenuePerformanceChart } from "@/components/venue/VenuePerformanceChart";
import { VenuePerformanceChartAllMonths } from "@/components/venue/VenuePerformanceChartAllMonths";
import { performanceTitle } from "@/components/venue/VenuePerformanceSeries";
import { useVenueStore } from "@/store/venueStore";
import { useGoalStore } from "@/store/goalStore";
import { EVENTHUB_TAB_TITLE, venueTabTitle } from "@/lib/venue-tab-title";

function VenueNotFound() {
  return (
    <DashboardLayout title="Espaço não encontrado" subtitle="">
      <div className="flex flex-col items-center justify-center h-[60vh]">
        <div className="bg-gray-100 rounded-full p-6 mb-4">
          <CalendarDays className="h-10 w-10 text-gray-400" />
        </div>
        <h2 className="text-2xl font-semibold text-gray-700 mb-2">
          Espaço não encontrado
        </h2>
        <p className="text-gray-500 mb-4">
          Verifique se o link está correto ou tente novamente mais tarde.
        </p>
        <Button variant="outline" onClick={() => window.history.back()}>
          Voltar
        </Button>
      </div>
    </DashboardLayout>
  );
}

export default function VenueDashboard() {
  const { id: venueId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const user = useUserStore((state) => state.user);

  // Mês inicial: atual (1-based para backend, mas select usa string)
  const currentMonth = (new Date().getMonth() + 1).toString();
  const [selectedMonth, setSelectedMonth] = useState<string>(currentMonth);
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);
  const months = [
    "Todas",
    ...Array.from({ length: 12 }, (_, i) =>
      format(new Date(2000, i), "MMMM", { locale: ptBR })
    ),
  ];

  const { selectedVenue: venue, fetchVenueById, isLoading } = useVenueStore();
  const { goals, fetchGoals, isLoading: isLoadingGoals } = useGoalStore();

  useEffect(() => {
    if (venueId && user?.id) {
      fetchVenueById(venueId, user.id);
    }
  }, [venueId, user?.id, fetchVenueById]);

  useEffect(() => {
    if (venueId) {
      fetchGoals(venueId);
    }
  }, [venueId, fetchGoals]);

  useEffect(() => {
    const currentVenue = venue?.id === venueId ? venue : null;
    document.title = currentVenue?.name
      ? venueTabTitle(currentVenue.name, currentVenue.description)
      : EVENTHUB_TAB_TITLE;
    return () => {
      document.title = EVENTHUB_TAB_TITLE;
    };
  }, [venue, venueId]);

  const {
    data: fetchedDashboardData,
    isLoading: isLoadingDashBoardData,
    isPlaceholderData: dashboardNumbersLoading,
  } = useGetVenueDashBoardData(venueId || "", {
    month: selectedMonth,
    year: selectedYear ? String(selectedYear) : undefined,
  });
  const retainedDashboardData = useRef(fetchedDashboardData);
  if (fetchedDashboardData) {
    retainedDashboardData.current = fetchedDashboardData;
  }
  const dashboardData = fetchedDashboardData ?? retainedDashboardData.current;

  const handleViewProposal = (proposalId: string) => {
    navigate(`/proposal/${proposalId}`);
  };

  // Verifica se temos o ID do usuário
  if (!user?.id) {
    return (
      <DashboardLayout title="Erro" subtitle="">
        <div className="flex flex-col items-center justify-center h-[60vh]">
          <div className="bg-gray-100 rounded-full p-6 mb-4">
            <Users className="h-10 w-10 text-gray-400" />
          </div>
          <h2 className="text-2xl font-semibold text-gray-700 mb-2">
            Usuário não autenticado
          </h2>
          <p className="text-gray-500 mb-4">
            Por favor, faça login para acessar esta página.
          </p>
        </div>
      </DashboardLayout>
    );
  }
  
  if (
    (!venue && !isLoading) ||
    (!dashboardData && !isLoadingDashBoardData)
  )
    return <VenueNotFound />;
  return (
    <DashboardLayout title={venue?.name} subtitle="Painel de controle">
      {isLoading || !dashboardData ? (
        <VenueDashboardSkeleton />
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-lg">Próximo Evento</h3>
                  {dashboardData?.nextEvent && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        handleViewProposal(
                          dashboardData.nextEvent.proposalId
                        )
                      }
                    >
                      Ver
                    </Button>
                  )}
                </div>

                <div className="space-y-4">
                  {dashboardData?.nextEvent ? (
                    <div className="flex items-center p-3 border rounded-lg hover:bg-gray-50">
                      <div className="flex-shrink-0 w-12 h-12 rounded-md flex items-center justify-center bg-eventhub-tertiary/40 mr-4">
                        <CalendarDays className="h-6 w-6 text-eventhub-primary" />
                      </div>
                      <div className="flex-grow">
                        <h4 className="font-medium text-gray-900">
                          {dashboardData.nextEvent.title}
                        </h4>
                        <div className="text-sm text-gray-500">
                          {wallClockDateTimeBr(dashboardData.nextEvent.startDate)}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      Nenhum evento próximo.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-lg">Proxima Visita</h3>
                  {dashboardData?.nextVisit && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        handleViewProposal(
                          dashboardData.nextVisit.proposalId
                        )
                      }
                    >
                      Ver
                    </Button>
                  )}
                </div>

                <div className="space-y-4">
                  {dashboardData?.nextVisit ? (
                    <div className="flex items-center p-3 border rounded-lg hover:bg-gray-50">
                      <div className="flex-shrink-0 w-12 h-12 rounded-md flex items-center justify-center bg-eventhub-tertiary/40 mr-4">
                        <Users className="h-6 w-6 text-eventhub-primary" />
                      </div>
                      <div className="flex-grow">
                        <h4 className="font-medium text-gray-900">
                          {dashboardData.nextVisit.title}
                        </h4>
                        <div className="text-sm text-gray-500">
                          {wallClockDateTimeBr(dashboardData.nextVisit.startDate)}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      Nenhuma visita agendada.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <VenueStatsPanel
            data={dashboardData}
            numbersLoading={dashboardNumbersLoading}
            selectedMonth={selectedMonth}
            selectedYear={selectedYear}
            onMonthChange={setSelectedMonth}
            onYearChange={setSelectedYear}
            months={months}
          />

          <Card className="hidden lg:block">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-lg">
                  {performanceTitle(String(selectedMonth))}
                </h3>
              </div>

              {selectedMonth === "all" ? (
                <VenuePerformanceChartAllMonths
                  data={dashboardData}
                  goals={goals || []}
                />
              ) : (
                <VenuePerformanceChart
                  data={dashboardData}
                  goals={goals || []}
                  selectedMonth={Number(selectedMonth)}
                />
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </DashboardLayout>
  );
}
