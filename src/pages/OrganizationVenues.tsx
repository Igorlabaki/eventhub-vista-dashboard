
import { useState } from "react";
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { DashboardLayout } from "@/components/DashboardLayout";
import { VenueCard } from "@/components/VenueCard";
import { Plus } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// Dados mock para demonstração
const organizations = [
  {
    id: "1",
    name: "Best Eventos Ltda",
  },
  {
    id: "2",
    name: "Festa & Cia",
  },
  {
    id: "3",
    name: "Central de Eventos",
  },
];

const mockVenues = [
  {
    id: "1",
    organizationId: "1",
    name: "Espaço Villa Verde",
    capacity: 350,
    upcomingEvents: 3,
  },
  {
    id: "2",
    organizationId: "1",
    name: "Casa de Festas Diamante",
    capacity: 200,
    upcomingEvents: 1,
  },
  {
    id: "3",
    organizationId: "1",
    name: "Salão Nobre",
    capacity: 500,
    upcomingEvents: 5,
  },
  {
    id: "4",
    organizationId: "2",
    name: "Buffet Sonhos",
    capacity: 150,
    upcomingEvents: 2,
  },
  {
    id: "5",
    organizationId: "2",
    name: "Pavilhão das Flores",
    capacity: 400,
    upcomingEvents: 0,
  },
];

export default function OrganizationVenues() {
  const { id: organizationId } = useParams<{ id: string }>();
  const { toast } = useToast();
  
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newVenue, setNewVenue] = useState({
    name: "",
    capacity: "",
  });
  
  const organization = organizations.find((org) => org.id === organizationId);
  const [venues, setVenues] = useState(
    mockVenues.filter((venue) => venue.organizationId === organizationId)
  );
  
  const handleCreateVenue = () => {
    if (!newVenue.name.trim() || !newVenue.capacity.trim()) {
      toast({
        title: "Erro",
        description: "Todos os campos são obrigatórios",
        variant: "destructive",
      });
      return;
    }

    const capacity = parseInt(newVenue.capacity);
    if (isNaN(capacity) || capacity <= 0) {
      toast({
        title: "Erro",
        description: "Capacidade deve ser um número positivo",
        variant: "destructive",
      });
      return;
    }

    const newVenueObj = {
      id: `venue-${Date.now()}`,
      organizationId: organizationId || "1",
      name: newVenue.name,
      capacity: capacity,
      upcomingEvents: 0,
    };

    setVenues([...venues, newVenueObj]);
    setNewVenue({ name: "", capacity: "" });
    setDialogOpen(false);

    toast({
      title: "Sucesso",
      description: "Venue criada com sucesso",
    });
  };

  return (
    <DashboardLayout
      title={organization ? organization.name : "Organização"}
      subtitle="Gerencie suas venues"
    >
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-800">
          Venues ({venues.length})
        </h2>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nova Venue
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {venues.map((venue) => (
          <VenueCard
            key={venue.id}
            id={venue.id}
            name={venue.name}
            capacity={venue.capacity}
            upcomingEvents={venue.upcomingEvents}
            organizationId={venue.organizationId}
          />
        ))}
        
        {venues.length === 0 && (
          <div className="col-span-full text-center py-10 bg-gray-50 rounded-lg border border-dashed border-gray-300">
            <p className="text-gray-500">Nenhuma venue cadastrada</p>
            <Button 
              variant="link" 
              onClick={() => setDialogOpen(true)}
              className="mt-2"
            >
              Cadastrar primeira venue
            </Button>
          </div>
        )}
      </div>

      {/* Dialog para criar nova venue */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nova Venue</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Nome da Venue</Label>
              <Input
                id="name"
                placeholder="Digite o nome da venue"
                value={newVenue.name}
                onChange={(e) =>
                  setNewVenue({ ...newVenue, name: e.target.value })
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="capacity">Capacidade (pessoas)</Label>
              <Input
                id="capacity"
                type="number"
                placeholder="Ex: 200"
                value={newVenue.capacity}
                onChange={(e) =>
                  setNewVenue({ ...newVenue, capacity: e.target.value })
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCreateVenue}>Criar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
