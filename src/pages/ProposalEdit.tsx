import { chosenServiceHours, sameDayEventHours, serviceHourFieldError } from "@/lib/event-duration";
import { DashboardServiceChoices } from "@/components/proposal/DashboardServiceChoices";
import { requiredServiceIds } from "@/lib/required-service-ids";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
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
import { useProposalStore } from "@/store/proposalStore";
import { FormLayout } from "@/components/ui/form-layout";
import { handleBackendError, handleBackendSuccess } from "@/lib/error-handler";
import { showSuccessToast } from "@/components/ui/success-toast";
import { DashboardLayout } from "@/components/DashboardLayout";
import { EventCategory, ProposalType, TrafficSource } from "@/types/proposal";
import { EVENT_CATEGORY_MESSAGE, EVENT_CATEGORY_OPTIONS, eventCategoryForPayload } from "@/lib/event-category";
import { NumericFormat } from 'react-number-format';
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { Textarea } from "@/components/ui/textarea";
import { useServiceStore } from "@/store/serviceStore";
import { useVenueStore } from "@/store/venueStore";
import ProposalEditSkeleton from "@/components/proposal/ProposalEditSkeleton";
import { generateTimeOptions } from "@/components/proposal/forms/PerPersonProposalForm";
import { useUserVenuePermissionStore } from "@/store/userVenuePermissionStore";
import AccessDenied from "@/components/accessDenied";
import { wallClockDateIso, wallClockTime } from "@/lib/wall-clock-datetime";
import { buildQuoteInput } from "@/lib/proposal-quote-input";
import { chosenServiceCourtesy, courtesyInputFromLines, wholeGuestNumber, withoutKey } from "@/lib/service-courtesy";
import { useProposalQuote } from "@/hooks/proposal/queries/quote";
import { ProposalQuoteSummary } from "@/components/proposal/ProposalQuoteSummary";
import { applyDiscount, formatDiscountPercent, parseDiscountInput } from "@/lib/proposal-discount";

const proposalTypes = [
  { value: ProposalType.EVENT, label: "Evento" },
  { value: ProposalType.OVERNIGHT, label: "Pernoite" },
  { value: ProposalType.PRODUCTION, label: "Produção" },
  { value: ProposalType.BARTER, label: "Troca" },
  { value: ProposalType.OTHER, label: "Outro" },
] as const;

const trafficSources = [
  { value: TrafficSource.AIRBNB, label: "Airbnb" },
  { value: TrafficSource.GOOGLE, label: "Google" },
  { value: TrafficSource.INSTAGRAM, label: "Instagram" },
  { value: TrafficSource.TIKTOK, label: "TikTok" },
  { value: TrafficSource.FACEBOOK, label: "Facebook" },
  { value: TrafficSource.FRIEND, label: "Indicação" },
  { value: TrafficSource.OTHER, label: "Outro" },
] as const;

const editProposalSchema = z.object({
  proposalId: z.string(),
  data: z.object({
    completeClientName: z.string().min(1, "Nome do cliente é obrigatório"),
    completeCompanyName: z.string().optional(),
    email: z.string().trim().refine((value) => value === "" || z.string().email().safeParse(value).success, "E-mail inválido"),
    whatsapp: z.string().min(1, "WhatsApp é obrigatório"),
    guestNumber: z.string().min(1, "Número de convidados é obrigatório"),
    description: z.string().min(1, "Descrição é obrigatória"),
    knowsVenue: z.boolean(),
    type: z.nativeEnum(ProposalType),
    eventCategory: z.nativeEnum(EventCategory).optional(),
    trafficSource: z.nativeEnum(TrafficSource),
    totalAmountInput: z.string().min(1, "Valor total é obrigatório"),
    serviceIds: z.array(z.string()).default([]),
    date: z.string().min(1, "Data do evento é obrigatória"),
    startHour: z.string().min(1, "Horário de início é obrigatório"),
    endHour: z.string().min(1, "Horário de fim é obrigatório"),
  }).refine((data) => data.type !== ProposalType.EVENT || !!data.eventCategory, {
    message: EVENT_CATEGORY_MESSAGE,
    path: ["eventCategory"],
  }),
});

type EditProposalFormValues = z.infer<typeof editProposalSchema>;

