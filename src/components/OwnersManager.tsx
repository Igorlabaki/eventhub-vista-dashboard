
import { useState } from "react";
import { User, Edit, Trash2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

// Mock data for owners
const mockOwners = [
  {
    id: "1",
    completeName: "João da Silva",
    rg: "12.345.678-9",
    cpf: "123.456.789-00",
    pix: "joao@example.com",
    street: "Rua das Flores",
    streetNumber: "123",
    complement: "Apto 101",
    neighborhood: "Centro",
    city: "São Paulo",
    state: "SP",
    bankName: "Banco do Brasil",
    bankAgency: "1234-5",
    cep: "01234-567",
    bankAccountNumber: "12345-6",
    organizationId: "1",
    venues: ["1", "2"]
  },
  {
    id: "2",
    completeName: "Maria Oliveira",
    rg: "98.765.432-1",
    cpf: "987.654.321-00",
    pix: "maria@example.com",
    street: "Avenida Brasil",
    streetNumber: "456",
    complement: "",
    neighborhood: "Jardins",
    city: "São Paulo",
    state: "SP",
    bankName: "Itaú",
    bankAgency: "5678-9",
    cep: "05678-901",
    bankAccountNumber: "67890-1",
    organizationId: "1",
    venues: ["1"]
  }
];

// Mock data for venues
const mockVenues = [
  { id: "1", name: "Espaço Villa Verde", organizationId: "1" },
  { id: "2", name: "Casa de Festas Diamante", organizationId: "1" },
  { id: "3", name: "Salão Nobre", organizationId: "1" }
];

const ownerFormSchema = z.object({
  completeName: z.string().min(1, { message: "Nome completo é obrigatório" }),
  rg: z.string().optional(),
  cpf: z.string().min(11, { message: "CPF é obrigatório" }),
  pix: z.string().min(1, { message: "PIX é obrigatório" }),
  street: z.string().min(1, { message: "Rua é obrigatória" }),
  streetNumber: z.string().min(1, { message: "Número é obrigatório" }),
  complement: z.string().optional(),
  neighborhood: z.string().min(1, { message: "Bairro é obrigatório" }),
  city: z.string().min(1, { message: "Cidade é obrigatória" }),
  state: z.string().min(1, { message: "Estado é obrigatório" }),
  bankName: z.string().min(1, { message: "Nome do banco é obrigatório" }),
  bankAgency: z.string().min(1, { message: "Agência bancária é obrigatória" }),
  cep: z.string().min(1, { message: "CEP é obrigatório" }),
  bankAccountNumber: z.string().min(1, { message: "Número da conta é obrigatório" }),
  venues: z.array(z.string())
});

type OwnerFormValues = z.infer<typeof ownerFormSchema>;

interface OwnersManagerProps {
  organizationId: string;
  open: boolean;
  onClose: () => void;
}

export function OwnersManager({ organizationId, open, onClose }: OwnersManagerProps) {
  const { toast } = useToast();
  const [owners, setOwners] = useState(mockOwners);
  const [selectedOwner, setSelectedOwner] = useState<typeof mockOwners[0] | null>(null);
  const [isAddNewOpen, setIsAddNewOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

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
      cep: "",
      bankAccountNumber: "",
      venues: []
    }
  });

  const handleEditOwner = (owner: typeof mockOwners[0]) => {
    setSelectedOwner(owner);
    form.reset({
      ...owner,
      venues: owner.venues
    });
    setIsEditOpen(true);
  };

  const handleDeleteOwner = (owner: typeof mockOwners[0]) => {
    setSelectedOwner(owner);
    setIsDeleteOpen(true);
  };

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
      cep: "",
      bankAccountNumber: "",
      venues: []
    });
    setIsAddNewOpen(true);
  };

  const onSubmit = (data: OwnerFormValues) => {
    if (isAddNewOpen) {
      // Add new owner logic
      const newOwner = {
        ...data,
        id: `owner-${Date.now()}`,
        organizationId
      };
      setOwners([...owners, newOwner]);
      toast({
        title: "Sucesso",
        description: "Proprietário adicionado com sucesso!"
      });
      setIsAddNewOpen(false);
    } else if (isEditOpen && selectedOwner) {
      // Update owner logic
      const updatedOwners = owners.map(owner => 
        owner.id === selectedOwner.id ? { ...owner, ...data } : owner
      );
      setOwners(updatedOwners);
      toast({
        title: "Sucesso",
        description: "Proprietário atualizado com sucesso!"
      });
      setIsEditOpen(false);
    }
  };

  const handleConfirmDelete = () => {
    if (selectedOwner) {
      const updatedOwners = owners.filter(owner => owner.id !== selectedOwner.id);
      setOwners(updatedOwners);
      toast({
        title: "Sucesso",
        description: "Proprietário removido com sucesso!"
      });
      setIsDeleteOpen(false);
    }
  };

  if (!open) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Proprietários
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex justify-end mb-4">
          <Button onClick={handleAddNew}>
            <Plus className="h-4 w-4 mr-2" /> Novo Proprietário
          </Button>
        </div>

        {owners.length === 0 ? (
          <div className="text-center py-8 border border-dashed rounded-md">
            <p className="text-gray-500">Nenhum proprietário cadastrado</p>
          </div>
        ) : (
          <div className="space-y-4">
            {owners.map((owner) => (
              <div key={owner.id} className="p-4 border rounded-md shadow-sm">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium text-lg">{owner.completeName}</h4>
                    <p className="text-sm text-gray-500">CPF: {owner.cpf}</p>
                    <p className="text-sm text-gray-500">PIX: {owner.pix}</p>
                    <div className="mt-2">
                      <h5 className="text-sm font-medium">Espaços associados:</h5>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {owner.venues.map(venueId => {
                          const venue = mockVenues.find(v => v.id === venueId);
                          return venue ? (
                            <span key={venueId} className="text-xs bg-indigo-100 text-indigo-800 px-2 py-1 rounded">
                              {venue.name}
                            </span>
                          ) : null;
                        })}
                        {owner.venues.length === 0 && (
                          <span className="text-xs text-gray-500">Nenhum espaço associado</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="icon" onClick={() => handleEditOwner(owner)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDeleteOwner(owner)}>
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </DialogContent>

      {/* Form Dialog (Add/Edit) */}
      <Dialog open={isAddNewOpen || isEditOpen} onOpenChange={() => {
        if (isAddNewOpen) setIsAddNewOpen(false);
        if (isEditOpen) setIsEditOpen(false);
      }}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {isAddNewOpen ? "Novo Proprietário" : "Editar Proprietário"}
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
                        <Input {...field} />
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
                  name="bankName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome do Banco</FormLabel>
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
                
                {/* Venues selection would go here - simplified for now */}
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => {
                  if (isAddNewOpen) setIsAddNewOpen(false);
                  if (isEditOpen) setIsEditOpen(false);
                }}>
                  Cancelar
                </Button>
                <Button type="submit">
                  {isAddNewOpen ? "Criar" : "Salvar"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir proprietário</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir {selectedOwner?.completeName}? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} className="bg-red-600 hover:bg-red-700">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Dialog>
  );
}
