
import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { DashboardLayout } from "@/components/DashboardLayout";
import { VenueCard } from "@/components/VenueCard";
import { Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { OwnersManager } from "@/components/OwnersManager";
import { PermissionsManager } from "@/components/PermissionsManager";

// Dados mock realistas baseados no schema do banco de dados
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

// Dados mock realistas para venues (espaços)
const mockVenues = [
  {
    id: "venue-1",
    organizationId: "1",
    name: "Espaço Villa Verde",
    capacity: 350,
    upcomingEvents: 3,
    description: "Espaço sofisticado com área verde e salão climatizado",
    address: "Rua das Palmeiras, 1500, São Paulo",
    photos: ["villa-verde-1.jpg", "villa-verde-2.jpg"],
    amenities: ["Estacionamento", "Cozinha Completa", "Ar-condicionado"],
    contactEmail: "contato@villaverde.com",
    contactPhone: "(11) 3333-4444",
  },
  {
    id: "venue-2",
    organizationId: "1",
    name: "Casa de Festas Diamante",
    capacity: 200,
    upcomingEvents: 1,
    description: "Espaço elegante e intimista para eventos exclusivos",
    address: "Av. Brasil, 789, São Paulo",
    photos: ["diamante-1.jpg", "diamante-2.jpg"],
    amenities: ["Wi-Fi", "Som Ambiente", "Espaço Gourmet"],
    contactEmail: "eventos@diamante.com",
    contactPhone: "(11) 2222-3333",
  },
  {
    id: "venue-3",
    organizationId: "1",
    name: "Salão Nobre Eventos",
    capacity: 500,
    upcomingEvents: 5,
    description: "Grande salão com pé direito alto e decoração clássica",
    address: "Rua dos Ipês, 350, São Paulo",
    photos: ["nobre-1.jpg", "nobre-2.jpg", "nobre-3.jpg"],
    amenities: ["Palco", "Camarim", "Gerador", "Segurança"],
    contactEmail: "comercial@salaonobre.com",
    contactPhone: "(11) 4444-5555",
  },
  {
    id: "venue-4",
    organizationId: "2",
    name: "Buffet Sonhos",
    capacity: 150,
    upcomingEvents: 2,
    description: "Espaço aconchegante com buffet próprio",
    address: "Alameda Santos, 450, São Paulo",
    photos: ["sonhos-1.jpg", "sonhos-2.jpg"],
    amenities: ["Buffet Próprio", "Decoração Inclusa", "Estacionamento"],
    contactEmail: "contato@buffetsonhos.com.br",
    contactPhone: "(11) 5555-6666",
  },
  {
    id: "venue-5",
    organizationId: "2",
    name: "Pavilhão das Flores",
    capacity: 400,
    upcomingEvents: 0,
    description: "Ambiente ao ar livre com muito verde e flores",
    address: "Estrada das Flores, km 5, Cotia",
    photos: ["pavilhao-1.jpg", "pavilhao-2.jpg"],
    amenities: ["Jardim", "Lago", "Tendas", "Estacionamento Amplo"],
    contactEmail: "eventos@pavilhaodasflores.com",
    contactPhone: "(11) 6666-7777",
  },
];

export default function OrganizationVenues() {
  const { id: organizationId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [ownersDialogOpen, setOwnersDialogOpen] = useState(false);
  const [permissionsDialogOpen, setPermissionsDialogOpen] = useState(false);
  
  const [organizationName, setOrganizationName] = useState("");
  const [newVenue, setNewVenue] = useState({
    name: "",
    capacity: "",
    description: "",
    address: "",
  });
  
  const organization = organizations.find((org) => org.id === organizationId);
  const [venues, setVenues] = useState(
    mockVenues.filter((venue) => venue.organizationId === organizationId)
  );
  
  // Event handlers for organization action items
  const handleEditOrganization = () => {
    setOrganizationName(organization?.name || "");
    setEditDialogOpen(true);
  };
  
  const handleSaveEdit = () => {
    if (!organizationName.trim()) {
      toast({
        title: "Erro",
        description: "O nome da organização não pode estar vazio",
        variant: "destructive",
      });
      return;
    }
    
    // Update organization name (mock implementation)
    toast({
      title: "Sucesso",
      description: "Nome da organização atualizado com sucesso",
    });
    
    setEditDialogOpen(false);
  };
  
  const handleCreateVenue = () => {
    if (!newVenue.name.trim() || !newVenue.capacity.trim()) {
      toast({
        title: "Erro",
        description: "Nome e capacidade são obrigatórios",
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
      description: newVenue.description || "Sem descrição disponível",
      address: newVenue.address || "Endereço não informado",
      photos: [],
      amenities: [],
      contactEmail: "",
      contactPhone: "",
    };

    setVenues([...venues, newVenueObj]);
    setNewVenue({ name: "", capacity: "", description: "", address: "" });
    setDialogOpen(false);

    toast({
      title: "Sucesso",
      description: "Espaço criado com sucesso",
    });
  };
  
  const handleViewVenue = (venueId: string) => {
    navigate(`/venue/${venueId}`);
  };

  return (
    <DashboardLayout
      title={organization ? organization.name : "Organização"}
      subtitle="Gerencie seus espaços"
    >
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-800">
          Espaços ({venues.length})
        </h2>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Espaço
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
            <p className="text-gray-500">Nenhum espaço cadastrado</p>
            <Button 
              variant="link" 
              onClick={() => setDialogOpen(true)}
              className="mt-2"
            >
              Cadastrar primeiro espaço
            </Button>
          </div>
        )}
      </div>

      {/* Dialog para criar novo espaço */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Novo Espaço</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Nome do Espaço</Label>
              <Input
                id="name"
                placeholder="Digite o nome do espaço"
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
            <div className="grid gap-2">
              <Label htmlFor="description">Descrição</Label>
              <Input
                id="description"
                placeholder="Descrição do espaço"
                value={newVenue.description || ""}
                onChange={(e) =>
                  setNewVenue({ ...newVenue, description: e.target.value })
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="address">Endereço</Label>
              <Input
                id="address"
                placeholder="Endereço completo"
                value={newVenue.address || ""}
                onChange={(e) =>
                  setNewVenue({ ...newVenue, address: e.target.value })
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

      {/* Dialog para editar organização */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Organização</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="organizationName">Nome da Organização</Label>
              <Input
                id="organizationName"
                value={organizationName}
                onChange={(e) => setOrganizationName(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveEdit}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Proprietários Manager */}
      <OwnersManager 
        organizationId={organizationId || "1"} 
        open={ownersDialogOpen}
        onClose={() => setOwnersDialogOpen(false)}
      />
      
      {/* Permissões Manager */}
      <PermissionsManager 
        organizationId={organizationId || "1"} 
        open={permissionsDialogOpen}
        onClose={() => setPermissionsDialogOpen(false)}
      />
    </DashboardLayout>
  );
}
