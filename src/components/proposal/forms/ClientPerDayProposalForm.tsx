import { chosenServiceHours, SERVICE_HOURS_MESSAGE, serviceHourFieldError, stayEventHours } from "@/lib/event-duration";
import { useNavigate } from "react-router-dom";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { FormLayout } from "@/components/ui/form-layout";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useProposalStore } from "@/store/proposalStore";
import {
  EventCategory,
  ProposalType,
  TrafficSource,
  CreateProposalPerDayDTO,
} from "@/types/proposal";
import { PROPOSAL_TYPE_OPTIONS, TRAFFIC_SOURCE_OPTIONS } from "./constants";
import { EVENT_CATEGORY_MESSAGE, EVENT_CATEGORY_OPTIONS } from "@/lib/event-category";
import { useEffect, useState, type CSSProperties } from "react";
import { PublicBudgetStepIndicator, PublicBudgetStepNav, PublicBudgetStepStage, publicBudgetActionMotion } from "./PublicBudgetFormSteps";
import { PublicServiceDetail } from "./PublicServiceDetail";
import { useToast } from "@/hooks/use-toast";
import { handleBackendError, handleBackendSuccess } from "@/lib/error-handler";
import { formatWhatsapp } from "@/lib/whatsapp-mask";
import { showSuccessToast } from "@/components/ui/success-toast";
import { useServiceStore } from "@/store/serviceStore";
import { NumericFormat } from "react-number-format";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { useVenueStore } from "@/store/venueStore";
import { AsyncActionButton } from "@/components/AsyncActionButton";

const baseFormSchema = z.object({
  completeClientName: z.string().min(1, "Nome do cliente é obrigatório"),
  startDay: z.string().min(1, "Data de check-in é obrigatória"),
  endDay: z.string().min(1, "Data de check-out é obrigatória"),
  guestNumber: z.string().min(1, "Número de hóspedes é obrigatório"),
  email: z.string().email("E-mail inválido"),
  whatsapp: z.string()
    .min(10, "WhatsApp é obrigatório")
    .refine((val) => {
      const onlyNumbers = val.replace(/\D/g, "");
      // Deve ter entre 10 e 13 dígitos (Brasil)
      if (onlyNumbers.length < 10 || onlyNumbers.length > 13) return false;
      // Não pode ser sequência repetida (ex: 99999999999, 11111111111)
      if (/^(\d)\1{7,}$/.test(onlyNumbers)) return false;
      // Não pode começar com 0
      if (/^0/.test(onlyNumbers)) return false;
      return true;
    }, {
      message: "Número de WhatsApp inválido",
    }),
  description: z.string().min(1, "Descrição é obrigatória"),
  knowsVenue: z.boolean(),
  type: z.nativeEnum(ProposalType),
  eventCategory: z.nativeEnum(EventCategory, {
    required_error: EVENT_CATEGORY_MESSAGE,
    invalid_type_error: EVENT_CATEGORY_MESSAGE,
  }),
  trafficSource: z.nativeEnum(TrafficSource),
  totalAmountInput: z.string().optional(),
});

type FormValues = z.infer<typeof baseFormSchema>;

interface PerDayProposalFormProps {
  venueId: string;
  onBack: () => void;
  cardStyle?: CSSProperties;
  buttonStyle?: CSSProperties;
}

