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
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Type definitions matching the Prisma schema
type PricingModel = "PER_PERSON" | "PER_DAY" | "PER_PERSON_DAY" | "PER_PERSON_HOUR";

interface VenueBase {
  id: string;
  organizationId: string;
  name: string;
  email: string;
  street: string;
  streetNumber: string;
  complement: string | null;
  neighborhood: string;
  city: string;
  state: string;
  cep: string;
  checkIn: string;
  checkOut: string;
  hasOvernightStay: boolean;
  pricingModel: PricingModel;
  maxGuest: number;
  capacity: number;
  upcomingEvents: number;
  description: string;
  address: string;
  photos: string[];
  amenities: string[];
  contactEmail: string;
  contactPhone: string;
}

interface PerPersonVenue extends VenueBase {
  pricingModel: "PER_PERSON";
  pricePerPerson: number;
  pricePerDay?: null;
  pricePerPersonDay?: null;
  pricePerPersonHour?: null;
}

interface PerDayVenue extends VenueBase {
  pricingModel: "PER_DAY";
  pricePerPerson?: null;
  pricePerDay: number;
  pricePerPersonDay?: null;
  pricePerPersonHour?: null;
}

interface PerPersonDayVenue extends VenueBase {
  pricingModel: "PER_PERSON_DAY";
  pricePerPerson?: null;
  pricePerDay?: null;
  pricePerPersonDay: number;
  pricePerPersonHour?: null;
}

interface PerPersonHourVenue extends VenueBase {
  pricingModel: "PER_PERSON_HOUR";
  pricePerPerson?: null;
  pricePerDay?: null;
  pricePerPersonDay?: null;
  pricePerPersonHour: number;
}

type Venue = PerPersonVenue | PerDayVenue | PerPersonDayVenue | PerPersonHourVenue;

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

// Enums para pricing model
const pricingModels = [
  { value: "PER_PERSON", label: "Por pessoa" },
  { value: "PER_DAY", label: "Por dia" },
  { value: "PER_PERSON_DAY", label: "Por pessoa/dia" },
  { value: "PER_PERSON_HOUR", label: "Por pessoa/hora" },
];

