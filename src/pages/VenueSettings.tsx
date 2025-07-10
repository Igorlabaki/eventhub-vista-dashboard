import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useVenueStore } from "@/store/venueStore";
import { useParams, useNavigate } from "react-router-dom";
import { useUserStore } from "@/store/userStore";
import { useOwnerStore } from "@/store/ownerStore";
import { Venue } from "@/types/venue";
import { Skeleton } from "@/components/ui/skeleton";
import { handleBackendError, handleBackendSuccess } from "@/lib/error-handler";
import { showSuccessToast } from "@/components/ui/success-toast";
import { FormLayout } from "@/components/ui/form-layout";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { Textarea } from "@/components/ui/textarea";

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

type PricingModel =
  | "PER_PERSON"
  | "PER_DAY"
  | "PER_PERSON_DAY"
  | "PER_PERSON_HOUR";

const venueSettingsSchema = z.object({
  name: z.string().min(1, "Nome do espaço é obrigatório"),
  email: z.string().email("Email inválido"),
  description: z.string().optional(),
  url: z.string().url("URL inválida").optional().or(z.literal("")),
  street: z.string().min(1, "Rua é obrigatória"),
  streetNumber: z.string().min(1, "Número é obrigatório"),
  complement: z.string().optional(),
  neighborhood: z.string().min(1, "Bairro é obrigatório"),
  whatsappNumber: z.string().optional(),
  minimumPrice: z.string().optional(),
  city: z.string().min(1, "Cidade é obrigatória"),
  state: z.string().min(1, "Estado é obrigatório"),
  cep: z.string().min(1, "CEP é obrigatório"),
  checkIn: z.string().optional(),
  checkOut: z.string().optional(),
  standardEventDuration: z.string().optional(),
  openingHour: z.string().optional(),
  closingHour: z.string().optional(),
  hasOvernightStay: z.boolean(),
  pricingModel: z.enum([
    "PER_PERSON",
    "PER_DAY",
    "PER_PERSON_DAY",
    "PER_PERSON_HOUR",
  ]),
  minimumNights: z.string().optional(),
  pricePerPerson: z.string().optional(),
  pricePerDay: z.string().optional(),
  pricePerPersonDay: z.string().optional(),
  pricePerPersonHour: z.string().optional(),
  maxGuest: z.string().min(1, "Capacidade máxima é obrigatória"),
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
  logoUrl: z.string().url("URL do logo inválida").optional().or(z.literal("")),
  logoFile: z.instanceof(File).optional(),
  owners: z
    .array(z.string())
    .min(1, "Pelo menos um proprietário deve ser selecionado"),
});

type VenueSettingsFormValues = z.infer<typeof venueSettingsSchema>;