export default function ProposalEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { fetchProposalById, updateProposalPerPerson, currentProposal, isLoading, deleteProposal } = useProposalStore();
  const { services, fetchServices, isLoading: isLoadingServices } = useServiceStore();
  const [serviceHoursInput, setServiceHoursInput] = useState<Record<string, string>>({});
  const [serviceHourErrors, setServiceHourErrors] = useState<Record<string, string>>({});
  const [serviceCourtesyInput, setServiceCourtesyInput] = useState<Record<string, string>>({});
  const [discountInput, setDiscountInput] = useState("");
  const [discountTouched, setDiscountTouched] = useState(false);
  const { selectedVenue } = useVenueStore();
  const form = useForm<EditProposalFormValues>({
    resolver: zodResolver(editProposalSchema),
    defaultValues: {
      proposalId: id,
      data: {
        completeClientName: "",
        completeCompanyName: "",
        email: "",
        whatsapp: "",
        guestNumber: "",
        description: "",
        knowsVenue: false,
        type: ProposalType.EVENT,
        trafficSource: TrafficSource.OTHER,
        totalAmountInput: "",
        serviceIds: [],
        date: "",
        startHour: "",
        endHour: "",
      },
    },
  });

  useEffect(() => {
    if (id && id.trim() !== '') {
      fetchProposalById(id);
    }
  }, [id, fetchProposalById]);

  useEffect(() => {
    if (currentProposal && currentProposal.id) {
      form.reset({
        proposalId: currentProposal.id,
        data: {
          completeClientName: currentProposal.completeClientName || "",
          completeCompanyName: currentProposal.completeCompanyName || "",
          email: currentProposal.email || "",
          whatsapp: currentProposal.whatsapp || "",
          guestNumber: currentProposal.guestNumber?.toString() || "",
          description: currentProposal.description || "",
          knowsVenue: currentProposal.knowsVenue || false,
          type: currentProposal.type || ProposalType.EVENT,
          eventCategory: currentProposal.eventCategory ?? undefined,
          trafficSource: currentProposal.trafficSource || TrafficSource.OTHER,
          totalAmountInput: currentProposal.totalAmount?.toString() || "",
          serviceIds: (currentProposal.proposalServices || []).map(service => service.serviceId),
          date: currentProposal.startDate ? wallClockDateIso(currentProposal.startDate) : '',
          startHour: currentProposal.startDate ? wallClockTime(currentProposal.startDate) : '',
          endHour: currentProposal.endDate ? wallClockTime(currentProposal.endDate) : '',
        },
      });
      const hours: Record<string, string> = {};
      for (const line of currentProposal.proposalServices || []) {
        const pricing = line.pricingType ?? line.service?.pricingType;
        if (pricing === "PER_HOUR" && Number.isInteger(line.quantity)) {
          hours[line.serviceId] = String(line.quantity);
        }
      }
      setServiceHoursInput(hours);
      setServiceHourErrors({});
      setServiceCourtesyInput(courtesyInputFromLines(currentProposal.proposalServices || []));
      const savedPercent = currentProposal.discountPercent ?? 0;
      setDiscountInput(savedPercent > 0 ? formatDiscountPercent(savedPercent) : "");
      setDiscountTouched(savedPercent > 0);
    }
  }, [currentProposal, form]);

  useEffect(() => {
    if (currentProposal?.venueId && currentProposal.venueId.trim() !== '') {
      fetchServices(currentProposal.venueId);
    }
  }, [currentProposal?.venueId, fetchServices]);

  const guestNumberValue = form.watch("data.guestNumber");
  const selectedServiceIds = form.watch("data.serviceIds");
  const dateValue = form.watch("data.date");
  const startHourValue = form.watch("data.startHour");
  const endHourValue = form.watch("data.endHour");
  const typeValue = form.watch("data.type");
  const totalAmountValue = form.watch("data.totalAmountInput");
  const isBarter = typeValue === ProposalType.BARTER;
  const eventHours = sameDayEventHours(dateValue || "", startHourValue || "", endHourValue || "");
  const quoteInput = buildQuoteInput({
    venueId: currentProposal?.venueId || "",
    date: dateValue,
    startHour: startHourValue,
    endHour: endHourValue,
    guestNumber: guestNumberValue,
    type: typeValue,
    services: services ?? [],
    selectedServiceIds,
    serviceHoursInput,
    serviceCourtesyInput,
  });
  const { quote, isUpdating, error: quoteError } = useProposalQuote(isBarter ? null : quoteInput);
  const courtesy = chosenServiceCourtesy({
    services: services ?? [],
    selectedIds: selectedServiceIds,
    courtesyInput: serviceCourtesyInput,
    hoursInput: serviceHoursInput,
    guestNumber: wholeGuestNumber(guestNumberValue),
  });
  const discount = parseDiscountInput(discountInput);
  const discountedTotal = quote && quoteInput && !isBarter && !discount.error
    ? applyDiscount(quote.totalAmount, discount.percent).totalAmount
    : null;
  const savedTotal = currentProposal?.totalAmount;
  const saveNotice =
    discountedTotal !== null && savedTotal != null &&
    Number(totalAmountValue) === savedTotal && discountedTotal !== savedTotal
      ? `Ao salvar sem mudar o Total, o valor passa para ${discountedTotal.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}.`
      : null;

  useEffect(() => {
    if (!discountTouched || discountedTotal === null) return;
    form.setValue("data.totalAmountInput", String(discountedTotal), { shouldDirty: true });
  }, [discountTouched, discountedTotal, form]);

  useEffect(() => {
    const guestNumber = parseInt(guestNumberValue || "0", 10);
    const required = requiredServiceIds(services ?? [], Number.isNaN(guestNumber) ? 0 : guestNumber);
    const current = form.getValues("data.serviceIds");
    const kept = current.filter((id) => !required.includes(id));
    const next = [...new Set([...required, ...kept])];
    if (next.length === current.length && next.every((id, index) => id === current[index])) return;
    form.setValue("data.serviceIds", next);
  }, [guestNumberValue, services, form]);

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

  const onSubmit = async (data: EditProposalFormValues) => {
    const { serviceHours, errors: hourErrors } = chosenServiceHours(
      services ?? [],
      data.data.serviceIds,
      serviceHoursInput,
      sameDayEventHours(data.data.date, data.data.startHour, data.data.endHour),
    );
    if (Object.keys(hourErrors).length > 0) {
      setServiceHourErrors(hourErrors);
      return;
    }
    if (Object.keys(courtesy.errors).length > 0) return;
    if (!isBarter && discount.error) return;

    try {
      const response = await updateProposalPerPerson({
        proposalId: data.proposalId,
        data: {
          completeClientName: data.data.completeClientName,
          completeCompanyName: data.data.completeCompanyName,
          date: data.data.date,
          venueId: currentProposal?.venueId || '',
          endHour: data.data.endHour,
          whatsapp: data.data.whatsapp,
          startHour: data.data.startHour,
          guestNumber: data.data.guestNumber,
          description: data.data.description,
          knowsVenue: data.data.knowsVenue,
          email: data.data.email.trim() === "" ? null : data.data.email.trim(),
          totalAmountInput: data.data.totalAmountInput,
          discountPercent: isBarter ? 0 : discount.percent,
          serviceIds: data.data.serviceIds,
          serviceHours,
          ...(courtesy.serviceCourtesy.length > 0 ? { serviceCourtesy: courtesy.serviceCourtesy } : {}),
          type: data.data.type,
          eventCategory: eventCategoryForPayload(data.data.type, data.data.eventCategory),
          trafficSource: data.data.trafficSource,
        },
      });

      const { title, message } = handleBackendSuccess(response, "Orçamento atualizado com sucesso!");
      showSuccessToast({
        title,
        description: message
      });
      
      // Recarregar a proposta para garantir que temos os dados mais atualizados
      navigate(`/proposal/${id}`)
    } catch (error: unknown) {
      const { title, message } = handleBackendError(error, "Erro ao atualizar orçamento. Tente novamente mais tarde.");
      toast({
        title,
        description: message,
        variant: "destructive",
      });
    }
  };

  const handleDelete = async () => {
    if (!currentProposal) return;
    try {
      await deleteProposal(currentProposal.id);
      showSuccessToast({
        title: "Orçamento excluído",
        description: "O orçamento foi excluído com sucesso."
      });
      navigate(`/venue/${selectedVenue.id}/budgets`)
    } catch (error: unknown) {
      const { title, message } = handleBackendError(error, "Erro ao excluir orçamento. Tente novamente mais tarde.");
      toast({
        title,
        description: message,
        variant: "destructive",
      });
    }
  };

  return (
    <DashboardLayout title="Editar Orçamento">
      {!currentProposal ? (
        <ProposalEditSkeleton />
      ) : (
        <FormLayout
          form={form}
          title="Editar Orçamento"
          onSubmit={onSubmit}
          onCancel={() => navigate(`/proposal/${id}`)}
          submitLabel="Atualizar"
          isSubmitting={isLoading}
          isEditing={true}
          onDelete={handleDelete}
          entityName={currentProposal?.completeClientName}
          entityType="orçamento"
        >
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="data.completeClientName"
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
                name="data.completeCompanyName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome da Empresa</FormLabel>
                    <FormControl>
                      <Input placeholder="Nome da empresa (opcional)" {...field} />
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
                    <FormLabel>E-mail (opcional)</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="email@cliente.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="data.whatsapp"
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
                        inputStyle={{ width: "100%" }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="data.date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data do evento :</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="data.startHour"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Horário Início</FormLabel>
                    <FormControl>
                      <Select 
                        value={field.value} 
                        onValueChange={(value) => {
                          field.onChange(value);
                          // Calcular horário de fim automaticamente baseado na duração padrão
                          if (value && selectedVenue?.standardEventDuration) {
                            const [hours, minutes] = value.split(":").map(Number);
                            const endHours = hours + selectedVenue.standardEventDuration;
                            const endTime = `${endHours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
                            form.setValue('data.endHour', endTime);
                          }
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o horário" />
                        </SelectTrigger>
                        <SelectContent>
                          {generateTimeOptions().map((time) => (
                            <SelectItem key={time} value={time}>
                              {time}
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
                name="data.endHour"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Horário Fim</FormLabel>
                    <FormControl>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o horário" />
                        </SelectTrigger>
                        <SelectContent>
                          {generateTimeOptions().map((time) => (
                            <SelectItem key={time} value={time}>
                              {time}
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="data.guestNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Convidados</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="Ex: 100" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="data.totalAmountInput"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Total</FormLabel>
                    <FormControl>
                      <NumericFormat
                        value={field.value}
                        valueIsNumericString
                        onValueChange={(values, sourceInfo) => {
                          field.onChange(values.value);
                          if (sourceInfo.source === "event") {
                            setDiscountInput("");
                            setDiscountTouched(false);
                          }
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

            <FormField
              control={form.control}
              name="data.description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descricao:</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Descreva os detalhes do evento" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="data.knowsVenue"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Já conhece o espaço?</FormLabel>
                  <FormControl>
                    <Select
                      value={field.value === true ? "sim" : "nao"}
                      onValueChange={v => field.onChange(v === "sim")}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sim">Sim</SelectItem>
                        <SelectItem value="nao">Não</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="data.type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo do aluguel:</FormLabel>
                  <FormControl>
                    <Select
                      value={field.value}
                      onValueChange={(value) => {
                        field.onChange(value);
                        if (value !== ProposalType.EVENT) form.setValue("data.eventCategory", undefined);
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        {proposalTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {typeValue === ProposalType.EVENT && (
              <FormField
                control={form.control}
                name="data.eventCategory"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Categoria do evento:</FormLabel>
                    <FormControl>
                      <Select value={field.value ?? ""} onValueChange={field.onChange}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                          {EVENT_CATEGORY_OPTIONS.map((category) => (
                            <SelectItem key={category.value} value={category.value}>{category.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <div>
              <FormLabel>Serviços</FormLabel>
              {isLoadingServices ? (
                <div>Carregando serviços...</div>
              ) : (
                <DashboardServiceChoices
                  services={services || []}
                  guestNumber={parseInt(guestNumberValue || "0", 10) || 0}
                  selectedIds={selectedServiceIds}
                  hoursInput={serviceHoursInput}
                  hourErrors={serviceHourErrors}
                  courtesyInput={serviceCourtesyInput}
                  courtesyErrors={courtesy.errors}
                  onToggle={(serviceId, checked) => {
                    const current = form.getValues("data.serviceIds");
                    if (checked) {
                      form.setValue("data.serviceIds", [...current, serviceId]);
                      return;
                    }
                    form.setValue("data.serviceIds", current.filter((id) => id !== serviceId));
                    setServiceHoursInput((currentHours) => {
                      const next = { ...currentHours };
                      delete next[serviceId];
                      return next;
                    });
                    setServiceHourErrors((currentErrors) => {
                      const next = { ...currentErrors };
                      delete next[serviceId];
                      return next;
                    });
                    setServiceCourtesyInput((currentCourtesy) => withoutKey(currentCourtesy, serviceId));
                  }}
                  onHoursChange={(serviceId, value) => {
                    setServiceHoursInput((currentHours) => ({ ...currentHours, [serviceId]: value }));
                  }}
                  onCourtesyChange={(serviceId, value) => {
                    setServiceCourtesyInput((currentCourtesy) => ({ ...currentCourtesy, [serviceId]: value }));
                  }}
                />
              )}
            </div>

            <ProposalQuoteSummary
              hasInput={!!quoteInput}
              isBarter={isBarter}
              quote={quote}
              isUpdating={isUpdating}
              error={quoteError}
              notice={saveNotice}
              discountInput={discountInput}
              onDiscountChange={(value) => {
                setDiscountInput(value);
                setDiscountTouched(true);
              }}
            />

            <FormField
              control={form.control}
              name="data.trafficSource"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Onde nos achou?</FormLabel>
                  <FormControl>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        {trafficSources.map((source) => (
                          <SelectItem key={source.value} value={source.value}>{source.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </FormLayout>
      )}
    </DashboardLayout>
  );
} 