import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
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
import { useUserStore } from "@/store/userStore";
import { VenueDashboardSkeleton } from "@/components/venue/VenueDashboardSkeleton";
import { useGetVenueDashBoardData } from "@/hooks/venue/queries/venueDashBoardData";
import { useGetVenuesList } from "@/hooks/venue/queries/list";
import { VenueStatsPanel } from "@/components/venue/VenueStatsPanel";
import { useGetGoals } from "@/hooks/goal/queries/useGetGoals";
import { VenuePerformanceChart } from "@/components/venue/VenuePerformanceChart";
import { VenuePerformanceChartAllMonths } from "@/components/venue/VenuePerformanceChartAllMonths";
import { useVenueStore } from "@/store/venueStore";
import { useGoalStore } from "@/store/goalStore";

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
  const user = useUserStore((state) => state.user);
  
  // Mês inicial: atual (1-based para backend, mas select usa string)
  const currentMonth = (new Date().getMonth() + 1).toString();
  const [selectedMonth, setSelectedMonth] = useState<string>(currentMonth);
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);
  const years = Array.from({ length: 30 }, (_, i) => currentYear - 15 + i);
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

  const { data: venueDashBoardData, isLoading: isLoadingDashBoardData } =
    useGetVenueDashBoardData(venueId || "", {
      month: selectedMonth,
      year: selectedYear ? String(selectedYear) : undefined,
    });

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
    (!venueDashBoardData && !isLoadingDashBoardData)
  )
    return <VenueNotFound />;
  return (
    <DashboardLayout title={venue?.name} subtitle="Painel de controle">
      {isLoading || isLoadingDashBoardData ? (
        <VenueDashboardSkeleton />
      ) : (
        <div className="bg-white rounded-md p-4 shadow-md">
          <div className="mb-6 ">
            <h2 className="text-2xl font-semibold text-gray-900">Visão Geral</h2>
            <p className="text-gray-500 mt-1">Acompanhe os principais indicadores do seu espaço</p>
          </div>
          <VenueStatsPanel
            data={venueDashBoardData}
            selectedMonth={selectedMonth}
            selectedYear={selectedYear}
            onMonthChange={setSelectedMonth}
            onYearChange={setSelectedYear}
            months={months}
            years={years}
          />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-lg">Próximo Evento</h3>
                  <Button variant="outline" size="sm">
                    Ver
                  </Button>
                </div>

                <div className="space-y-4">
                  {venueDashBoardData?.nextEvent ? (
                    <div className="flex items-center p-3 border rounded-lg hover:bg-gray-50">
                      <div className="flex-shrink-0 w-12 h-12 rounded-md flex items-center justify-center bg-eventhub-tertiary/40 mr-4">
                        <CalendarDays className="h-6 w-6 text-eventhub-primary" />
                      </div>
                      <div className="flex-grow">
                        <h4 className="font-medium text-gray-900">
                          {venueDashBoardData.nextEvent.title}
                        </h4>
                        <div className="text-sm text-gray-500">
                          {format(
                            new Date(venueDashBoardData.nextEvent.startDate),
                            "dd 'de' MMMM",
                            { locale: ptBR }
                          )}{" "}
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
                  <Button variant="outline" size="sm">
                    Ver
                  </Button>
                </div>

                <div className="space-y-4">
                  {venueDashBoardData?.nextVisit ? (
                    <div className="flex items-center p-3 border rounded-lg hover:bg-gray-50">
                      <div className="flex-shrink-0 w-12 h-12 rounded-md flex items-center justify-center bg-eventhub-tertiary/40 mr-4">
                        <Users className="h-6 w-6 text-eventhub-primary" />
                      </div>
                      <div className="flex-grow">
                        <h4 className="font-medium text-gray-900">
                          {venueDashBoardData.nextVisit.title}
                        </h4>
                        <div className="text-sm text-gray-500">
                          {format(new Date(venueDashBoardData.nextVisit.startDate), "dd 'de' MMMM", { locale: ptBR })} {" "}
                          às {format(new Date(venueDashBoardData.nextVisit.startDate), "HH:mm")}
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

          <Card className="hidden lg:block">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-lg">Desempenho Mensal</h3>
              </div>

              {selectedMonth === 'all' ? (
                <VenuePerformanceChartAllMonths
                  data={venueDashBoardData}
                  goals={goals || []}
                  months={months}
                />
              ) : (
                <VenuePerformanceChart
                  data={venueDashBoardData}
                  goals={goals || []}
                  months={months}
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
