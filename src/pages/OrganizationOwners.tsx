
import { useState } from "react";
import { useParams } from "react-router-dom";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Search, Plus, Check, Edit, Trash2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/hooks/use-toast";
import { Owner } from "@/types/owner";

// Mock data for venues
const mockVenues = [
  { id: "1", name: "Espaço Villa Verde" },
  { id: "2", name: "Casa de Festas Diamante" },
  { id: "3", name: "Salão Nobre" },
  { id: "4", name: "Ar756" }
];

// Mock data for owners
const mockOwners: Owner[] = [
  {
    id: "1",
    completeName: "Carlos Alberto Silva",
    cpf: "123.456.789-00",
    rg: "12.345.678-9",
    pix: "carlos@email.com",
    street: "Rua das Flores",
    streetNumber: "123",
    complement: "Apto 101",
    neighborhood: "Centro",
    city: "São Paulo",
    state: "SP",
    cep: "01234-567",
    bankName: "Banco do Brasil",
    bankAgency: "1234",
    bankAccountNumber: "12345-6",
    organizationId: "2",
    venues: ["1", "3"],
  },
  {
    id: "2",
    completeName: "Ana Maria Santos",
    cpf: "987.654.321-00",
    rg: "98.765.432-1",
    pix: "ana@email.com",
    street: "Avenida Brasil",
    streetNumber: "456",
    complement: null,
    neighborhood: "Jardins",
    city: "São Paulo",
    state: "SP",
    cep: "04567-890",
    bankName: "Itaú",
    bankAgency: "5678",
    bankAccountNumber: "56789-0",
    organizationId: "2",
    venues: ["2"],
  }
];

// Form schema for owner
const ownerSchema = z.object({
  completeName: z.string().min(1, "Nome completo é obrigatório"),
  cpf: z.string().min(1, "CPF é obrigatório"),
  rg: z.string().optional().nullable(),
  pix: z.string().min(1, "PIX é obrigatório"),
  street: z.string().min(1, "Rua é obrigatória"),
  streetNumber: z.string().min(1, "Número é obrigatório"),
  complement: z.string().optional().nullable(),
  neighborhood: z.string().min(1, "Bairro é obrigatório"),
  city: z.string().min(1, "Cidade é obrigatória"),
  state: z.string().min(1, "Estado é obrigatório"),
  cep: z.string().min(1, "CEP é obrigatório"),
  bankName: z.string().min(1, "Nome do banco é obrigatório"),
  bankAgency: z.string().min(1, "Agência é obrigatória"),
  bankAccountNumber: z.string().min(1, "Número da conta é obrigatório"),
  venues: z.array(z.string()).optional(),
});

type OwnerFormValues = z.infer<typeof ownerSchema>;

