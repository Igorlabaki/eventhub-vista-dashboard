import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Owner, CreateOwnerDTO } from "@/types/owner";
import { useCreateOrganizationOwnerMutations, useCreateVenueOwnerMutations } from "@/hooks/owner/mutations/create";
import { useUpdateOwnerMutations } from "@/hooks/owner/mutations/update";
import { showSuccessToast } from "../ui/success-toast";

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
  venueIds: z.array(z.string()).optional(),
});

type OwnerFormValues = z.infer<typeof ownerSchema>;

interface OwnerFormProps {
  owner?: Owner;
  organizationId: string;
  onCancel: () => void;
  isEditing: boolean;
}

export function OwnerForm({ owner, organizationId, onCancel, isEditing }: OwnerFormProps) {
  const { toast } = useToast();
  const { createOrganizationOwner } = useCreateOrganizationOwnerMutations(organizationId);
  const { updateOwner } = useUpdateOwnerMutations(organizationId);

  const form = useForm<OwnerFormValues>({
    resolver: zodResolver(ownerSchema),
    defaultValues: {
      completeName: owner?.completeName || "",
      cpf: owner?.cpf || "",
      rg: owner?.rg || "",
      pix: owner?.pix || "",
      street: owner?.street || "",
      streetNumber: owner?.streetNumber || "",
      complement: owner?.complement || "",
      neighborhood: owner?.neighborhood || "",
      city: owner?.city || "",
      state: owner?.state || "",
      cep: owner?.cep || "",
      bankName: owner?.bankName || "",
      bankAgency: owner?.bankAgency || "",
      bankAccountNumber: owner?.bankAccountNumber || "",
      venueIds: owner?.ownerVenue?.map(ov => ov.venueId) || [],
    },
  });

  const onSubmit = async (data: OwnerFormValues) => {
    try {
      if (isEditing && owner) {
        await updateOwner.mutateAsync({ 
          ownerId: owner.id, 
          data 
        });
        
        showSuccessToast({
          title: "Proprietário atualizado",
          description: "Os dados do proprietário foram atualizados com sucesso.",
        });
      } else {
        const createData: CreateOwnerDTO = {
          completeName: data.completeName,
          cpf: data.cpf,
          rg: data.rg || undefined,
          pix: data.pix,
          street: data.street,
          streetNumber: data.streetNumber,
          complement: data.complement || undefined,
          neighborhood: data.neighborhood,
          city: data.city,
          state: data.state,
          cep: data.cep,
          bankName: data.bankName,
          bankAgency: data.bankAgency,
          bankAccountNumber: data.bankAccountNumber,
          organizationId,
          venueIds: data.venueIds,
        };

        await createOrganizationOwner.mutateAsync(createData);
        
        showSuccessToast({
          title: "Proprietário adicionado",
          description: "O novo proprietário foi adicionado com sucesso.",
        });
      }
      
      onCancel();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao salvar o proprietário.",
        variant: "destructive",
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
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
        </div>

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button type="submit">
            {isEditing ? "Atualizar" : "Criar"}
          </Button>
        </div>
      </form>
    </Form>
  );
} 