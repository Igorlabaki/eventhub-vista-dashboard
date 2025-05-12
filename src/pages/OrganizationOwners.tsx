
import { useState } from "react";
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { DashboardLayout } from "@/components/DashboardLayout";
import { User, Edit, Trash2, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

// Define Owner type
type Owner = {
  id: string;
  completeName: string;
  rg: string;
  cpf: string;
  pix: string;
  street: string;
  streetNumber: string;
  complement: string;
  neighborhood: string;
  city: string;
  state: string;
  bankName: string;
  bankAgency: string;
  cep: string;
  bankAccountNumber: string;
  organizationId: string;
  venues: string[];
};

// Mock data for owners
const mockOwners: Owner[] = [
  {
    id: "1",
    completeName: "João da Silva",
    rg: "12345678-9",
    cpf: "123.456.789-00",
    pix: "joao@example.com",
    street: "Rua das Flores",
    streetNumber: "123",
    complement: "Apto 101",
    neighborhood: "Centro",
    city: "São Paulo",
    state: "SP",
    bankName: "Banco do Brasil",
    bankAgency: "1234",
    bankAccountNumber: "12345-6",
    cep: "01234-567",
    organizationId: "1",
    venues: ["1", "2"]
  },
  {
    id: "2",
    completeName: "Maria Oliveira",
    rg: "98765432-1",
    cpf: "987.654.321-00",
    pix: "11987654321",
    street: "Av. Paulista",
    streetNumber: "1000",
    complement: "Sala 50",
    neighborhood: "Bela Vista",
    city: "São Paulo",
    state: "SP",
    bankName: "Itaú",
    bankAgency: "5678",
    bankAccountNumber: "56789-0",
    cep: "04567-890",
    organizationId: "1",
    venues: ["3"]
  }
];

// Mock data for venues
const mockVenues = [
  { id: "1", name: "Espaço Villa Verde" },
  { id: "2", name: "Casa de Festas Diamante" },
  { id: "3", name: "Salão Nobre" },
  { id: "4", name: "Ar756" }
];

// Define schema for owner form
const ownerFormSchema = z.object({
  completeName: z.string().min(1, "Nome completo é obrigatório"),
  rg: z.string().optional(),
  cpf: z.string().min(1, "CPF é obrigatório"),
  pix: z.string().min(1, "Chave PIX é obrigatória"),
  street: z.string().min(1, "Rua é obrigatória"),
  streetNumber: z.string().min(1, "Número é obrigatório"),
  complement: z.string().optional(),
  neighborhood: z.string().min(1, "Bairro é obrigatório"),
  city: z.string().min(1, "Cidade é obrigatória"),
  state: z.string().min(1, "Estado é obrigatório"),
  bankName: z.string().min(1, "Nome do banco é obrigatório"),
  bankAgency: z.string().min(1, "Agência é obrigatória"),
  bankAccountNumber: z.string().min(1, "Número da conta é obrigatório"),
  cep: z.string().min(1, "CEP é obrigatório"),
  venues: z.array(z.string()).optional()
});

type OwnerFormValues = z.infer<typeof ownerFormSchema>;

export default function OrganizationOwners() {
  const { id: organizationId } = useParams<{ id: string }>();
  const { toast } = useToast();
  
  const [owners, setOwners] = useState<Owner[]>(mockOwners.filter(owner => owner.organizationId === organizationId));
  const [selectedOwner, setSelectedOwner] = useState<Owner | null>(null);
  const [isAddNewOpen, setIsAddNewOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedVenues, setSelectedVenues] = useState<string[]>([]);

  const form = useForm<OwnerFormValues>({
    resolver: zodResolver(ownerFormSchema),
    defaultValues: {
      completeName: "",
      rg: "",
      cpf: "",
      pix: "",
      street: "",
      streetNumber: "",
      complement: "",
      neighborhood: "",
      city: "",
      state: "",
      bankName: "",
      bankAgency: "",
      bankAccountNumber: "",
      cep: "",
      venues: []
    }
  });

  const handleAddNew = () => {
    form.reset({
      completeName: "",
      rg: "",
      cpf: "",
      pix: "",
      street: "",
      streetNumber: "",
      complement: "",
      neighborhood: "",
      city: "",
      state: "",
      bankName: "",
      bankAgency: "",
      bankAccountNumber: "",
      cep: "",
      venues: []
    });
    setSelectedVenues([]);
    setIsAddNewOpen(true);
  };

  const handleEditOwner = (owner: Owner) => {
    setSelectedOwner(owner);
    form.reset({
      ...owner,
      venues: owner.venues || []
    });
    setSelectedVenues(owner.venues || []);
    setIsEditOpen(true);
  };

  const handleDeleteOwner = (owner: Owner) => {
    setSelectedOwner(owner);
    setIsDeleteOpen(true);
  };

  const handleConfirmDelete = () => {
    if (selectedOwner) {
      setOwners(owners.filter(owner => owner.id !== selectedOwner.id));
      setIsDeleteOpen(false);
      setSelectedOwner(null);
      
      toast({
        title: "Sucesso",
        description: "Proprietário removido com sucesso",
      });
    }
  };

  const onSubmit = (data: OwnerFormValues) => {
    if (isAddNewOpen) {
      // Add new owner logic
      const newOwner: Owner = {
        ...data,
        id: `owner-${Date.now()}`,
        organizationId: organizationId || "",
        rg: data.rg || "",
        complement: data.complement || "",
        venues: data.venues || []
      };
      
      setOwners([...owners, newOwner]);
      toast({
        title: "Sucesso",
        description: "Proprietário adicionado com sucesso",
      });
      setIsAddNewOpen(false);
    } else if (isEditOpen && selectedOwner) {
      // Update owner logic
      const updatedOwners = owners.map(owner => 
        owner.id === selectedOwner.id ? { 
          ...owner, 
          ...data, 
          rg: data.rg || "",
          complement: data.complement || "",
          venues: data.venues || []
        } : owner
      );
      
      setOwners(updatedOwners);
      toast({
        title: "Sucesso",
        description: "Proprietário atualizado com sucesso",
      });
      setIsEditOpen(false);
    }
  };

  return (
    <DashboardLayout
      title="Proprietários"
      subtitle="Gerencie os proprietários da organização"
    >
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-800">
          Proprietários ({owners.length})
        </h2>
        <Button onClick={handleAddNew}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Proprietário
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {owners.length === 0 ? (
          <div className="text-center py-10 bg-gray-50 rounded-lg border border-dashed border-gray-300">
            <p className="text-gray-500">Nenhum proprietário cadastrado</p>
            <Button 
              variant="link" 
              onClick={handleAddNew}
              className="mt-2"
            >
              Cadastrar primeiro proprietário
            </Button>
          </div>
        ) : (
          owners.map((owner) => (
            <div key={owner.id} className="flex justify-between items-center p-4 border rounded-lg bg-white hover:shadow transition-shadow duration-200">
              <div>
                <h3 className="font-medium text-gray-800">{owner.completeName}</h3>
                <p className="text-sm text-gray-500">{owner.cpf}</p>
                <div className="mt-1 flex flex-wrap gap-2">
                  {owner.venues && owner.venues.map(venueId => {
                    const venue = mockVenues.find(v => v.id === venueId);
                    return venue ? (
                      <span key={venueId} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                        {venue.name}
                      </span>
                    ) : null;
                  })}
                </div>
              </div>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm" onClick={() => handleEditOwner(owner)}>
                  <Edit className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleDeleteOwner(owner)}>
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add/Edit Owner Dialog */}
      <Dialog open={isAddNewOpen || isEditOpen} onOpenChange={(open) => {
        if (!open) {
          setIsAddNewOpen(false);
          setIsEditOpen(false);
        }
      }}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {isAddNewOpen ? "Adicionar Novo Proprietário" : "Editar Proprietário"}
            </DialogTitle>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="completeName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome Completo</FormLabel>
                      <FormControl>
                        <Input placeholder="Nome completo" {...field} />
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
                        <Input placeholder="RG" {...field} />
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
                        <Input placeholder="CPF" {...field} />
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
                      <FormLabel>Chave PIX</FormLabel>
                      <FormControl>
                        <Input placeholder="Chave PIX" {...field} />
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
                        <Input placeholder="CEP" {...field} />
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
                        <Input placeholder="Rua" {...field} />
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
                        <Input placeholder="Número" {...field} />
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
                        <Input placeholder="Complemento" {...field} />
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
                        <Input placeholder="Bairro" {...field} />
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
                        <Input placeholder="Cidade" {...field} />
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
                        <Input placeholder="Estado" {...field} />
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
                        <Input placeholder="Nome do Banco" {...field} />
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
                        <Input placeholder="Agência" {...field} />
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
                      <FormLabel>Conta</FormLabel>
                      <FormControl>
                        <Input placeholder="Número da Conta" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="mt-4">
                <Label>Espaços</Label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {mockVenues.map((venue) => (
                    <div key={venue.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`venue-${venue.id}`}
                        checked={form.watch("venues")?.includes(venue.id)}
                        onCheckedChange={(checked) => {
                          const currentVenues = form.getValues("venues") || [];
                          if (checked) {
                            form.setValue("venues", [...currentVenues, venue.id]);
                          } else {
                            form.setValue(
                              "venues",
                              currentVenues.filter((id) => id !== venue.id)
                            );
                          }
                        }}
                      />
                      <Label htmlFor={`venue-${venue.id}`}>{venue.name}</Label>
                    </div>
                  ))}
                </div>
              </div>
              
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => {
                  setIsAddNewOpen(false);
                  setIsEditOpen(false);
                }}>
                  Cancelar
                </Button>
                <Button type="submit">
                  {isAddNewOpen ? "Adicionar" : "Salvar"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Owner Dialog */}
      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Essa ação não pode ser desfeita. Esta operação irá excluir permanentemente o proprietário "{selectedOwner?.completeName}" e todas suas associações.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} className="bg-red-600 hover:bg-red-700">
              Deletar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}
