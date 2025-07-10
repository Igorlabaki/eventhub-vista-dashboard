import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
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
import { useOwnerStore } from "@/store/ownerStore";
import { FormLayout } from "@/components/ui/form-layout";
import { handleBackendError, handleBackendSuccess } from "@/lib/error-handler";
import { showSuccessToast } from "@/components/ui/success-toast";
import { useState, useEffect } from "react";
import InputMask from "react-input-mask";
import { NumericFormat } from "react-number-format";
import { useUserStore } from "@/store/userStore";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";

// Função para gerar opções de horário em intervalos de 30 minutos
const generateTimeOptions = () => {
  const options = [];
  for (let hour = 0; hour < 24; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const timeString = `${hour.toString().padStart(2, "0")}:${minute
        .toString()
        .padStart(2, "0")}`;
      options.push({ value: timeString, label: timeString });
    }
  }
  return options;
};

const timeOptions = generateTimeOptions();

const pricingModels = [
  { value: "PER_PERSON", label: "Por pessoa" },
  { value: "PER_DAY", label: "Por dia" },
  { value: "PER_PERSON_DAY", label: "Por pessoa/dia" },
  { value: "PER_PERSON_HOUR", label: "Por pessoa/hora" },
] as const;

const createVenueSchema = z.object({
  userId: z.string(),
  organizationId: z.string(),
  data: z
    .object({
      cep: z.string().min(1, "CEP é obrigatório"),
      email: z.string().email("Email inválido"),
      name: z.string().min(1, "Nome é obrigatório"),
      openingHour: z.string().optional(),
      closingHour: z.string().optional(),
      city: z.string().min(1, "Cidade é obrigatória"),
      state: z.string().min(1, "Estado é obrigatório"),
      street: z.string().min(1, "Rua é obrigatória"),
      checkIn: z.string().optional(),
      maxGuest: z.string().min(1, "Capacidade máxima é obrigatória"),
      checkOut: z.string().optional(),
      description: z.string().optional(),
      streetNumber: z.string().min(1, "Número é obrigatório"),
      neighborhood: z.string().min(1, "Bairro é obrigatório"),
      owners: z
        .array(z.string())
        .min(1, "Pelo menos um proprietário deve ser selecionado"),
      hasOvernightStay: z.boolean().default(false),
      complement: z.string().optional(),
      pricePerDay: z.string().optional(),
      pricePerPerson: z.string().optional(),
      pricePerPersonDay: z.string().optional(),
      pricePerPersonHour: z.string().optional(),
      pricingModel: z.enum([
        "PER_PERSON",
        "PER_DAY",
        "PER_PERSON_DAY",
        "PER_PERSON_HOUR",
      ]),
      url: z.string().url("URL inválida").optional().or(z.literal("")),
      whatsappNumber: z.string().optional(),
      minimumPrice: z.string().optional(),
      minimumNights: z.string().optional(),
      standardEventDuration: z.string().optional(),
      tiktokUrl: z
        .string()
        .url("URL do TikTok inválida")
        .optional()
        .or(z.literal("")),
      instagramUrl: z
        .string()
        .url("URL do Instagram inválida")
        .optional()
        .or(z.literal("")),
      facebookUrl: z
        .string()
        .url("URL do Facebook inválida")
        .optional()
        .or(z.literal("")),
      logoFile: z.instanceof(File).optional(),
    })
    .refine(
      (data) => {
        if (data.hasOvernightStay) {
          return data.checkIn?.trim() && data.checkOut?.trim();
        }
        return true;
      },
      {
        message:
          "Se o espaço aceitar pernoite, os campos check-in e check-out são obrigatórios.",
        path: ["checkIn"],
      }
    )
    .refine(
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
        message:
          "O preço é obrigatório para o modelo de precificação selecionado.",
        path: ["pricingModel"],
      }
    ),
});

type CreateVenueFormValues = z.infer<typeof createVenueSchema>;

interface CreateVenueFormProps {
  organizationId: string;
  userId?: string;
  onSuccess?: () => void;
  venueId?: string;
  isEditing?: boolean;
}

