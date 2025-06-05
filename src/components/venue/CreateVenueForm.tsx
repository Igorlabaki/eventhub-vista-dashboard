import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import type { CreateVenueDTO } from "@/types/venue";
import { useVenueStore } from "@/store/venueStore";
import { FormLayout } from "@/components/ui/form-layout";
import { handleBackendError, handleBackendSuccess } from "@/lib/error-handler";
import { showSuccessToast } from "@/components/ui/success-toast";
import { useState } from "react";
import InputMask from 'react-input-mask';
import { NumericFormat } from 'react-number-format';
import { useUserStore } from "@/store/userStore";

const pricingModels = [
  { value: "PER_PERSON", label: "Por pessoa" },
  { value: "PER_DAY", label: "Por dia" },
  { value: "PER_PERSON_DAY", label: "Por pessoa/dia" },
  { value: "PER_PERSON_HOUR", label: "Por pessoa/hora" },
] as const;

const createVenueSchema = z.object({
  userId: z.string(),
  organizationId: z.string(),
  data: z.object({
    cep: z.string().min(1, "CEP é obrigatório"),
    email: z.string().email("Email inválido"),
    name: z.string().min(1, "Nome é obrigatório"),
    city: z.string().min(1, "Cidade é obrigatória"),
    state: z.string().min(1, "Estado é obrigatório"),
    street: z.string().min(1, "Rua é obrigatória"),
    checkIn: z.string().optional(),
    maxGuest: z.string().min(1, "Capacidade máxima é obrigatória"),
    checkOut: z.string().optional(),
    streetNumber: z.string().min(1, "Número é obrigatório"),
    neighborhood: z.string().min(1, "Bairro é obrigatório"),
    owners: z.array(z.string()).default([]),
    hasOvernightStay: z.boolean().default(false),
    complement: z.string().optional(),
    pricePerDay: z.string().optional(),
    pricePerPerson: z.string().optional(),
    pricePerPersonDay: z.string().optional(),
    pricePerPersonHour: z.string().optional(),
    pricingModel: z.enum(["PER_PERSON", "PER_DAY", "PER_PERSON_DAY", "PER_PERSON_HOUR"]),
  }).refine(
    (data) => {
      if (data.hasOvernightStay) {
        return data.checkIn?.trim() && data.checkOut?.trim();
      }
      return true;
    },
    {
      message: "Se o espaço aceitar pernoite, os campos check-in e check-out são obrigatórios.",
      path: ["checkIn"],
    }
  ).refine(
    (data) => {
      switch (data.pricingModel) {
        case "PER_PERSON":
          return !!data.pricePerPerson;
        case "PER_DAY":
          return !!data.pricePerDay;
        case "PER_PERSON_DAY":
          return !!data.pricePerPersonDay;
        case "PER_PERSON_HOUR":
          return !!data.pricePerPersonHour;
        default:
          return false;
      }
    },
    {
      message: "O preço é obrigatório para o modelo de precificação selecionado.",
      path: ["pricingModel"],
    }
  ),
});

type CreateVenueFormValues = z.infer<typeof createVenueSchema>;

interface CreateVenueFormProps {
  organizationId: string;
  userId: string;
  onSuccess?: () => void;
  venueId?: string;
  isEditing?: boolean;
}

