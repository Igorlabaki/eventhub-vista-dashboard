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

type PricingModel =
  | "PER_PERSON"
  | "PER_DAY"
  | "PER_PERSON_DAY"
  | "PER_PERSON_HOUR";

const venueSettingsSchema = z.object({
  name: z.string().min(1, "Nome do espaço é obrigatório"),
  email: z.string().email("Email inválido"),
  url: z.string().url("URL inválida").optional().or(z.literal("")),
  street: z.string().min(1, "Rua é obrigatória"),
  streetNumber: z.string().min(1, "Número é obrigatório"),
  complement: z.string().optional(),
  neighborhood: z.string().min(1, "Bairro é obrigatório"),
  city: z.string().min(1, "Cidade é obrigatória"),
  state: z.string().min(1, "Estado é obrigatório"),
  cep: z.string().min(1, "CEP é obrigatório"),
  checkIn: z.string().optional(),
  checkOut: z.string().optional(),
  hasOvernightStay: z.boolean(),
  pricingModel: z.enum([
    "PER_PERSON",
    "PER_DAY",
    "PER_PERSON_DAY",
    "PER_PERSON_HOUR",
  ]),
  pricePerPerson: z.string().optional(),
  pricePerDay: z.string().optional(),
  pricePerPersonDay: z.string().optional(),
  pricePerPersonHour: z.string().optional(),
  maxGuest: z.string().min(1, "Capacidade máxima é obrigatória"),
});

type VenueSettingsFormValues = z.infer<typeof venueSettingsSchema>;

export default function VenueSettings() {
  const { toast } = useToast();
  const { venueId } = useParams();
  const navigate = useNavigate();
  const { user } = useUserStore();
  const { selectedVenue, updateVenue, deleteVenue } = useVenueStore();

  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<VenueSettingsFormValues>({
    resolver: zodResolver(venueSettingsSchema),
    defaultValues: {
      name: "",
      email: "",
      url: "",
      street: "",
      streetNumber: "",
      complement: "",
      neighborhood: "",
      city: "",
      state: "",
      cep: "",
      checkIn: "",
      checkOut: "",
      hasOvernightStay: false,
      pricingModel: "PER_PERSON",
      pricePerPerson: "",
      pricePerDay: "",
      pricePerPersonDay: "",
      pricePerPersonHour: "",
      maxGuest: "",
    },
  });

  useEffect(() => {
    if (selectedVenue) {
      form.reset({
        name: selectedVenue.name || "",
        email: selectedVenue.email || "",
        url: selectedVenue.url || "",
        street: selectedVenue.street || "",
        streetNumber: selectedVenue.streetNumber || "",
        complement: selectedVenue.complement || "",
        neighborhood: selectedVenue.neighborhood || "",
        city: selectedVenue.city || "",
        state: selectedVenue.state || "",
        cep: selectedVenue.cep || "",
        checkIn: selectedVenue.checkIn || "",
        checkOut: selectedVenue.checkOut || "",
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
      });
    }
  }, [selectedVenue, form]);

  function formatCurrency(value: string | number) {
    const number = typeof value === 'number' ? value : Number(value.replace(/\D/g, "")) / 100;
    return number ? `R$ ${number.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : "";
  }

  function parseCurrencyStringToNumberString(value: string): string {
    let sanitized = value.replace(/R\$|\s|\./g, "");
    sanitized = sanitized.replace(",", ".");
    sanitized = sanitized.replace(/[^0-9.]/g, "");
    return sanitized;
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
    console.log('onSubmit disparado', data);
    setIsLoading(true);
    if (!selectedVenue.id || !user?.id) {
      console.log("venueId ou user.id não encontrado");
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

    try {
      const response = await updateVenue({
        venueId: selectedVenue.id,
        userId: user.id,
        data: {
          name: data.name,
          email: data.email,
          url: data.url,
          street: data.street,
          streetNumber: data.streetNumber,
          complement: data.complement,
          neighborhood: data.neighborhood,
          city: data.city,
          state: data.state,
          cep: data.cep,
          checkIn: data.checkIn,
          checkOut: data.checkOut,
          hasOvernightStay: data.hasOvernightStay,
          pricingModel: data.pricingModel,
          pricePerPerson: pricePerPerson || undefined,
          pricePerDay: pricePerDay || undefined,
          pricePerPersonDay: pricePerPersonDay || undefined,
          pricePerPersonHour: pricePerPersonHour || undefined,
          maxGuest: data.maxGuest,
        },
      });
      console.log("response", response);
      const { title, message } = handleBackendSuccess(
        response,
        "Configurações atualizadas com sucesso!"
      );
      showSuccessToast({
        title,
        description: message,
      });
    } catch (error: unknown) {
      console.log("error", error);
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
      navigate(`/organizations/${selectedVenue.organizationId}/venues`);
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

              <div className="grid grid-cols-3 gap-4">
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
          <div className="grid grid-cols-2 gap-4">
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

          <div>
            <div className="grid grid-cols-2 gap-4">
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

            <div className="grid grid-cols-2 gap-4 mt-4">
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

            <div className="grid grid-cols-3 gap-4 mt-4">
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
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="pricingModel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Modelo de precificação</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
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
                          onChange={(e) => handleCurrencyChange(e, field.onChange)}
                          placeholder="R$ 0,00"
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
                          onChange={(e) => handleCurrencyChange(e, field.onChange)}
                          placeholder="R$ 0,00"
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
                          onChange={(e) => handleCurrencyChange(e, field.onChange)}
                          placeholder="R$ 0,00"
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
                          onChange={(e) => handleCurrencyChange(e, field.onChange)}
                          placeholder="R$ 0,00"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              <FormField
                control={form.control}
                name="maxGuest"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Capacidade </FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
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
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          <div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {form.watch("hasOvernightStay") && (
                <div className="col-span-1 md:col-span-2">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="checkIn"
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
                      name="checkOut"
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
                  </div>
                </div>
              )}
              <div className="flex items-center space-x-2 mt-4 md:mt-6">
                <FormField
                  control={form.control}
                  name="hasOvernightStay"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center space-x-2 m-0 p-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={(checked) => {
                            field.onChange(checked);
                            if (!checked) {
                              form.setValue("checkIn", "");
                              form.setValue("checkOut", "");
                            }
                          }}
                        />
                      </FormControl>
                      <FormLabel className="m-0 p-0">Permite pernoite</FormLabel>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </div>
        </div>
      </FormLayout>
    </DashboardLayout>
  );
}
