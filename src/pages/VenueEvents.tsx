import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Users, CreditCard, ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { format } from "date-fns";
import { pt } from "date-fns/locale";

export default function VenueEvents() {
  const [year, setYear] = useState(2025);
  const [events, setEvents] = useState([
    {
      id: "1",
      title: "Casamento Silva",
      date: new Date(2025, 0, 15), // Janeiro
      type: "Casamento",
      guests: 180,
      status: "confirmed",
      value: 16500,
    },
    {
      id: "2",
      title: "Aniversário 15 anos - Maria",
      date: new Date(2025, 1, 22), // Fevereiro
      type: "Aniversário",
      guests: 150,
      status: "confirmed",
      value: 12800,
    },
    {
      id: "3",
      title: "Formatura Engenharia",
      date: new Date(2025, 2, 10), // Março
      type: "Formatura",
      guests: 200,
      status: "confirmed",
      value: 18200,
    },
    {
      id: "4",
      title: "Workshop Corporativo",
      date: new Date(2025, 3, 5), // Abril
      type: "Corporativo",
      guests: 80,
      status: "confirmed",
      value: 8500,
    },
    {
      id: "5",
      title: "Casamento Oliveira",
      date: new Date(2025, 4, 20), // Maio
      type: "Casamento",
      guests: 220,
      status: "confirmed",
      value: 19500,
    },
    {
      id: "6",
      title: "Confraternização Tech",
      date: new Date(2025, 6, 12), // Julho
      type: "Corporativo",
      guests: 120,
      status: "confirmed",
      value: 15800,
    },
  ]);

  const months = [
    "jan", "fev", "mar", "abr", "mai", "jun", 
    "jul", "ago", "set", "out", "nov", "dez"
  ];
  
  // Calcular eventos por mês
  const calculateMonthlyEventCounts = () => {
    const counts = Array(12).fill(0);
    const filteredEvents = events.filter(e => e.date.getFullYear() === year);
    
    filteredEvents.forEach(event => {
      const month = event.date.getMonth();
      counts[month]++;
    });
    
    return counts;
  };
  
  const monthlyEventCounts = calculateMonthlyEventCounts();
  const totalEvents = monthlyEventCounts.reduce((acc, curr) => acc + curr, 0);
  const averageGuests = events.length > 0 
    ? Math.round(events.reduce((acc, e) => acc + e.guests, 0) / events.length) 
    : 0;
    
  // Calculando a porcentagem máxima para a barra de ocupação
  const maxPercentage = 100;
  const getOccupancyPercentage = (count: number): number => {
    const max = Math.max(...monthlyEventCounts);
    return max > 0 ? (count / max) * maxPercentage : 0;
  };
  
  return (
    <DashboardLayout title="Eventos" subtitle="Gerencie seus eventos">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-800">
          Ocupação por Mês
        </h2>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Novo Evento
        </Button>
      </div>
      
      <Card className="mb-8">
        <CardContent className="pt-6">
          <div className="flex justify-between items-center mb-6">
            <button 
              onClick={() => setYear(year - 1)}
              className="p-1 rounded-full hover:bg-gray-100"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <h3 className="font-semibold text-lg">{year}</h3>
            <button 
              onClick={() => setYear(year + 1)}
              className="p-1 rounded-full hover:bg-gray-100"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
          
          <div className="space-y-2">
            {months.map((month, index) => (
              <div key={month} className="flex items-center">
                <span className="w-8 text-sm text-gray-500">{month}</span>
                <div className="relative flex-1 h-7 bg-gray-100 rounded-md ml-2">
                  <div 
                    className="absolute top-0 left-0 h-7 bg-blue-400 rounded-md"
                    style={{ width: `${getOccupancyPercentage(monthlyEventCounts[index])}%` }}
                  ></div>
                  
                  {/* Mostrar quantidade de eventos */}
                  <span className="absolute top-0 left-2 h-7 flex items-center text-xs font-medium">
                    {monthlyEventCounts[index] > 0 && `${monthlyEventCounts[index]} eventos`}
                  </span>
                </div>
                <span className="ml-2 text-sm text-gray-500 w-8 text-right">
                  {Math.round(getOccupancyPercentage(monthlyEventCounts[index]))}%
                </span>
              </div>
            ))}
          </div>
          
          <div className="mt-6 flex justify-around">
            <div className="text-center">
              <p className="text-sm text-gray-500">Total de eventos</p>
              <p className="text-2xl font-bold">{totalEvents}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-500">Média de convidados</p>
              <p className="text-2xl font-bold">{averageGuests}</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <h2 className="text-xl font-semibold text-gray-800 mb-4">
        Próximos Eventos
      </h2>
      
      <div className="space-y-4">
        {events
          .filter(event => event.date > new Date())
          .sort((a, b) => a.date.getTime() - b.date.getTime())
          .slice(0, 5)
          .map(event => (
            <Card key={event.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-14 h-14 bg-eventhub-tertiary/20 rounded-lg flex flex-col items-center justify-center mr-4">
                    <span className="text-xs font-medium text-gray-600">
                      {format(event.date, "MMM", { locale: pt }).toUpperCase()}
                    </span>
                    <span className="text-xl font-bold">
                      {format(event.date, "dd")}
                    </span>
                  </div>
                  
                  <div className="flex-grow">
                    <div className="flex justify-between">
                      <h4 className="font-medium text-gray-900">{event.title}</h4>
                      <span className="font-medium text-eventhub-primary">
                        R$ {event.value.toLocaleString('pt-BR')}
                      </span>
                    </div>
                    <div className="flex items-center text-sm text-gray-500 mt-1">
                      <Users className="h-3.5 w-3.5 mr-1" />
                      {event.guests} convidados
                      <span className="mx-2">•</span>
                      <span>{event.type}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        
        {events.filter(event => event.date > new Date()).length === 0 && (
          <div className="text-center py-8 bg-gray-50 rounded-lg">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-500">Nenhum evento agendado.</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
