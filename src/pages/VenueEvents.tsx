
import { useState, useEffect, useMemo } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Users, CreditCard, ChevronLeft, ChevronRight, Plus, Search } from "lucide-react";
import { format, getMonth, getYear } from "date-fns";
import { pt } from "date-fns/locale";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function VenueEvents() {
  const [searchTerm, setSearchTerm] = useState("");
  
  // Current date
  const currentDate = new Date();
  const [selectedYear, setSelectedYear] = useState(2025);
  const [selectedMonth, setSelectedMonth] = useState(4); // May (0-indexed)
  
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

  // Month names in Portuguese
  const monthNames = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
  
  // Get all available years from events
  const availableYears = useMemo(() => {
    const years = events.map(event => getYear(event.date));
    return [...new Set(years)].sort((a, b) => b - a); // Sort descending
  }, [events]);

  // Filter events based on search term, month, and year
  const filteredEvents = useMemo(() => {
    return events.filter(event => {
      const matchesSearch = 
        event.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
        event.type.toLowerCase().includes(searchTerm.toLowerCase());
      
      const eventMonth = getMonth(event.date);
      const eventYear = getYear(event.date);
      
      const matchesMonthAndYear = eventMonth === selectedMonth && eventYear === selectedYear;
      
      return matchesSearch && matchesMonthAndYear;
    });
  }, [searchTerm, selectedMonth, selectedYear, events]);

  // Navigate to previous month
  const handlePreviousMonth = () => {
    if (selectedMonth === 0) {
      setSelectedMonth(11);
      setSelectedYear(selectedYear - 1);
    } else {
      setSelectedMonth(selectedMonth - 1);
    }
  };

  // Navigate to next month
  const handleNextMonth = () => {
    if (selectedMonth === 11) {
      setSelectedMonth(0);
      setSelectedYear(selectedYear + 1);
    } else {
      setSelectedMonth(selectedMonth + 1);
    }
  };
  
  return (
    <DashboardLayout title="Eventos" subtitle="Gerencie seus eventos">
      <div className="mb-6 flex items-center justify-between">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input 
            placeholder="Buscar eventos..." 
            className="pl-9" 
            value={searchTerm} 
            onChange={e => setSearchTerm(e.target.value)} 
          />
        </div>
        <Button className="ml-4">
          <Plus className="mr-2 h-4 w-4" />
          Novo Evento
        </Button>
      </div>

      {/* Year and Month Navigation */}
      <div className="mb-6">
        <div className="flex items-center justify-center mb-4">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setSelectedYear(selectedYear - 1)}
            className="px-2"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="mx-2 font-medium text-lg">{selectedYear}</span>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setSelectedYear(selectedYear + 1)}
            className="px-2"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="grid grid-cols-6 md:grid-cols-12 gap-2">
          {monthNames.map((month, index) => (
            <Button
              key={month}
              variant={selectedMonth === index ? "default" : "outline"}
              className={`${selectedMonth === index ? "bg-primary text-white" : "bg-background"} py-1 px-2 text-sm`}
              onClick={() => setSelectedMonth(index)}
            >
              {month}
            </Button>
          ))}
        </div>
      </div>

      {/* Month Navigation for Mobile */}
      <div className="md:hidden flex items-center justify-between mb-4">
        <Button variant="ghost" onClick={handlePreviousMonth}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <span className="font-medium">{monthNames[selectedMonth]} {selectedYear}</span>
        <Button variant="ghost" onClick={handleNextMonth}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Event Count */}
      <div className="mb-4 text-sm text-gray-500">
        {filteredEvents.length} eventos
      </div>

      {/* Events Table */}
      <div className="rounded-md border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Data</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Convidados</TableHead>
              <TableHead className="text-right">Valor Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredEvents.length > 0 ? (
              filteredEvents.map(event => (
                <TableRow key={event.id} className="cursor-pointer hover:bg-gray-50">
                  <TableCell className="font-medium">{event.title}</TableCell>
                  <TableCell>
                    {format(event.date, "dd/MM/yyyy", {
                      locale: pt
                    })}
                  </TableCell>
                  <TableCell>{event.type}</TableCell>
                  <TableCell>{event.guests}</TableCell>
                  <TableCell className="text-right">
                    {new Intl.NumberFormat('pt-BR', {
                      style: 'currency',
                      currency: 'BRL'
                    }).format(event.value)}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  Nenhum evento encontrado para {monthNames[selectedMonth]}/{selectedYear}.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      
      {/* We're removing the additional cards showing events and occupation metrics 
         since we're making this more like the budgets page */}
    </DashboardLayout>
  );
}