export default function VenueSettings() {
  const { toast } = useToast();
  const { venueId } = useParams();
  const navigate = useNavigate();
  const { user } = useUserStore();
  const { selectedVenue, updateVenue, deleteVenue } = useVenueStore();
  const { owners, fetchOrganizationOwners } = useOwnerStore();
  const [logoPreview, setLogoPreview] = useState<string | null>(
    selectedVenue?.logoUrl || null
  );

  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<VenueSettingsFormValues>({
    resolver: zodResolver(venueSettingsSchema),
    defaultValues: {
      name: "",
      email: "",
      description: "",
      url: "",
      street: "",
      streetNumber: "",
      minimumNights: "",
      complement: "",
      neighborhood: "",
      city: "",
      whatsappNumber: "",
      minimumPrice: "",
      state: "",
      cep: "",
      checkIn: "",
      checkOut: "",
      openingHour: "",
      closingHour: "",
      standardEventDuration: "",
      hasOvernightStay: false,
      pricingModel: "PER_PERSON",
      pricePerPerson: "",
      pricePerDay: "",
      pricePerPersonDay: "",
      pricePerPersonHour: "",
      maxGuest: "",
      tiktokUrl: "",
      instagramUrl: "",
      facebookUrl: "",
      logoUrl: "",
      logoFile: undefined,
      owners: [],
    },
  });

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
      setLogoPreview(selectedVenue?.logoUrl || null);
      onChange(null);
    }
  };

  useEffect(() => {
    if (selectedVenue) {
      form.reset({
        name: selectedVenue.name || "",
        email: selectedVenue.email || "",
        description: selectedVenue.description || "",
        url: selectedVenue.url || "",
        street: selectedVenue.street || "",
        streetNumber: selectedVenue.streetNumber || "",
        complement: selectedVenue.complement || "",
        neighborhood: selectedVenue.neighborhood || "",
        city: selectedVenue.city || "",
        minimumNights: selectedVenue.minimumNights?.toString() || "1",
        state: selectedVenue.state || "",
        cep: selectedVenue.cep || "",
        checkIn: selectedVenue.checkIn || "",
        checkOut: selectedVenue.checkOut || "",
        openingHour: selectedVenue.openingHour || "",
        closingHour: selectedVenue.closingHour || "",
        standardEventDuration: selectedVenue.standardEventDuration
          ? selectedVenue.standardEventDuration.toString()
          : "",
        whatsappNumber: selectedVenue.whatsappNumber || "",
        minimumPrice: selectedVenue.minimumPrice
          ? formatCurrency((selectedVenue.minimumPrice * 100).toString())
          : "",
        hasOvernightStay: selectedVenue.hasOvernightStay || false,
        pricingModel:
          (selectedVenue.pricingModel as PricingModel) || "PER_PERSON",
        pricePerPerson: selectedVenue.pricePerPerson
          ? formatCurrency((selectedVenue.pricePerPerson * 100).toString())
          : "",
        pricePerDay: selectedVenue.pricePerDay
          ? formatCurrency((selectedVenue.pricePerDay * 100).toString())
          : "",
        pricePerPersonDay: selectedVenue.pricePerPersonDay
          ? formatCurrency((selectedVenue.pricePerPersonDay * 100).toString())
          : "",
        pricePerPersonHour: selectedVenue.pricePerPersonHour
          ? formatCurrency((selectedVenue.pricePerPersonHour * 100).toString())
          : "",
        maxGuest: selectedVenue.maxGuest?.toString() || "",
        tiktokUrl: selectedVenue.tiktokUrl || "",
        instagramUrl: selectedVenue.instagramUrl || "",
        facebookUrl: selectedVenue.facebookUrl || "",
        logoUrl: selectedVenue.logoUrl || "",
        owners: selectedVenue.ownerVenue.map((owner) => owner.ownerId) || [],
      });
      setLogoPreview(selectedVenue.logoUrl || null);
    }
  }, [selectedVenue, form]);

  function formatCurrency(value: string | number) {
    const number =
      typeof value === "number"
        ? value
        : Number(value.replace(/\D/g, "")) / 100;
    return number
      ? `R$ ${number.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`
      : "";
  }

  function parseCurrencyStringToNumberString(value: string): string {
    let sanitized = value.replace(/R\$|\s|\./g, "");
    sanitized = sanitized.replace(",", ".");
    sanitized = sanitized.replace(/[^0-9.]/g, "");
    return sanitized;
  }

  function maskPhone(value: string) {
    let v = value.replace(/\D/g, "");
    if (v.length > 13) v = v.slice(0, 13); // Limita ao máximo
    if (v.length <= 2) return `+${v}`;
    if (v.length <= 4) return `+${v.slice(0, 2)} (${v.slice(2)}`;
    if (v.length <= 6)
      return `+${v.slice(0, 2)} (${v.slice(2, 4)}) ${v.slice(4)}`;
    if (v.length <= 11)
      return `+${v.slice(0, 2)} (${v.slice(2, 4)}) ${v.slice(4, 9)}-${v.slice(
        9
      )}`;
    return `+${v.slice(0, 2)} (${v.slice(2, 4)}) ${v.slice(4, 9)}-${v.slice(
      9,
      13
    )}`;
  }

  function handleCurrencyChange(
    e: React.ChangeEvent<HTMLInputElement>,
    onChange: (value: string) => void
  ) {
    const value = e.target.value.replace(/\D/g, "");
    const number = Number(value) / 100;
    const formatted = number
      ? `R$ ${number.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`
      : "";
    onChange(formatted);
  }

  const onSubmit = async (data: VenueSettingsFormValues) => {
    setIsLoading(true);
    if (!selectedVenue.id || !user?.id) {
      return;
    }

    const pricePerPerson = data.pricePerPerson
      ? parseCurrencyStringToNumberString(data.pricePerPerson)
      : undefined;
    const pricePerDay = data.pricePerDay
      ? parseCurrencyStringToNumberString(data.pricePerDay)
      : undefined;
    const pricePerPersonDay = data.pricePerPersonDay
      ? parseCurrencyStringToNumberString(data.pricePerPersonDay)
      : undefined;
    const pricePerPersonHour = data.pricePerPersonHour
      ? parseCurrencyStringToNumberString(data.pricePerPersonHour)
      : undefined;
    const minimumPrice = data.minimumPrice
      ? parseCurrencyStringToNumberString(data.minimumPrice)
      : undefined;

    try {
      const response = await updateVenue({
        url: data.url,
        cep: data.cep,
        city: data.city,
        userId: user.id,
        name: data.name,
        state: data.state,
        email: data.email,
        street: data.street,
        owners: data.owners,
        logoUrl: data.logoUrl,
        checkIn: data.checkIn,
        checkOut: data.checkOut,
        logoFile: data.logoFile,
        maxGuest: data.maxGuest,
        tiktokUrl: data.tiktokUrl,
        venueId: selectedVenue.id,
        complement: data.complement,
        facebookUrl: data.facebookUrl,
        description: data.description,
        openingHour: data.openingHour,
        closingHour: data.closingHour,
        streetNumber: data.streetNumber,
        neighborhood: data.neighborhood,
        pricingModel: data.pricingModel,
        instagramUrl: data.instagramUrl,
        minimumNights: data.minimumNights,
        whatsappNumber: data.whatsappNumber,
        pricePerDay: pricePerDay || undefined,
        minimumPrice: minimumPrice || undefined,
        hasOvernightStay: data.hasOvernightStay,
        pricePerPerson: pricePerPerson || undefined,
        standardEventDuration: data.standardEventDuration,
        pricePerPersonDay: pricePerPersonDay || undefined,
        pricePerPersonHour: pricePerPersonHour || undefined,
      });

      const { title, message } = handleBackendSuccess(
        response,
        "Configurações atualizadas com sucesso!"
      );
      showSuccessToast({
        title,
        description: message,
      });
    } catch (error: unknown) {
      const { title, message } = handleBackendError(
        error,
        "Erro ao atualizar configurações. Tente novamente mais tarde."
      );
      toast({
        title,
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedVenue?.id || !selectedVenue?.organizationId) return;

    try {
      setIsLoading(true);
      await deleteVenue(selectedVenue.id);
      toast({
        title: "Sucesso",
        description: "Espaço excluído com sucesso",
      });
      navigate(`/organization/${selectedVenue.organizationId}/venues`);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível excluir o espaço",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout
        title="Configurações"
        subtitle="Gerencie as configurações do seu espaço"
      >
        <div className="space-y-6 mx-auto mt-8">
          <Card className="bg-white">
            <CardHeader>
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-96" />
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Informações Gerais */}
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-10 w-full" />
                </div>
                <div className="grid gap-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-10 w-full" />
                </div>
              </div>

              {/* Endereço */}
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-10 w-full" />
                </div>
                <div className="grid gap-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-10 w-full" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-10 w-full" />
                </div>
                <div className="grid gap-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-10 w-full" />
                </div>
              </div>

              <div className="grid grid-3 gap-4">
                <div className="grid gap-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-10 w-full" />
                </div>
                <div className="grid gap-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-10 w-full" />
                </div>
                <div className="grid gap-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-10 w-full" />
                </div>
              </div>

              {/* Preços e Capacidade */}
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-10 w-full" />
                </div>
                <div className="grid gap-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-10 w-full" />
                </div>
              </div>

              {/* Check-in/out */}
              <div className="grid grid-cols-3 gap-4">
                <div className="grid gap-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-10 w-full" />
                </div>
                <div className="grid gap-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-10 w-full" />
                </div>
                <div className="flex items-center space-x-2 mt-6">
                  <Skeleton className="h-4 w-4" />
                  <Skeleton className="h-4 w-32" />
                </div>
              </div>

              {/* Botão Salvar */}
              <div className="flex justify-end">
                <Skeleton className="h-10 w-40" />
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title="Configurações"
      subtitle="Gerencie as configurações do seu espaço"
    >
      <FormLayout
        form={form}
        title="Informações Gerais"
        onSubmit={onSubmit}
        onCancel={() => navigate(-1)}
        submitLabel="Salvar Alterações"
        isSubmitting={isLoading}
        isEditing={true}
        onDelete={handleDelete}
        entityName={selectedVenue?.name || ""}
        entityType="Espaços"
      >
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome do Espaço</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <FormField
              control={form.control}
              name="whatsappNumber"
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
              name="maxGuest"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Capacidade máxima (pessoas)*</FormLabel>
                  <FormControl>
                    <Input type="number" className="w-full" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <FormField
            control={form.control}
            name="description"
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

          <div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="street"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Rua/Avenida</FormLabel>
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
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
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
            </div>

            <div className="grid grid-1 md:grid-3 gap-4 mt-4">
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
            </div>
          </div>

          <div>
            <div className="space-y-6">
              {/* Grid de 2 colunas: Modelo de precificação e Preço */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="pricingModel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Modelo de precificação</FormLabel>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um modelo" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="PER_PERSON">Por pessoa</SelectItem>
                          <SelectItem value="PER_DAY">Por dia</SelectItem>
                          <SelectItem value="PER_PERSON_DAY">
                            Por pessoa/dia
                          </SelectItem>
                          <SelectItem value="PER_PERSON_HOUR">
                            Por pessoa/hora
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {/* Preço dinâmico conforme modelo */}
                {form.watch("pricingModel") === "PER_PERSON" && (
                  <FormField
                    control={form.control}
                    name="pricePerPerson"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Preço por pessoa (R$)</FormLabel>
                        <FormControl>
                          <Input
                            value={field.value}
                            onChange={(e) =>
                              handleCurrencyChange(e, field.onChange)
                            }
                            placeholder="R$ 0,00"
                            className="w-full"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
                {form.watch("pricingModel") === "PER_DAY" && (
                  <FormField
                    control={form.control}
                    name="pricePerDay"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Preço por dia (R$)</FormLabel>
                        <FormControl>
                          <Input
                            value={field.value}
                            onChange={(e) =>
                              handleCurrencyChange(e, field.onChange)
                            }
                            placeholder="R$ 0,00"
                            className="w-full"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
                {form.watch("pricingModel") === "PER_PERSON_DAY" && (
                  <FormField
                    control={form.control}
                    name="pricePerPersonDay"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Preço por pessoa/dia (R$)</FormLabel>
                        <FormControl>
                          <Input
                            value={field.value}
                            onChange={(e) =>
                              handleCurrencyChange(e, field.onChange)
                            }
                            placeholder="R$ 0,00"
                            className="w-full"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
                {form.watch("pricingModel") === "PER_PERSON_HOUR" && (
                  <FormField
                    control={form.control}
                    name="pricePerPersonHour"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Preço por pessoa/hora (R$)</FormLabel>
                        <FormControl>
                          <Input
                            value={field.value}
                            onChange={(e) =>
                              handleCurrencyChange(e, field.onChange)
                            }
                            placeholder="R$ 0,00"
                            className="w-full"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </div>
              <div className="w-full">
                <FormField
                  control={form.control}
                  name="minimumPrice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Preço mínimo de orçamento (R$)</FormLabel>
                      <FormControl>
                        <Input
                          value={field.value}
                          onChange={(e) =>
                            handleCurrencyChange(e, field.onChange)
                          }
                          placeholder="R$ 0,00"
                          className="w-full"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Capacidade sozinha */}

              <div>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center justify-center">
                  <FormField
                    control={form.control}
                    name="hasOvernightStay"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Permite pernoite</FormLabel>
                        <Select
                          value={field.value ? "true" : "false"}
                          onValueChange={(value) => {
                            field.onChange(value === "true");
                            if (value === "false") {
                              form.setValue("checkIn", "");
                              form.setValue("checkOut", "");
                              form.setValue("minimumNights", "1");
                            }
                          }}
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
                  {form.watch("hasOvernightStay") ? (
                    <>
                      <FormField
                        control={form.control}
                        name="checkIn"
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
                                  <SelectItem
                                    key={option.value}
                                    value={option.value}
                                  >
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
                        name="checkOut"
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
                                  <SelectItem
                                    key={option.value}
                                    value={option.value}
                                  >
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
                        name="minimumNights"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Noites mínimas</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min={1}
                                placeholder="1"
                                className="w-full"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </>
                  ) : (
                    <>
                      <FormField
                        control={form.control}
                        name="openingHour"
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
                                  <SelectItem
                                    key={option.value}
                                    value={option.value}
                                  >
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
                        name="closingHour"
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
                                  <SelectItem
                                    key={option.value}
                                    value={option.value}
                                  >
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
                </div>
              </div>
              <div className="w-full">
                <FormField
                  control={form.control}
                  name="standardEventDuration"
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
              </div>

              {/* Grid de 2 colunas: URLs (2 por linha no desktop) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>URL do Espaço</FormLabel>
                      <FormControl>
                        <Input
                          type="url"
                          placeholder="https://exemplo.com"
                          className="w-full"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="instagramUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>URL do Instagram</FormLabel>
                      <FormControl>
                        <Input
                          type="url"
                          placeholder="https://instagram.com/seu-perfil"
                          className="w-full"
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
                  name="facebookUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>URL do Facebook</FormLabel>
                      <FormControl>
                        <Input
                          type="url"
                          placeholder="https://facebook.com/seu-perfil"
                          className="w-full"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="tiktokUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>URL do TikTok</FormLabel>
                      <FormControl>
                        <Input
                          type="url"
                          placeholder="https://tiktok.com/@seu-perfil"
                          className="w-full"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </div>

          <div>
            <div className="w-full">
              <FormField
                control={form.control}
                name="logoFile"
                render={({ field: { value, onChange, ...field } }) => (
                  <FormItem>
                    <FormLabel>Logo do Espaço</FormLabel>
                    <FormControl>
                      <Input
                        type="file"
                        accept="image/*"
                        className="w-full"
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
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-md">Proprietários</h3>
            <FormField
              control={form.control}
              name="owners"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Selecione os proprietários do espaço</FormLabel>
                  <div className="space-y-3 mt-2">
                    {owners.map((owner) => (
                      <div
                        key={owner.id}
                        className="flex items-center space-x-2"
                      >
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
    </DashboardLayout>
  );
}