export function ClientPerDayProposalForm({
  venueId,
  onBack,
  cardStyle,
  buttonStyle,
}: PerDayProposalFormProps) {
  const navigate = useNavigate();
  const { selectedVenue } = useVenueStore();
  const { createProposalPerDay } = useProposalStore();
  const {
    services,
    fetchServices,
    isLoading: isLoadingServices,
  } = useServiceStore();
  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>([]);
  const [serviceHoursInput, setServiceHoursInput] = useState<Record<string, string>>({});
  const [serviceHourErrors, setServiceHourErrors] = useState<Record<string, string>>({});
  const [step, setStep] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    if (venueId) fetchServices(venueId);
  }, [venueId, fetchServices]);

  // Cria o schema dinâmico com base no maxGuest
  const maxGuest = selectedVenue?.maxGuest;
  const formSchema = baseFormSchema.refine((data) => {
    if (!maxGuest) return true;
    const guestNumber = parseInt(data.guestNumber, 10);
    return guestNumber <= maxGuest;
  }, {
    message: `Número máximo de hóspedes permitido é ${maxGuest || 0}`,
    path: ["guestNumber"],
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      completeClientName: "",
      startDay: "",
      endDay: "",
      guestNumber: "",
      email: "",
      whatsapp: "",
      description: "",
      knowsVenue: false,
      type: ProposalType.EVENT,
      trafficSource: TrafficSource.OTHER,
      totalAmountInput: ""
    }
  });

  // Função para obter serviços obrigatórios baseado no número de hóspedes
  const getRequiredServices = (guestNumber: number) => {
    const requiredServices: string[] = [];
    (services || []).forEach(service => {
      if (service.rpaRequired && service.rpaMinPeople) {
        if (guestNumber >= service.rpaMinPeople) {
          requiredServices.push(service.id);
        }
      }
    });
    return requiredServices;
  };

  // Atualizar serviços obrigatórios quando o número de hóspedes mudar
  useEffect(() => {
    const guestNumber = parseInt(form.watch('guestNumber') || '0');
    const requiredServices = getRequiredServices(guestNumber);
    // Manter serviços já selecionados pelo usuário
    const userSelectedServices = selectedServiceIds.filter(id => !requiredServices.includes(id));
    // Combinar serviços obrigatórios com os selecionados pelo usuário
    const newSelectedServices = [...new Set([...requiredServices, ...userSelectedServices])];
    setSelectedServiceIds(newSelectedServices);
  }, [form.watch('guestNumber'), services]);

  const eventHours = stayEventHours(
    form.watch("startDay") || "",
    form.watch("endDay") || "",
    selectedVenue?.checkIn || "14:00",
    selectedVenue?.checkOut || "12:00",
  );

  useEffect(() => {
    setServiceHourErrors((current) => {
      const next = { ...current };
      for (const [id, raw] of Object.entries(serviceHoursInput)) {
        const message = serviceHourFieldError(raw, eventHours);
        if (message) next[id] = message;
        else delete next[id];
      }
      return next;
    });
  }, [serviceHoursInput, eventHours]);

  const onSubmit = async (values: FormValues) => {
    const { serviceHours, errors: hourErrors } = chosenServiceHours(
      services ?? [],
      selectedServiceIds,
      serviceHoursInput,
      stayEventHours(
        values.startDay,
        values.endDay,
        selectedVenue?.checkIn || "14:00",
        selectedVenue?.checkOut || "12:00",
      ),
    );
    if (Object.keys(hourErrors).length > 0) {
      setServiceHourErrors(hourErrors);
      setStep(2);
      throw new Error(SERVICE_HOURS_MESSAGE);
    }

    try {
      const proposalData: CreateProposalPerDayDTO = {
        completeClientName: values.completeClientName,
        startDay: values.startDay,
        endDay: values.endDay,
        startHour: selectedVenue?.checkIn || "14:00", // Usa o horário fixo do venue
        endHour: selectedVenue?.checkOut || "12:00", // Usa o horário fixo do venue
        guestNumber: values.guestNumber,
        email: values.email,
        whatsapp: values.whatsapp,
        description: values.description,
        knowsVenue: values.knowsVenue,
        type: values.type,
        eventCategory: values.eventCategory,
        trafficSource: values.trafficSource,
        venueId,
        serviceIds: selectedServiceIds,
        serviceHours,
        totalAmountInput: values.totalAmountInput,
      };

      const response = await createProposalPerDay(proposalData);

      const { title, message } = handleBackendSuccess(
        response,
        "Orçamento criado com sucesso!"
      );
      showSuccessToast({
        title,
        description: message,
      });

      // Redirecionar para a página de visualização da proposta
      if (response?.data?.id) {
        navigate(`/proposal/${response.data.id}/view`);
      } else {
        onBack();
      }
    } catch (error: unknown) {
      const { title, message } = handleBackendError(
        error,
        "Erro ao criar orçamento. Tente novamente mais tarde."
      );
      toast({
        title,
        description: message,
        variant: "destructive",
      });
      throw error; // Para o AsyncActionButton saber que houve erro
    }
  };

  async function goNext() {
    const fields = step === 0
      ? ["completeClientName", "email", "whatsapp"] as const
      : ["startDay", "endDay", "guestNumber", "eventCategory", "description"] as const;
    const valid = await form.trigger([...fields]);
    if (valid) setStep((current) => current + 1);
  }

  return (
    <FormProvider {...form}>
      <div className="mx-auto flex w-full max-w-2xl flex-col items-center gap-6 motion-safe:animate-rise-in">
      <PublicBudgetStepIndicator step={step} />
      <form
        className={`w-full space-y-4 rounded-lg bg-white p-4 shadow-lg ${
          buttonStyle?.backgroundColor
            ? "[&_input]:!bg-[var(--field-bg)] [&_input]:!text-[var(--field-text)] [&_input]:placeholder:!text-[color-mix(in_srgb,var(--field-text)_65%,transparent)] [&_textarea]:!bg-[var(--field-bg)] [&_textarea]:!text-[var(--field-text)] [&_textarea]:placeholder:!text-[color-mix(in_srgb,var(--field-text)_65%,transparent)] [&_[role=combobox]]:!bg-[var(--field-bg)] [&_[role=combobox]]:!text-[var(--field-text)]"
            : "[&_input]:text-foreground [&_textarea]:text-foreground [&_[role=combobox]]:text-foreground"
        }`}
        style={{
          ...cardStyle,
          ...(buttonStyle?.backgroundColor
            ? ({
                "--field-bg": buttonStyle.backgroundColor,
                "--field-text": buttonStyle.color,
              } as CSSProperties)
            : {}),
        }}
        onSubmit={e => {
          e.preventDefault();
          if (step !== 2) return;
          form.handleSubmit(onSubmit)(e);
        }}
      >
        <PublicBudgetStepStage step={step}>
        <div className="space-y-4">
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="completeClientName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome</FormLabel>
                <FormControl>
                  <Input placeholder="Nome completo do cliente" {...field} />
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
                <FormLabel>E-mail</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="email@cliente.com"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="whatsapp"
          render={({ field }) => (
            <FormItem>
              <FormLabel>WhatsApp</FormLabel>
              <FormControl>
                <PhoneInput
                  country={"br"}
                  value={field.value}
                  onChange={field.onChange}
                  inputClass="w-full"
                  placeholder="Digite o número"
                  enableSearch={true}
                  containerClass="w-full"
                  containerStyle={{ fontFamily: "Manrope, sans-serif" }}
                  inputStyle={{
                    width: "100%",
                    backgroundColor: buttonStyle?.backgroundColor,
                    color: buttonStyle?.color,
                  }}
                  buttonStyle={{
                    backgroundColor: buttonStyle?.backgroundColor,
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
          />
        </div>

        <div className="space-y-4">
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="startDay"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Data de Check-in</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="endDay"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Data de Check-out</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Exibe os horários fixos do venue */}
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Horário de Check-in</label>
            <div className="p-3 bg-gray-50 border border-gray-200 rounded-md">
              <span className="text-gray-700 font-medium">
                {selectedVenue?.checkIn || "14:00"}
              </span>
              <p className="text-xs text-gray-500 mt-1">
                Horário fixo definido pelo espaço
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Horário de Check-out</label>
            <div className="p-3 bg-gray-50 border border-gray-200 rounded-md">
              <span className="text-gray-700 font-medium">
                {selectedVenue?.checkOut || "12:00"}
              </span>
              <p className="text-xs text-gray-500 mt-1">
                Horário fixo definido pelo espaço
              </p>
            </div>
          </div>
        </div>

        <div className="w-full">
          <FormField
            control={form.control}
            name="guestNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Número de Hóspedes</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="Ex: 4"
                    {...field}
                    min={1}
                    max={selectedVenue?.maxGuest || undefined}
                  />
                </FormControl>
                <FormMessage />
                {selectedVenue?.maxGuest && (
                  <p className="text-xs opacity-70">
                    Máximo de hóspedes: {selectedVenue.maxGuest}
                  </p>
                )}
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="eventCategory"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Categoria do evento</FormLabel>
              <FormControl>
                <Select value={field.value ?? ""} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent className="font-['Manrope',sans-serif]">
                    {EVENT_CATEGORY_OPTIONS.map((category) => (
                      <SelectItem key={category.value} value={category.value}>
                        {category.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descrição</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Descreva os detalhes da estadia"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
          />
        </div>

        <div className="space-y-4">
        <FormField
          control={form.control}
          name="knowsVenue"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Já conhece o espaço?</FormLabel>
              <FormControl>
                <Select
                  value={field.value === true ? "sim" : "nao"}
                  onValueChange={(v) => field.onChange(v === "sim")}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent className="font-['Manrope',sans-serif]">
                    <SelectItem value="sim">Sim</SelectItem>
                    <SelectItem value="nao">Não</SelectItem>
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div>
          <FormLabel>Serviços</FormLabel>
          {isLoadingServices ? (
            <div>Carregando serviços...</div>
          ) : (
            <div className="mt-2 flex flex-col gap-3">
              {[...(services || [])]
                .sort((a, b) => {
                  const minA = a.rpaRequired && a.rpaMinPeople ? a.rpaMinPeople : Number.POSITIVE_INFINITY;
                  const minB = b.rpaRequired && b.rpaMinPeople ? b.rpaMinPeople : Number.POSITIVE_INFINITY;
                  return minA - minB;
                })
                .map(service => {
                const guestNumber = parseInt(form.watch('guestNumber') || '0');
                const requiredServices = getRequiredServices(guestNumber);
                const isRequired = requiredServices.includes(service.id);
                let requiredText = "";
                if (service.rpaRequired && service.rpaMinPeople) {
                  const minPeople = service.rpaMinPeople;
                  requiredText = minPeople === 1
                    ? "Obrigatório a partir de 1 pessoa."
                    : `Obrigatório a partir de ${minPeople} pessoas.`;
                }
                const checked = selectedServiceIds.includes(service.id);
                const asksHours = service.pricingType === "PER_HOUR" && checked;
                return (
                  <div key={service.id} className="flex items-center justify-between gap-3">
                  <label className="flex min-w-0 flex-1 items-start gap-2">
                    <input
                      type="checkbox"
                      className="mt-0.5 shrink-0"
                      checked={checked}
                      disabled={isRequired}
                      onChange={e => {
                        if (!isRequired) {
                          if (e.target.checked) {
                            setSelectedServiceIds(ids => [...ids, service.id]);
                          } else {
                            setSelectedServiceIds(ids => ids.filter(id => id !== service.id));
                            setServiceHoursInput((current) => {
                              const next = { ...current };
                              delete next[service.id];
                              return next;
                            });
                            setServiceHourErrors((current) => {
                              const next = { ...current };
                              delete next[service.id];
                              return next;
                            });
                          }
                        }
                      }}
                    />
                    <span className="min-w-0 text-[13px]">
                      <span className={isRequired ? "font-medium" : undefined}>{service.name}</span>
                      <PublicServiceDetail
                        name={service.name}
                        description={service.description}
                        imageUrl={service.imageUrl}
                        surfaceStyle={cardStyle}
                      />
                      {requiredText && (
                        <span className="text-xs opacity-70"> {requiredText}</span>
                      )}
                    </span>
                  </label>
                  {asksHours && (
                    <div className="flex w-44 shrink-0 flex-col items-end gap-1">
                      <div className="flex items-center gap-2">
                        <label htmlFor={`service-hours-${service.id}`} className="whitespace-nowrap text-xs">
                          Quantas horas?
                        </label>
                        <input
                          id={`service-hours-${service.id}`}
                          type="text"
                          inputMode="numeric"
                          className="h-9 w-14 rounded-md border bg-transparent px-2 text-sm"
                          value={serviceHoursInput[service.id] ?? ""}
                          aria-invalid={Boolean(serviceHourErrors[service.id])}
                          onChange={(event) => {
                            const value = event.target.value;
                            setServiceHoursInput((current) => ({ ...current, [service.id]: value }));
                          }}
                        />
                      </div>
                      {serviceHourErrors[service.id] && (
                        <p role="alert" className="text-right text-xs text-red-500">{serviceHourErrors[service.id]}</p>
                      )}
                    </div>
                  )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <FormField
          control={form.control}
          name="trafficSource"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Onde nos achou?</FormLabel>
              <FormControl>
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent className="font-['Manrope',sans-serif]">
                    {TRAFFIC_SOURCE_OPTIONS.map((source) => (
                      <SelectItem key={source.value} value={source.value}>
                        {source.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        </div>
        </PublicBudgetStepStage>
        <PublicBudgetStepNav
          step={step}
          onBack={() => setStep((current) => current - 1)}
          onNext={() => { void goNext(); }}
          buttonStyle={buttonStyle}
          submit={
            <AsyncActionButton
              onClick={async () => {
                const isValid = await form.trigger();
                if (!isValid) {
                  const errors = form.formState.errors;
                  if (errors.completeClientName || errors.email || errors.whatsapp) {
                    setStep(0);
                  } else if (errors.startDay || errors.endDay || errors.guestNumber || errors.description) {
                    setStep(1);
                  }
                  throw new Error("Por favor, corrija os erros no formulário");
                }
                const values = form.getValues();
                await onSubmit(values);
              }}
              label="Criar Orçamento"
              className={publicBudgetActionMotion}
              style={buttonStyle}
            />
          }
        />
      </form>
      </div>
    </FormProvider>
  );
}