export default function OrganizationOwners() {
  const { id: organizationId } = useParams<{ id: string }>();
  const { toast } = useToast();
  
  const [owners, setOwners] = useState<Owner[]>(mockOwners);
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentOwner, setCurrentOwner] = useState<Owner | null>(null);
  const [venueEditDialogOpen, setVenueEditDialogOpen] = useState(false);
  const [currentVenues, setCurrentVenues] = useState<string[]>([]);
  
  // Filter owners by search term
  const filteredOwners = owners.filter(owner => 
    owner.completeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    owner.cpf.includes(searchTerm)
  );
  
  // Form for creating/editing owners
  const form = useForm<OwnerFormValues>({
    resolver: zodResolver(ownerSchema),
    defaultValues: {
      completeName: "",
      cpf: "",
      rg: "",
      pix: "",
      street: "",
      streetNumber: "",
      complement: "",
      neighborhood: "",
      city: "",
      state: "",
      cep: "",
      bankName: "",
      bankAgency: "",
      bankAccountNumber: "",
      venues: [],
    }
  });
  
  const onSubmit = (data: OwnerFormValues) => {
    if (isEditing && currentOwner) {
      // Update existing owner
      const updatedOwners = owners.map(owner => 
        owner.id === currentOwner.id ? { ...owner, ...data } : owner
      );
      
      setOwners(updatedOwners);
      toast({
        title: "Proprietário atualizado",
        description: "Os dados do proprietário foram atualizados com sucesso.",
      });
    } else {
      // Create new owner
      const newOwner: Owner = {
        id: Date.now().toString(),
        organizationId: organizationId || "",
        completeName: data.completeName,
        cpf: data.cpf,
        rg: data.rg || null,
        pix: data.pix,
        street: data.street,
        streetNumber: data.streetNumber,
        complement: data.complement || null,
        neighborhood: data.neighborhood,
        city: data.city,
        state: data.state,
        cep: data.cep,
        bankName: data.bankName,
        bankAgency: data.bankAgency,
        bankAccountNumber: data.bankAccountNumber,
        venues: data.venues || [],
      };
      
      setOwners([...owners, newOwner]);
      toast({
        title: "Proprietário adicionado",
        description: "O novo proprietário foi adicionado com sucesso.",
      });
    }
    
    resetForm();
  };
  
  const handleEdit = (owner: Owner) => {
    setCurrentOwner(owner);
    setIsEditing(true);
    
    form.reset({
      completeName: owner.completeName,
      cpf: owner.cpf,
      rg: owner.rg || "",
      pix: owner.pix,
      street: owner.street,
      streetNumber: owner.streetNumber,
      complement: owner.complement || "",
      neighborhood: owner.neighborhood,
      city: owner.city,
      state: owner.state,
      cep: owner.cep,
      bankName: owner.bankName,
      bankAgency: owner.bankAgency,
      bankAccountNumber: owner.bankAccountNumber,
      venues: owner.venues || [],
    });
  };
  
  const handleDelete = (ownerId: string) => {
    setOwners(owners.filter(owner => owner.id !== ownerId));
    toast({
      title: "Proprietário removido",
      description: "O proprietário foi removido com sucesso.",
    });
  };
  
  const resetForm = () => {
    setIsCreating(false);
    setIsEditing(false);
    setCurrentOwner(null);
    form.reset();
  };
  
  const handleEditVenues = (owner: Owner) => {
    setCurrentOwner(owner);
    setCurrentVenues(owner.venues || []);
    setVenueEditDialogOpen(true);
  };
  
  const handleToggleVenue = (venueId: string) => {
    setCurrentVenues(prev => {
      if (prev.includes(venueId)) {
        return prev.filter(id => id !== venueId);
      } else {
        return [...prev, venueId];
      }
    });
  };
  
  const handleSaveVenues = () => {
    if (!currentOwner) return;
    
    const updatedOwners = owners.map(owner => 
      owner.id === currentOwner.id ? { ...owner, venues: currentVenues } : owner
    );
    
    setOwners(updatedOwners);
    setVenueEditDialogOpen(false);
    
    toast({
      title: "Espaços atualizados",
      description: "Os espaços do proprietário foram atualizados com sucesso.",
    });
  };

  return (
    <DashboardLayout
      title="Proprietários"
      subtitle="Gerenciar proprietários da organização"
    >
      {/* Owner List View */}
      {!isCreating && !isEditing && (
        <>
          <div className="flex justify-between items-center mb-6">
            <div className="relative w-full max-w-xs">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input 
                placeholder="Buscar proprietários..." 
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button onClick={() => setIsCreating(true)} className="flex items-center gap-1">
              <Plus className="h-4 w-4" />
              Novo Proprietário
            </Button>
          </div>
          
          {/* Owner List */}
          <div className="bg-white rounded-lg border shadow-sm">
            {filteredOwners.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                Nenhum proprietário encontrado
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>CPF</TableHead>
                    <TableHead>Espaços</TableHead>
                    <TableHead className="w-[100px]">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOwners.map((owner) => {
                    const ownerVenueCount = owner.venues?.length || 0;
                    
                    return (
                      <TableRow key={owner.id}>
                        <TableCell className="font-medium">{owner.completeName}</TableCell>
                        <TableCell>{owner.cpf}</TableCell>
                        <TableCell>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleEditVenues(owner)}
                          >
                            {ownerVenueCount} {ownerVenueCount === 1 ? 'espaço' : 'espaços'}
                          </Button>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => handleEdit(owner)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              className="text-red-600 hover:text-red-700"
                              onClick={() => handleDelete(owner.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </div>
        </>
      )}
      
      {/* Owner Form */}
      {(isCreating || isEditing) && (
        <div className="bg-white rounded-lg border shadow-sm p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">
              {isEditing ? 'Editar Proprietário' : 'Novo Proprietário'}
            </h2>
            <Button variant="outline" size="sm" onClick={resetForm}>
              Voltar
            </Button>
          </div>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="completeName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome Completo</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="cpf"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>CPF</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="rg"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>RG</FormLabel>
                      <FormControl>
                        <Input {...field} value={field.value || ""} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="pix"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>PIX</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="street"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Rua</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="streetNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Número</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="complement"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Complemento</FormLabel>
                      <FormControl>
                        <Input {...field} value={field.value || ""} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="neighborhood"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bairro</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cidade</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="state"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Estado</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="cep"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>CEP</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="bankName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Banco</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="bankAgency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Agência</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="bankAccountNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Número da Conta</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={resetForm}>
                  Cancelar
                </Button>
                <Button type="submit">
                  {isEditing ? 'Salvar' : 'Cadastrar'}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      )}
      
      {/* Venue Selection Dialog */}
      <Dialog open={venueEditDialogOpen} onOpenChange={setVenueEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              Selecionar Espaços
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 my-4">
            <p className="text-sm text-gray-500">
              Selecione os espaços para este proprietário:
            </p>
            
            {mockVenues.map((venue) => {
              const isSelected = currentVenues.includes(venue.id);
              
              return (
                <div 
                  key={venue.id}
                  className={`flex items-center justify-between p-3 border rounded-md cursor-pointer ${isSelected ? 'bg-blue-50 border-blue-200' : ''}`}
                  onClick={() => handleToggleVenue(venue.id)}
                >
                  <span>{venue.name}</span>
                  <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${isSelected ? 'bg-blue-600 border-blue-600' : 'border-gray-300'}`}>
                    {isSelected && <Check className="h-3 w-3 text-white" />}
                  </div>
                </div>
              );
            })}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setVenueEditDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveVenues}>
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
