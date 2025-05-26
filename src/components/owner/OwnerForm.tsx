import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { showSuccessToast } from "@/components/ui/success-toast";
import { handleBackendSuccess, handleBackendError } from "@/lib/error-handler";
import { Owner } from "@/types/owner";
import { CreateOwnerDTO } from "@/types/owner";
import { useOwnerStore } from "@/store/ownerStore";
import InputMask from 'react-input-mask';
import { AsyncActionButton } from "@/components/AsyncActionButton";
import { FormLayout } from "@/components/ui/form-layout";

const formSchema = z.object({
  completeName: z.string().min(1, "Nome completo é obrigatório"),
  cpf: z.string().min(1, "CPF é obrigatório"),
  rg: z.string().optional(),
  pix: z.string().min(1, "PIX é obrigatório"),
  street: z.string().min(1, "Rua é obrigatória"),
  streetNumber: z.string().min(1, "Número é obrigatório"),
  complement: z.string().optional(),
  neighborhood: z.string().min(1, "Bairro é obrigatório"),
  city: z.string().min(1, "Cidade é obrigatória"),
  state: z.string().min(1, "Estado é obrigatório"),
  cep: z.string().min(1, "CEP é obrigatório"),
  bankName: z.string().min(1, "Nome do banco é obrigatório"),
  bankAgency: z.string().min(1, "Agência é obrigatória"),
  bankAccountNumber: z.string().min(1, "Número da conta é obrigatório"),
  venueIds: z.array(z.string()).optional(),
});

type OwnerFormValues = z.infer<typeof formSchema>;

interface OwnerFormProps {
  owner?: Owner;
  organizationId: string;
  onCancel: () => void;
}

export function OwnerForm({ owner, organizationId, onCancel }: OwnerFormProps) {
  const { toast } = useToast();
  const { createOrganizationOwner, updateOwner, deleteOwner } = useOwnerStore();
  const isEditing = !!owner;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const form = useForm<OwnerFormValues>({
    resolver: zodResolver(formSchema),
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

  const onSubmit = async () => {
    const isValid = await form.trigger();
    if (!isValid) return;

    setIsSubmitting(true);
    try {
      const data = form.getValues();
      let response;
      if (isEditing && owner) {
        const updateData = {
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
          venueIds: data.venueIds || [],
        };

        response = await updateOwner(owner.id, updateData);
        const { title, message } = handleBackendSuccess(response, "Proprietário atualizado com sucesso!");
        showSuccessToast({
          title,
          description: message
        });
        onCancel();
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
          venueIds: data.venueIds || [],
        };

        response = await createOrganizationOwner(createData);
        const { title, message } = handleBackendSuccess(response, "Proprietário adicionado com sucesso!");
        showSuccessToast({
          title,
          description: message
        });
        onCancel();
      }
    } catch (error: unknown) {
      const { title, message } = handleBackendError(error, "Erro ao salvar proprietário. Tente novamente mais tarde.");
      toast({
        title,
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!owner) return;
    setIsDeleting(true);
    try {
      const response = await deleteOwner(owner.id);
      const { title, message } = handleBackendSuccess(response, "Proprietário excluído com sucesso!");
      showSuccessToast({
        title,
        description: message
      });
      onCancel();
    } catch (error: unknown) {
      const { title, message } = handleBackendError(error, "Erro ao excluir proprietário. Tente novamente mais tarde.");
      toast({
        title,
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <FormLayout
      form={form}
      title={isEditing ? 'Editar Proprietário' : 'Novo Proprietário'}
      onSubmit={onSubmit}
      onCancel={onCancel}
      isSubmitting={isSubmitting}
      isEditing={isEditing}
      onDelete={handleDelete}
      entityName={owner?.completeName}
      entityType="proprietário"
      isDeleting={isDeleting}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="completeName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome Completo</FormLabel>
              <FormControl>
                <Input placeholder="Digite o nome completo" {...field} />
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
                <InputMask
                  mask="999.999.999-99"
                  placeholder="Digite o CPF"
                  value={field.value}
                  onChange={field.onChange}
                >
                  {(inputProps) => <Input {...inputProps} />}
                </InputMask>
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
                <InputMask
                  mask="99.999.999-9"
                  placeholder="Digite o RG"
                  value={field.value}
                  onChange={field.onChange}
                >
                  {(inputProps) => <Input {...inputProps} />}
                </InputMask>
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
                <Input placeholder="Digite a chave PIX" {...field} />
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
                <Input placeholder="Digite a rua" {...field} />
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
                <Input placeholder="Digite o número" {...field} />
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
                <Input placeholder="Digite o complemento" {...field} />
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
                <Input placeholder="Digite o bairro" {...field} />
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
                <Input placeholder="Digite a cidade" {...field} />
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
                <InputMask
                  mask="aa"
                  placeholder="Digite o estado"
                  value={field.value}
                  onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                >
                  {(inputProps) => <Input {...inputProps} />}
                </InputMask>
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
                <InputMask
                  mask="99999-999"
                  placeholder="Digite o CEP"
                  value={field.value}
                  onChange={field.onChange}
                >
                  {(inputProps) => <Input {...inputProps} />}
                </InputMask>
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
                <Input placeholder="Digite o nome do banco" {...field} />
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
                <Input placeholder="Digite a agência" {...field} />
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
                <Input placeholder="Digite o número da conta" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </FormLayout>
  );
} 