export function CreateVenueForm({
  organizationId,
  userId,
  onSuccess,
  venueId,
  isEditing,
}: CreateVenueFormProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const { createVenue, deleteVenue } = useVenueStore();
  const { owners, fetchOrganizationOwners } = useOwnerStore();
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
        description: "",
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
        url: "",
        whatsappNumber: "",
        minimumPrice: "",
        minimumNights: "",
        standardEventDuration: "",
        tiktokUrl: "",
        instagramUrl: "",
        facebookUrl: "",
        logoFile: undefined,
      },
    },
  });

  const pricingModel = form.watch("data.pricingModel");
  const hasOvernightStay = form.watch("data.hasOvernightStay");

  const handleLogoChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    onChange: (value: File | null) => void
  ) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      const url = URL.createObjectURL(file);
      setLogoPreview(url);
      onChange(file);
    } else {
      setLogoPreview(null);
      onChange(null);
    }
  };

  const onSubmit = async (data: CreateVenueFormValues) => {
    try {
      const venueData: CreateVenueDTO = {
        userId: user?.id || "",
        organizationId: data.organizationId,
        cep: data.data.cep.replace(/\D/g, ""),
        email: data.data.email,
        name: data.data.name,
        city: data.data.city,
        state: data.data.state,
        street: data.data.street,
        checkIn: data.data.checkIn || undefined,
        maxGuest: data.data.maxGuest,
        checkOut: data.data.checkOut || undefined,
        description: data.data.description || undefined,
        openingHour: data.data.openingHour || undefined,
        closingHour: data.data.closingHour || undefined,
        streetNumber: data.data.streetNumber.replace(/\D/g, ""),
        neighborhood: data.data.neighborhood,
        owners: data.data.owners,
        hasOvernightStay: data.data.hasOvernightStay,
        complement: data.data.complement || undefined,
        pricePerDay: data.data.pricePerDay?.replace(/\D/g, "") || undefined,
        pricePerPerson:
          data.data.pricePerPerson?.replace(/\D/g, "") || undefined,
        pricePerPersonDay:
          data.data.pricePerPersonDay?.replace(/\D/g, "") || undefined,
        pricePerPersonHour:
          data.data.pricePerPersonHour?.replace(/\D/g, "") || undefined,
        pricingModel: data.data.pricingModel,
        url: data.data.url || undefined,
        whatsappNumber: data.data.whatsappNumber || undefined,
        minimumPrice: data.data.minimumPrice?.replace(/\D/g, "") || undefined,
        minimumNights: data.data.minimumNights || undefined,
        standardEventDuration: data.data.standardEventDuration || undefined,
        tiktokUrl: data.data.tiktokUrl || undefined,
        instagramUrl: data.data.instagramUrl || undefined,
        facebookUrl: data.data.facebookUrl || undefined,
        logoFile: data.data.logoFile,
      };

      const response = await createVenue(venueData);
      const { title, message } = handleBackendSuccess(
        response,
        "Espaço criado com sucesso!"
      );
      showSuccessToast({
        title,
        description: message,
      });
      onSuccess?.();
    } catch (error: unknown) {
      const { title, message } = handleBackendError(
        error,
        "Erro ao criar espaço. Tente novamente mais tarde."
      );
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
      const { title, message } = handleBackendSuccess(
        response,
        "Espaço excluído com sucesso!"
      );
      showSuccessToast({
        title,
        description: message,
      });
      onSuccess?.();
    } catch (error: unknown) {
      const { title, message } = handleBackendError(
        error,
        "Erro ao excluir espaço. Tente novamente mais tarde."
      );
      toast({
        title,
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  useEffect(() => {
    if (organizationId) {
      fetchOrganizationOwners(organizationId);
    }
  }, [organizationId, fetchOrganizationOwners]);

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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  <Input
                    type="email"
                    placeholder="email@espaco.com"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="w-full">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="data.whatsappNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Número do WhatsApp</FormLabel>
                  <FormControl>
                    <PhoneInput
                      country={"br"}
                      value={field.value}
                      onChange={field.onChange}
                      inputClass="w-full"
                      placeholder="Digite o número"
                      enableSearch={true}
                      containerClass="w-full"
                      inputStyle={{ width: "100%" }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="data.maxGuest"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Capacidade máxima (pessoas)*</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="Ex: 200" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
        {/* Descrição */}
        <FormField
          control={form.control}
          name="data.description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descrição</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Descreva o espaço, suas características e diferenciais..."
                  className="min-h-[100px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Endereço */}
        <div className="space-y-4">
          <h3 className="font-semibold text-md">Endereço</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                      onChange={(e) =>
                        field.onChange(e.target.value.toUpperCase())
                      }
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
        <div className="w-full">
          <FormField
            control={form.control}
            name="data.hasOvernightStay"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Permite pernoite</FormLabel>
                <Select
                  value={field.value ? "true" : "false"}
                  onValueChange={(value) => field.onChange(value === "true")}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma opção" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="true">Sim</SelectItem>
                    <SelectItem value="false">Não</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          {/* Horários */}
          <div className="space-y-4 mt-4">
            {hasOvernightStay ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="data.checkIn"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Check-in</FormLabel>
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione o horário" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {timeOptions.map((option) => (
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

                  <FormField
                    control={form.control}
                    name="data.checkOut"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Check-out</FormLabel>
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione o horário" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {timeOptions.map((option) => (
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
                  <FormField
                    control={form.control}
                    name="data.minimumNights"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Noites mínimas</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min={1}
                            placeholder="1"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </>
            ) : (
              <>
                <FormField
                  control={form.control}
                  name="data.openingHour"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Horário de abertura</FormLabel>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o horário" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {timeOptions.map((option) => (
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

                <FormField
                  control={form.control}
                  name="data.closingHour"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Horário de fechamento</FormLabel>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o horário" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {timeOptions.map((option) => (
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

                <FormField
                  control={form.control}
                  name="data.standardEventDuration"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Duração padrão do evento (horas)
                        <span className="block text-xs text-muted-foreground">
                          {" "}
                          Selecione a quantidade de horas inclusas no valor do
                          aluguel. O que exceder será considerado para o cálculo
                          de horas extras.
                        </span>
                      </FormLabel>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione a duração" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {[...Array(12)].map((_, i) => (
                            <SelectItem key={i + 1} value={(i + 1).toString()}>
                              {i + 1} hora{i > 0 ? "s" : ""}
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
          </div>
        </div>

        {/* Preços */}
        <div className="space-y-4">
          <h3 className="font-semibold text-md">Preços</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="data.pricingModel"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Modelo de precificação*</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um modelo" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {pricingModels.map((model) => (
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

            {pricingModel === "PER_PERSON" && (
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

            {pricingModel === "PER_DAY" && (
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

            {pricingModel === "PER_PERSON_DAY" && (
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

            {pricingModel === "PER_PERSON_HOUR" && (
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
     
          <div className="w-full">
            <FormField
              control={form.control}
              name="data.minimumPrice"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Preço mínimo de orçamento (R$)</FormLabel>
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
          
          </div>
      
        {/* Capacidade */}
       

        {/* Redes Sociais */}
        <div className="space-y-4">
          <h3 className="font-semibold text-md">Redes Sociais</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="data.instagramUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>URL do Instagram</FormLabel>
                  <FormControl>
                    <Input
                      type="url"
                      placeholder="https://instagram.com/seu-perfil"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="data.facebookUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>URL do Facebook</FormLabel>
                  <FormControl>
                    <Input
                      type="url"
                      placeholder="https://facebook.com/seu-perfil"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="data.tiktokUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>URL do TikTok</FormLabel>
                  <FormControl>
                    <Input
                      type="url"
                      placeholder="https://tiktok.com/@seu-perfil"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="data.url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>URL do Espaço</FormLabel>
                  <FormControl>
                    <Input
                      type="url"
                      placeholder="https://exemplo.com"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
        <div className="w-full">
          <FormField
            control={form.control}
            name="data.logoFile"
            render={({ field: { value, onChange, ...field } }) => (
              <FormItem>
                <FormLabel>Logo do Espaço</FormLabel>
                <FormControl>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleLogoChange(e, onChange)}
                    {...field}
                  />
                </FormControl>
                {logoPreview && (
                  <div className="mt-2">
                    <img
                      src={logoPreview}
                      alt="Logo do espaço"
                      className="max-h-40 rounded border shadow"
                      style={{ cursor: "pointer" }}
                      onClick={() => window.open(logoPreview, "_blank")}
                    />
                  </div>
                )}
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        {/* Proprietários */}
        <div className="space-y-4">
          <h3 className="font-semibold text-md">Proprietários</h3>

          <FormField
            control={form.control}
            name="data.owners"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Selecione os proprietários do espaço</FormLabel>
                <div className="space-y-3 mt-2">
                  {owners.map((owner) => (
                    <div key={owner.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`owner-${owner.id}`}
                        checked={field.value.includes(owner.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            field.onChange([...field.value, owner.id]);
                          } else {
                            field.onChange(
                              field.value.filter((id) => id !== owner.id)
                            );
                          }
                        }}
                      />
                      <label
                        htmlFor={`owner-${owner.id}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                      >
                        {owner.completeName}
                      </label>
                    </div>
                  ))}
                  {owners.length === 0 && (
                    <p className="text-sm text-gray-500">
                      Nenhum proprietário cadastrado na organização.
                    </p>
                  )}
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>
    </FormLayout>
  );
}