export function CreateVenueForm({ organizationId, userId, onSuccess, venueId, isEditing }: CreateVenueFormProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const { createVenue, deleteVenue } = useVenueStore();
  const { toast } = useToast();
  const { user } = useUserStore();
  const form = useForm<CreateVenueFormValues>({
    resolver: zodResolver(createVenueSchema),
    defaultValues: {
      userId,
      organizationId,
      data: {
        cep: "",
        email: "",
        name: "",
        city: "",
        state: "",
        street: "",
        checkIn: "",
        maxGuest: "",
        checkOut: "",
        streetNumber: "",
        neighborhood: "",
        owners: [],
        hasOvernightStay: false,
        complement: "",
        pricePerDay: "",
        pricePerPerson: "",
        pricePerPersonDay: "",
        pricePerPersonHour: "",
        pricingModel: "PER_PERSON",
      },
    },
  });

  const pricingModel = form.watch("data.pricingModel");
  const hasOvernightStay = form.watch("data.hasOvernightStay");

  const onSubmit = async (data: CreateVenueFormValues) => {
    try {
      const venueData: CreateVenueDTO = {
        userId: user?.id || "",
        organizationId: data.organizationId,
        data: {
          cep: data.data.cep.replace(/\D/g, ''),
          email: data.data.email,
          name: data.data.name,
          city: data.data.city,
          state: data.data.state,
          street: data.data.street,
          checkIn: data.data.checkIn,
          maxGuest: data.data.maxGuest,
          checkOut: data.data.checkOut,
          streetNumber: data.data.streetNumber.replace(/\D/g, ''),
          neighborhood: data.data.neighborhood,
          owners: data.data.owners,
          hasOvernightStay: data.data.hasOvernightStay,
          complement: data.data.complement,
          pricePerDay: data.data.pricePerDay?.replace(/\D/g, ''),
          pricePerPerson: data.data.pricePerPerson?.replace(/\D/g, ''),
          pricePerPersonDay: data.data.pricePerPersonDay?.replace(/\D/g, ''),
          pricePerPersonHour: data.data.pricePerPersonHour?.replace(/\D/g, ''),
          pricingModel: data.data.pricingModel,
        }
      };
      
      const response = await createVenue(venueData);
      const { title, message } = handleBackendSuccess(response, "Espaço criado com sucesso!");
      showSuccessToast({
        title,
        description: message
      });
      onSuccess?.();
    } catch (error: unknown) {
      const { title, message } = handleBackendError(error, "Erro ao criar espaço. Tente novamente mais tarde.");
      toast({
        title,
        description: message,
        variant: "destructive",
      });
    }
  };

  const handleDelete = async () => {
    if (!venueId) return;
    setIsDeleting(true);
    try {
      const response = await deleteVenue(venueId);
      const { title, message } = handleBackendSuccess(response, "Espaço excluído com sucesso!");
      showSuccessToast({
        title,
        description: message
      });
      onSuccess?.();
    } catch (error: unknown) {
      const { title, message } = handleBackendError(error, "Erro ao excluir espaço. Tente novamente mais tarde.");
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
      title={isEditing ? "Editar Espaço" : "Novo Espaço"}
      onSubmit={onSubmit}
      onCancel={onSuccess}
      submitLabel={isEditing ? "Salvar" : "Criar"}
      onDelete={isEditing ? handleDelete : undefined}
      isDeleting={isDeleting}
      entityName={form.watch("data.name")}
      entityType="espaço"
    >
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="data.name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome do Espaço*</FormLabel>
                <FormControl>
                  <Input placeholder="Digite o nome do espaço" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="data.email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="email@espaco.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Endereço */}
        <div className="space-y-4">
          <h3 className="font-semibold text-md">Endereço</h3>
          
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="data.street"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Rua/Avenida*</FormLabel>
                  <FormControl>
                    <Input placeholder="Nome da rua" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="data.streetNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Número*</FormLabel>
                  <FormControl>
                    <InputMask
                      mask="999999"
                      placeholder="123"
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
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="data.complement"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Complemento</FormLabel>
                  <FormControl>
                    <Input placeholder="Apto, sala, etc" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="data.neighborhood"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bairro*</FormLabel>
                  <FormControl>
                    <Input placeholder="Nome do bairro" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <FormField
              control={form.control}
              name="data.city"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cidade*</FormLabel>
                  <FormControl>
                    <Input placeholder="Nome da cidade" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="data.state"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Estado*</FormLabel>
                  <FormControl>
                    <InputMask
                      mask="aa"
                      placeholder="UF"
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
              name="data.cep"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>CEP*</FormLabel>
                  <FormControl>
                    <InputMask
                      mask="99999-999"
                      placeholder="00000-000"
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
          </div>
        </div>

        {/* Horários */}
        <div className="space-y-4">
          <h3 className="font-semibold text-md">Horários</h3>
          
          <div className="grid grid-cols-3 gap-4">
            <FormField
              control={form.control}
              name="data.hasOvernightStay"
              render={({ field }) => (
                <FormItem className="flex items-center space-x-2">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <FormLabel className="mt-0">Permite pernoite</FormLabel>
                  <FormMessage />
                </FormItem>
              )}
            />

            {hasOvernightStay && (
              <>
                <FormField
                  control={form.control}
                  name="data.checkIn"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Check-in</FormLabel>
                      <FormControl>
                        <Input type="time" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="data.checkOut"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Check-out</FormLabel>
                      <FormControl>
                        <Input type="time" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}
          </div>
        </div>

        {/* Preços */}
        <div className="space-y-4">
          <h3 className="font-semibold text-md">Preços</h3>
          
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="data.pricingModel"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Modelo de precificação*</FormLabel>
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um modelo" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {pricingModels.map(model => (
                        <SelectItem key={model.value} value={model.value}>
                          {model.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {pricingModel === 'PER_PERSON' && (
              <FormField
                control={form.control}
                name="data.pricePerPerson"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Preço por pessoa (R$)*</FormLabel>
                    <FormControl>
                      <NumericFormat
                        value={field.value}
                        onValueChange={(values) => {
                          field.onChange(values.value);
                        }}
                        thousandSeparator="."
                        decimalSeparator=","
                        prefix="R$ "
                        decimalScale={2}
                        fixedDecimalScale
                        placeholder="R$ 0,00"
                        customInput={Input}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {pricingModel === 'PER_DAY' && (
              <FormField
                control={form.control}
                name="data.pricePerDay"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Preço por dia (R$)*</FormLabel>
                    <FormControl>
                      <NumericFormat
                        value={field.value}
                        onValueChange={(values) => {
                          field.onChange(values.value);
                        }}
                        thousandSeparator="."
                        decimalSeparator=","
                        prefix="R$ "
                        decimalScale={2}
                        fixedDecimalScale
                        placeholder="R$ 0,00"
                        customInput={Input}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {pricingModel === 'PER_PERSON_DAY' && (
              <FormField
                control={form.control}
                name="data.pricePerPersonDay"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Preço por pessoa/dia (R$)*</FormLabel>
                    <FormControl>
                      <NumericFormat
                        value={field.value}
                        onValueChange={(values) => {
                          field.onChange(values.value);
                        }}
                        thousandSeparator="."
                        decimalSeparator=","
                        prefix="R$ "
                        decimalScale={2}
                        fixedDecimalScale
                        placeholder="R$ 0,00"
                        customInput={Input}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {pricingModel === 'PER_PERSON_HOUR' && (
              <FormField
                control={form.control}
                name="data.pricePerPersonHour"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Preço por pessoa/hora (R$)*</FormLabel>
                    <FormControl>
                      <NumericFormat
                        value={field.value}
                        onValueChange={(values) => {
                          field.onChange(values.value);
                        }}
                        thousandSeparator="."
                        decimalSeparator=","
                        prefix="R$ "
                        decimalScale={2}
                        fixedDecimalScale
                        placeholder="R$ 0,00"
                        customInput={Input}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
          </div>
        </div>

        {/* Capacidade */}
        <FormField
          control={form.control}
          name="data.maxGuest"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Capacidade máxima (pessoas)*</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="Ex: 200"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </FormLayout>
  );
} 