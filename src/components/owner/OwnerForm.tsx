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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { showSuccessToast } from "@/components/ui/success-toast";
import { handleBackendSuccess, handleBackendError } from "@/lib/error-handler";
import {
  COMPANY_SIZE_OPTIONS,
  formatCnpj,
  isCnpjFormat,
  normalizeCnpj,
  OWNER_CNPJ_FORMAT,
  ownerDisplayName,
  personTypeOf,
  representativeLabels,
} from "@/lib/owner-document";
import { CompanySize, Owner, OwnerDocumentFields, UpdateOwnerDTO } from "@/types/owner";
import { CreateOwnerDTO } from "@/types/owner";
import { useOwnerStore } from "@/store/ownerStore";
import InputMask from 'react-input-mask';
import { AsyncActionButton } from "@/components/AsyncActionButton";
import { FormLayout } from "@/components/ui/form-layout";

const NO_COMPANY_SIZE = "NONE";

const CNPJ_FORMAT_CHARS = { "*": "[A-Za-z0-9]", "9": "[0-9]" };

const formSchema = z.object({
  personType: z.enum(["PF", "PJ"]),
  companyName: z.string().optional(),
  cnpj: z.string().optional(),
  companySize: z.enum(["MEI", "ME", "EPP", "DEMAIS", NO_COMPANY_SIZE]),
  completeName: z.string().min(1, "Nome é obrigatório"),
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
}).superRefine((data, ctx) => {
  if (data.personType !== "PJ") return;
  if (!data.companyName?.trim()) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["companyName"], message: "Razão social é obrigatória" });
  }
  const cnpj = normalizeCnpj(data.cnpj ?? "").replace(/_/g, "");
  if (!cnpj) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["cnpj"], message: "CNPJ é obrigatório" });
  } else if (!isCnpjFormat(cnpj)) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["cnpj"], message: OWNER_CNPJ_FORMAT });
  }
});

type OwnerFormValues = z.infer<typeof formSchema>;

interface OwnerFormProps {
  owner?: Owner;
  organizationId: string;
  onCancel: () => void;
}

function documentFields(data: OwnerFormValues): OwnerDocumentFields {
  if (data.personType === "PF") return { personType: "PF" };
  return {
    personType: "PJ",
    companyName: data.companyName?.trim(),
    cnpj: normalizeCnpj(data.cnpj ?? ""),
    companySize: data.companySize === NO_COMPANY_SIZE ? null : (data.companySize as CompanySize),
  };
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
      personType: owner ? personTypeOf(owner) : "PF",
      companyName: owner?.companyName || "",
      cnpj: formatCnpj(owner?.cnpj),
      companySize: owner?.companySize || NO_COMPANY_SIZE,
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

  const personType = form.watch("personType");
  const companySize = form.watch("companySize");
  const labels = representativeLabels(personType, companySize === NO_COMPANY_SIZE ? null : companySize);

  const onSubmit = async () => {
    const isValid = await form.trigger();
    if (!isValid) return;

    setIsSubmitting(true);
    try {
      const data = form.getValues();
      let response;
      if (isEditing && owner) {
        // Sem `venueIds`: os vinculos sao editados no VenueSelectionDialog e a API preserva os atuais.
        const updateData: UpdateOwnerDTO = {
          ...documentFields(data),
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
          ...documentFields(data),
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
      entityName={owner ? ownerDisplayName(owner) : undefined}
      entityType="proprietário"
      isDeleting={isDeleting}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="personType"
          render={({ field }) => (
            <FormItem className="md:col-span-2">
              <FormLabel>Tipo de pessoa</FormLabel>
              <FormControl>
                <RadioGroup
                  value={field.value}
                  onValueChange={field.onChange}
                  className="flex gap-6"
                >
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="PF" id="owner-person-type-pf" />
                    <Label htmlFor="owner-person-type-pf">Pessoa física</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="PJ" id="owner-person-type-pj" />
                    <Label htmlFor="owner-person-type-pj">Pessoa jurídica</Label>
                  </div>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {personType === "PJ" && (
          <>
            <FormField
              control={form.control}
              name="companyName"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>Razão Social</FormLabel>
                  <FormControl>
                    <Input placeholder="Digite a razão social" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="cnpj"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>CNPJ</FormLabel>
                  <FormControl>
                    <InputMask
                      mask="**.***.***/****-99"
                      formatChars={CNPJ_FORMAT_CHARS}
                      placeholder="Digite o CNPJ"
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
              name="companySize"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Porte</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Não informar" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value={NO_COMPANY_SIZE}>Não informar</SelectItem>
                      {COMPANY_SIZE_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        )}

        <FormField
          control={form.control}
          name="completeName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{labels.name}</FormLabel>
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
              <FormLabel>{labels.cpf}</FormLabel>
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
              <FormLabel>{labels.rg}</FormLabel>
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
