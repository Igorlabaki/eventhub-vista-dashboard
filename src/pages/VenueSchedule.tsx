
import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalendarDays, ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, getDay } from "date-fns";
import { pt } from "date-fns/locale";

export default function VenueSchedule() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  
  const events = [
    {
      id: "1",
      title: "Casamento Silva",
      start: new Date(2025, 5, 15),
      end: new Date(2025, 5, 16),
      type: "wedding",
    },
    {
      id: "2",
      title: "Aniversário 15 anos - Maria",
      start: new Date(2025, 5, 22),
      end: new Date(2025, 5, 22),
      type: "birthday",
    },
    {
      id: "3",
      title: "Visita Agendada - João e Ana",
      start: new Date(2025, 5, 10, 14, 30),
      end: new Date(2025, 5, 10, 16, 0),
      type: "visit",
    },
    {
      id: "4",
      title: "Reunião - Fornecedores",
      start: new Date(2025, 5, 5, 10, 0),
      end: new Date(2025, 5, 5, 11, 30),
      type: "meeting",
    },
    {
      id: "5",
      title: "Manutenção - Jardim",
      start: new Date(2025, 5, 8),
      end: new Date(2025, 5, 8),
      type: "maintenance",
    },
  ];

  const previousMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  const nextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  // Dias do mês atual
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });
  
  // Função para verificar se um dia tem eventos
  const getDayEvents = (day) => {
    return events.filter(event => 
      day.getDate() === event.start.getDate() && 
      day.getMonth() === event.start.getMonth() && 
      day.getFullYear() === event.start.getFullYear()
    );
  };

  // Função para obter a cor com base no tipo do evento
  const getEventColor = (type) => {
    switch (type) {
      case "wedding":
        return "bg-pink-500";
      case "birthday":
        return "bg-purple-500";
      case "visit":
        return "bg-blue-500";
      case "meeting":
        return "bg-amber-500";
      case "maintenance":
        return "bg-green-500";
      default:
        return "bg-gray-500";
    }
  };

  // Preenche arrays vazios para os dias da semana antes do início do mês
  const firstDayOfMonth = getDay(monthStart);
  const emptyDaysBefore = Array.from({ length: firstDayOfMonth }, (_, i) => null);
  
  // Dias da semana em português
  const weekDays = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

  return (
    <DashboardLayout title="Agenda" subtitle="Visualize e gerencie sua agenda">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-4">
          <button 
            onClick={previousMonth}
            className="p-1 rounded-full hover:bg-gray-100"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <h3 className="text-xl font-semibold">
            {format(currentMonth, "MMMM yyyy", { locale: pt })}
          </h3>
          <button 
            onClick={nextMonth}
            className="p-1 rounded-full hover:bg-gray-100"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Novo Evento
        </Button>
      </div>
      
      <Card>
        <CardContent className="p-4">
          {/* Cabeçalho com os dias da semana */}
          <div className="grid grid-cols-7 gap-2 mb-2">
            {weekDays.map((day) => (
              <div 
                key={day}
                className="text-center text-sm font-semibold text-gray-500 p-2"
              >
                {day}
              </div>
            ))}
          </div>
          
          {/* Grade do calendário */}
          <div className="grid grid-cols-7 gap-2">
            {/* Dias vazios antes do início do mês */}
            {emptyDaysBefore.map((_, index) => (
              <div 
                key={`empty-before-${index}`}
                className="aspect-square p-1 border rounded-md bg-gray-50"
              ></div>
            ))}
            
            {/* Dias do mês */}
            {monthDays.map((day) => {
              const dayEvents = getDayEvents(day);
              return (
                <div 
                  key={day.toString()}
                  className="aspect-square p-1 border rounded-md hover:border-eventhub-primary hover:bg-eventhub-tertiary/10 transition-colors cursor-pointer"
                >
                  <div className="text-right text-sm font-medium mb-1">
                    {format(day, "d")}
                  </div>
                  
                  {/* Lista de eventos do dia */}
                  <div className="space-y-1">
                    {dayEvents.slice(0, 3).map((event) => (
                      <div
                        key={event.id}
                        className="text-xs text-white px-1 py-0.5 rounded truncate"
                        style={{ backgroundColor: getEventColor(event.type) }}
                      >
                        {event.title}
                      </div>
                    ))}
                    
                    {/* Indicador de mais eventos */}
                    {dayEvents.length > 3 && (
                      <div className="text-xs text-center text-gray-500">
                        +{dayEvents.length - 3} mais
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
      
      <div className="mt-6">
        <h3 className="text-lg font-semibold mb-4">Próximos eventos</h3>
        
        <div className="space-y-4">
          {events
            .filter(event => event.start >= new Date())
            .sort((a, b) => a.start.getTime() - b.start.getTime())
            .slice(0, 5)
            .map(event => (
              <Card key={event.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center">
                    <div 
                      className={`flex-shrink-0 w-4 h-full rounded-full mr-3 ${getEventColor(event.type)}`}
                    ></div>
                    <div className="flex-grow">
                      <h4 className="font-medium">{event.title}</h4>
                      <div className="flex items-center text-sm text-gray-500">
                        <CalendarDays className="h-3.5 w-3.5 mr-1" />
                        {format(event.start, "dd/MM/yyyy")}
                        {event.start.getHours() > 0 && (
                          <span> às {format(event.start, "HH:mm")}</span>
                        )}
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">
                      Detalhes
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          }
        </div>
      </div>
    </DashboardLayout>
  );
}
