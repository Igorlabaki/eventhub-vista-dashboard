
import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { MapPin, Calendar, User, Phone, Mail, Plus } from "lucide-react";
import { format } from "date-fns";
import { pt } from "date-fns/locale";

export default function VenueVisits() {
  const [newVisitDialogOpen, setNewVisitDialogOpen] = useState(false);
  
  // Mock data for visits
  const upcomingVisits = [
    {
      id: "1",
      name: "João e Ana",
      date: new Date(2025, 4, 15),
      time: "14:30",
      phone: "(11) 98765-4321",
      email: "joao.ana@email.com",
      status: "confirmed",
    },
    {
      id: "2",
      name: "Patricia Souza",
      date: new Date(2025, 4, 16),
      time: "10:00",
      phone: "(11) 91234-5678",
      email: "patricia@email.com",
      status: "confirmed",
    },
    {
      id: "3",
      name: "Carlos Mendes",
      date: new Date(2025, 4, 18),
      time: "15:00",
      phone: "(11) 99876-5432",
      email: "carlos@email.com",
      status: "pending",
    },
  ];

  const handleCreateVisit = () => {
    setNewVisitDialogOpen(false);
  };

  return (
    <DashboardLayout title="Visitas" subtitle="Agende e gerencie visitas ao seu espaço">
      <div className="flex justify-end mb-6">
        <Button onClick={() => setNewVisitDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nova Visita
        </Button>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Próximas Visitas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingVisits.map((visit) => (
                <div
                  key={visit.id}
                  className={`flex items-center p-4 border rounded-lg ${
                    visit.status === "confirmed" ? "border-green-200 bg-green-50" : "border-yellow-200 bg-yellow-50"
                  }`}
                >
                  <div className="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center bg-white mr-4 border">
                    <MapPin className="h-6 w-6 text-eventhub-primary" />
                  </div>
                  <div className="flex-grow">
                    <h4 className="font-medium text-gray-900">{visit.name}</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 text-sm text-gray-500 mt-1">
                      <span className="flex items-center">
                        <Calendar className="h-3.5 w-3.5 mr-1" />
                        {format(visit.date, "dd 'de' MMMM", { locale: pt })} às {visit.time}
                      </span>
                      <span className="flex items-center">
                        <Phone className="h-3.5 w-3.5 mr-1" />
                        {visit.phone}
                      </span>
                    </div>
                  </div>
                  <div className="flex-shrink-0 ml-4">
                    <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                      visit.status === "confirmed" 
                        ? "bg-green-100 text-green-800" 
                        : "bg-yellow-100 text-yellow-800"
                    }`}>
                      {visit.status === "confirmed" ? "Confirmada" : "Pendente"}
                    </span>
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

      {/* Dialog para criar nova visita */}
      <Dialog open={newVisitDialogOpen} onOpenChange={setNewVisitDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Agendar Nova Visita</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="visitorName">Nome do Visitante</Label>
              <Input id="visitorName" placeholder="Nome completo" />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="visitDate">Data da Visita</Label>
                <Input id="visitDate" type="date" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="visitTime">Horário</Label>
                <Input id="visitTime" type="time" />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="visitorPhone">Telefone</Label>
                <Input id="visitorPhone" placeholder="(00) 00000-0000" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="visitorEmail">Email</Label>
                <Input id="visitorEmail" type="email" placeholder="email@exemplo.com" />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setNewVisitDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCreateVisit}>Agendar Visita</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
