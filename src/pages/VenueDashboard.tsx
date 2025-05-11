
import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { StatCard } from "@/components/StatCard";
import { FloatingActionButton } from "@/components/FloatingActionButton";
import { CalendarDays, ClipboardList, Users, CreditCard, BarChart } from "lucide-react";
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
import { pt } from "date-fns/locale";

export default function VenueDashboard() {
  const { toast } = useToast();
  const [newBudgetDialogOpen, setNewBudgetDialogOpen] = useState(false);

  const handleCreateBudget = () => {
    setNewBudgetDialogOpen(false);
    toast({
      title: "Orçamento criado",
      description: "O orçamento foi criado com sucesso!",
    });
  };

  // Dados para exibir na agenda
  const today = new Date();
  const upcomingEvents = [
    {
      id: "1",
      title: "Casamento Silva",
      date: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 3),
      type: "Casamento",
    },
    {
      id: "2",
      title: "Aniversário 15 anos - Maria",
      date: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 5),
      type: "Aniversário",
    },
    {
      id: "3",
      title: "Formatura Engenharia",
      date: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 10),
      type: "Formatura",
    },
  ];
  
  const upcomingVisits = [
    {
      id: "1",
      name: "João e Ana",
      date: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1),
      time: "14:30",
    },
    {
      id: "2",
      name: "Patricia Souza",
      date: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 2),
      time: "10:00",
    },
  ];

  return (
    <DashboardLayout title="Espaço Villa Verde" subtitle="Painel de controle">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          title="Eventos Confirmados"
          value="12"
          icon={<CalendarDays className="h-5 w-5 text-eventhub-primary" />}
          trend={{ value: 8, isPositive: true }}
        />
        <StatCard
          title="Orçamentos Pendentes"
          value="8"
          icon={<ClipboardList className="h-5 w-5 text-eventhub-primary" />}
          trend={{ value: 2, isPositive: true }}
        />
        <StatCard
          title="Visitas Agendadas"
          value="5"
          icon={<Users className="h-5 w-5 text-eventhub-primary" />}
          trend={{ value: 12, isPositive: false }}
        />
        <StatCard
          title="Receita Mensal"
          value="R$ 32.450"
          icon={<CreditCard className="h-5 w-5 text-eventhub-primary" />}
          trend={{ value: 15, isPositive: true }}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-lg">Próximos Eventos</h3>
              <Button variant="outline" size="sm">
                Ver Todos
              </Button>
            </div>
            
            <div className="space-y-4">
              {upcomingEvents.map((event) => (
                <div
                  key={event.id}
                  className="flex items-center p-3 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex-shrink-0 w-12 h-12 rounded-md flex items-center justify-center bg-eventhub-tertiary/40 mr-4">
                    <CalendarDays className="h-6 w-6 text-eventhub-primary" />
                  </div>
                  <div className="flex-grow">
                    <h4 className="font-medium text-gray-900">{event.title}</h4>
                    <div className="text-sm text-gray-500">
                      {format(event.date, "dd 'de' MMMM", { locale: pt })} • {event.type}
                    </div>
                  </div>
                </div>
              ))}
              
              {upcomingEvents.length === 0 && (
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
              <h3 className="font-semibold text-lg">Visitas Agendadas</h3>
              <Button variant="outline" size="sm">
                Ver Todas
              </Button>
            </div>
            
            <div className="space-y-4">
              {upcomingVisits.map((visit) => (
                <div
                  key={visit.id}
                  className="flex items-center p-3 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex-shrink-0 w-12 h-12 rounded-md flex items-center justify-center bg-eventhub-tertiary/40 mr-4">
                    <Users className="h-6 w-6 text-eventhub-primary" />
                  </div>
                  <div className="flex-grow">
                    <h4 className="font-medium text-gray-900">{visit.name}</h4>
                    <div className="text-sm text-gray-500">
                      {format(visit.date, "dd 'de' MMMM", { locale: pt })} às {visit.time}
                    </div>
                  </div>
                </div>
              ))}
              
              {upcomingVisits.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  Nenhuma visita agendada.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-lg">Desempenho Mensal</h3>
            <Button variant="outline" size="sm">
              Filtrar
            </Button>
          </div>
          
          <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg">
            <div className="text-center">
              <BarChart className="h-10 w-10 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500">Gráfico de desempenho mensal</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <FloatingActionButton
        onClick={() => setNewBudgetDialogOpen(true)}
        label="Novo Orçamento"
      />

      {/* Dialog para novo orçamento */}
      <Dialog open={newBudgetDialogOpen} onOpenChange={setNewBudgetDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Novo Orçamento</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="clientName">Nome do Cliente</Label>
                <Input id="clientName" placeholder="Nome completo" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="clientEmail">Email</Label>
                <Input id="clientEmail" type="email" placeholder="email@exemplo.com" />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="clientPhone">Telefone</Label>
                <Input id="clientPhone" placeholder="(00) 00000-0000" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="eventType">Tipo de Evento</Label>
                <Input id="eventType" placeholder="Ex: Casamento, Formatura..." />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="eventDate">Data do Evento</Label>
                <Input id="eventDate" type="date" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="guestCount">Número de Convidados</Label>
                <Input id="guestCount" type="number" placeholder="Ex: 150" />
              </div>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="notes">Observações</Label>
              <Textarea
                id="notes"
                placeholder="Detalhes adicionais sobre o evento..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setNewBudgetDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCreateBudget}>Criar Orçamento</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