// Dados mock realistas para venues (espaços)
const mockVenues: Venue[] = [
  {
    id: "venue-1",
    organizationId: "1",
    name: "Espaço Villa Verde",
    email: "contato@villaverde.com",
    street: "Rua das Palmeiras",
    streetNumber: "1500",
    complement: "Próximo ao Shopping",
    neighborhood: "Jardim Paulista",
    city: "São Paulo",
    state: "SP",
    cep: "01452-001",
    checkIn: "14:00",
    checkOut: "12:00",
    hasOvernightStay: true,
    pricingModel: "PER_PERSON",
    pricePerPerson: 150.00,
    maxGuest: 350,
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
    email: "eventos@diamante.com",
    street: "Av. Brasil",
    streetNumber: "789",
    complement: null,
    neighborhood: "Jardins",
    city: "São Paulo",
    state: "SP",
    cep: "01431-000",
    checkIn: "12:00",
    checkOut: "10:00",
    hasOvernightStay: false,
    pricingModel: "PER_DAY",
    pricePerDay: 5000.00,
    maxGuest: 200,
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
    email: "comercial@salaonobre.com",
    street: "Rua dos Ipês",
    streetNumber: "350",
    complement: "Pavilhão A",
    neighborhood: "Alto de Pinheiros",
    city: "São Paulo",
    state: "SP",
    cep: "05463-000",
    checkIn: "15:00",
    checkOut: "14:00",
    hasOvernightStay: true,
    pricingModel: "PER_PERSON_DAY",
    pricePerPersonDay: 200.00,
    maxGuest: 500,
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
    email: "contato@buffetsonhos.com.br",
    street: "Alameda Santos",
    streetNumber: "450",
    complement: "Andar 2",
    neighborhood: "Cerqueira César",
    city: "São Paulo",
    state: "SP",
    cep: "01419-000",
    checkIn: "10:00",
    checkOut: "22:00",
    hasOvernightStay: false,
    pricingModel: "PER_PERSON",
    pricePerPerson: 120.00,
    maxGuest: 150,
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
    email: "eventos@pavilhaodasflores.com",
    street: "Estrada das Flores",
    streetNumber: "KM 5",
    complement: null,
    neighborhood: "Granja Viana",
    city: "Cotia",
    state: "SP",
    cep: "06713-100",
    checkIn: "08:00",
    checkOut: "18:00",
    hasOvernightStay: false,
    pricingModel: "PER_DAY",
    pricePerDay: 8000.00,
    maxGuest: 400,
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
    email: "",
    street: "",
    streetNumber: "",
    complement: "",
    neighborhood: "",
    city: "",
    state: "",
    cep: "",
    checkIn: "12:00",
    checkOut: "12:00",
    hasOvernightStay: false,
    pricingModel: "PER_PERSON" as PricingModel,
    pricePerPerson: "",
    pricePerDay: "",
    pricePerPersonDay: "",
    pricePerPersonHour: "",
    maxGuest: "",
    description: "",
  });
  
  const organization = organizations.find((org) => org.id === organizationId);
  const [venues, setVenues] = useState<Venue[]>(
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

  const handlePricingModelChange = (value: PricingModel) => {
    setNewVenue(prev => ({ ...prev, pricingModel: value }));
  };
  
  const handleCreateVenue = () => {
    if (!newVenue.name.trim() || !newVenue.street.trim() || !newVenue.cep.trim()) {
      toast({
        title: "Erro",
        description: "Campos obrigatórios não preenchidos",
        variant: "destructive",
      });
      return;
    }

    const maxGuests = parseInt(newVenue.maxGuest);
    if (isNaN(maxGuests) || maxGuests <= 0) {
      toast({
        title: "Erro",
        description: "Capacidade máxima deve ser um número positivo",
        variant: "destructive",
      });
      return;
    }

    let price: number | null = null;
    switch (newVenue.pricingModel) {
      case 'PER_PERSON':
        price = parseFloat(newVenue.pricePerPerson);
        break;
      case 'PER_DAY':
        price = parseFloat(newVenue.pricePerDay);
        break;
      case 'PER_PERSON_DAY':
        price = parseFloat(newVenue.pricePerPersonDay);
        break;
      case 'PER_PERSON_HOUR':
        price = parseFloat(newVenue.pricePerPersonHour);
        break;
    }

    if (isNaN(price) || price <= 0) {
      toast({
        title: "Erro",
        description: "Valor do preço deve ser válido",
        variant: "destructive",
      });
      return;
    }

    const baseVenueData = {
      id: `venue-${Date.now()}`,
      organizationId: organizationId || "1",
      name: newVenue.name,
      email: newVenue.email,
      street: newVenue.street,
      streetNumber: newVenue.streetNumber,
      complement: newVenue.complement || null,
      neighborhood: newVenue.neighborhood,
      city: newVenue.city,
      state: newVenue.state,
      cep: newVenue.cep,
      checkIn: newVenue.checkIn,
      checkOut: newVenue.checkOut,
      hasOvernightStay: newVenue.hasOvernightStay,
      maxGuest: maxGuests,
      capacity: maxGuests, // For UI compatibility
      upcomingEvents: 0,
      description: newVenue.description,
      address: `${newVenue.street}, ${newVenue.streetNumber}, ${newVenue.city}`,
      photos: [],
      amenities: [],
      contactEmail: newVenue.email,
      contactPhone: "",
    };

    let newVenueObj: Venue;
    
    switch (newVenue.pricingModel) {
      case 'PER_PERSON':
        newVenueObj = {
          ...baseVenueData,
          pricingModel: 'PER_PERSON',
          pricePerPerson: parseFloat(newVenue.pricePerPerson),
        } as PerPersonVenue;
        break;
      case 'PER_DAY':
        newVenueObj = {
          ...baseVenueData,
          pricingModel: 'PER_DAY',
          pricePerDay: parseFloat(newVenue.pricePerDay),
        } as PerDayVenue;
        break;
      case 'PER_PERSON_DAY':
        newVenueObj = {
          ...baseVenueData,
          pricingModel: 'PER_PERSON_DAY',
          pricePerPersonDay: parseFloat(newVenue.pricePerPersonDay),
        } as PerPersonDayVenue;
        break;
      case 'PER_PERSON_HOUR':
        newVenueObj = {
          ...baseVenueData,
          pricingModel: 'PER_PERSON_HOUR',
          pricePerPersonHour: parseFloat(newVenue.pricePerPersonHour),
        } as PerPersonHourVenue;
        break;
      default:
        // Default case to make TypeScript happy
        newVenueObj = {
          ...baseVenueData,
          pricingModel: 'PER_PERSON',
          pricePerPerson: parseFloat(newVenue.pricePerPerson) || 0,
        } as PerPersonVenue;
    }

    setVenues([...venues, newVenueObj]);
    setNewVenue({
      name: "",
      email: "",
      street: "",
      streetNumber: "",
      complement: "",
      neighborhood: "",
      city: "",
      state: "",
      cep: "",
      checkIn: "12:00",
      checkOut: "12:00",
      hasOvernightStay: false,
      pricingModel: "PER_PERSON",
      pricePerPerson: "",
      pricePerDay: "",
      pricePerPersonDay: "",
      pricePerPersonHour: "",
      maxGuest: "",
      description: "",
    });
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
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Novo Espaço</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto pr-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Nome do Espaço*</Label>
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
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="email@espaco.com"
                  value={newVenue.email}
                  onChange={(e) =>
                    setNewVenue({ ...newVenue, email: e.target.value })
                  }
                />
              </div>
            </div>

            {/* Endereço */}
            <h3 className="font-semibold text-md mt-2">Endereço</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="street">Rua/Avenida*</Label>
                <Input
                  id="street"
                  placeholder="Nome da rua"
                  value={newVenue.street}
                  onChange={(e) =>
                    setNewVenue({ ...newVenue, street: e.target.value })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="streetNumber">Número*</Label>
                <Input
                  id="streetNumber"
                  placeholder="123"
                  value={newVenue.streetNumber}
                  onChange={(e) =>
                    setNewVenue({ ...newVenue, streetNumber: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="complement">Complemento</Label>
                <Input
                  id="complement"
                  placeholder="Apto, sala, etc"
                  value={newVenue.complement}
                  onChange={(e) =>
                    setNewVenue({ ...newVenue, complement: e.target.value })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="neighborhood">Bairro*</Label>
                <Input
                  id="neighborhood"
                  placeholder="Nome do bairro"
                  value={newVenue.neighborhood}
                  onChange={(e) =>
                    setNewVenue({ ...newVenue, neighborhood: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="city">Cidade*</Label>
                <Input
                  id="city"
                  placeholder="Nome da cidade"
                  value={newVenue.city}
                  onChange={(e) =>
                    setNewVenue({ ...newVenue, city: e.target.value })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="state">Estado*</Label>
                <Input
                  id="state"
                  placeholder="UF"
                  value={newVenue.state}
                  onChange={(e) =>
                    setNewVenue({ ...newVenue, state: e.target.value })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="cep">CEP*</Label>
                <Input
                  id="cep"
                  placeholder="00000-000"
                  value={newVenue.cep}
                  onChange={(e) =>
                    setNewVenue({ ...newVenue, cep: e.target.value })
                  }
                />
              </div>
            </div>
            
            {/* Check-in/Check-out */}
            <h3 className="font-semibold text-md mt-2">Horários</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="checkIn">Check-in</Label>
                <Input
                  id="checkIn"
                  type="time"
                  value={newVenue.checkIn}
                  onChange={(e) =>
                    setNewVenue({ ...newVenue, checkIn: e.target.value })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="checkOut">Check-out</Label>
                <Input
                  id="checkOut"
                  type="time"
                  value={newVenue.checkOut}
                  onChange={(e) =>
                    setNewVenue({ ...newVenue, checkOut: e.target.value })
                  }
                />
              </div>
              <div className="grid gap-2 items-center">
                <div className="flex items-center space-x-2 mt-6">
                  <Checkbox 
                    id="hasOvernightStay" 
                    checked={newVenue.hasOvernightStay}
                    onCheckedChange={(checked) =>
                      setNewVenue({ ...newVenue, hasOvernightStay: !!checked })
                    }
                  />
                  <Label htmlFor="hasOvernightStay" className="mt-0">Permite pernoite</Label>
                </div>
              </div>
            </div>
            
            {/* Preços */}
            <h3 className="font-semibold text-md mt-2">Preços</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="pricingModel">Modelo de precificação*</Label>
                <Select 
                  value={newVenue.pricingModel} 
                  onValueChange={handlePricingModelChange}
                >
                  <SelectTrigger id="pricingModel">
                    <SelectValue placeholder="Selecione um modelo" />
                  </SelectTrigger>
                  <SelectContent>
                    {pricingModels.map(model => (
                      <SelectItem key={model.value} value={model.value}>
                        {model.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {newVenue.pricingModel === 'PER_PERSON' && (
                <div className="grid gap-2">
                  <Label htmlFor="pricePerPerson">Preço por pessoa (R$)*</Label>
                  <Input
                    id="pricePerPerson"
                    type="number"
                    placeholder="0.00"
                    value={newVenue.pricePerPerson}
                    onChange={(e) =>
                      setNewVenue({ ...newVenue, pricePerPerson: e.target.value })
                    }
                  />
                </div>
              )}
              
              {newVenue.pricingModel === 'PER_DAY' && (
                <div className="grid gap-2">
                  <Label htmlFor="pricePerDay">Preço por dia (R$)*</Label>
                  <Input
                    id="pricePerDay"
                    type="number"
                    placeholder="0.00"
                    value={newVenue.pricePerDay}
                    onChange={(e) =>
                      setNewVenue({ ...newVenue, pricePerDay: e.target.value })
                    }
                  />
                </div>
              )}
              
              {newVenue.pricingModel === 'PER_PERSON_DAY' && (
                <div className="grid gap-2">
                  <Label htmlFor="pricePerPersonDay">Preço por pessoa/dia (R$)*</Label>
                  <Input
                    id="pricePerPersonDay"
                    type="number"
                    placeholder="0.00"
                    value={newVenue.pricePerPersonDay}
                    onChange={(e) =>
                      setNewVenue({ ...newVenue, pricePerPersonDay: e.target.value })
                    }
                  />
                </div>
              )}
              
              {newVenue.pricingModel === 'PER_PERSON_HOUR' && (
                <div className="grid gap-2">
                  <Label htmlFor="pricePerPersonHour">Preço por pessoa/hora (R$)*</Label>
                  <Input
                    id="pricePerPersonHour"
                    type="number"
                    placeholder="0.00"
                    value={newVenue.pricePerPersonHour}
                    onChange={(e) =>
                      setNewVenue({ ...newVenue, pricePerPersonHour: e.target.value })
                    }
                  />
                </div>
              )}
            </div>
            
            {/* Capacidade */}
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="maxGuest">Capacidade máxima (pessoas)*</Label>
                <Input
                  id="maxGuest"
                  type="number"
                  placeholder="Ex: 200"
                  value={newVenue.maxGuest}
                  onChange={(e) =>
                    setNewVenue({ ...newVenue, maxGuest: e.target.value })
                  }
                />
              </div>
            </div>
            
            {/* Descrição */}
            <div className="grid gap-2">
              <Label htmlFor="description">Descrição</Label>
              <Input
                id="description"
                placeholder="Descrição do espaço"
                value={newVenue.description}
                onChange={(e) =>
                  setNewVenue({ ...newVenue, description: e.target.value })
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
