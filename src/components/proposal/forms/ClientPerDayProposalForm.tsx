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
  ProposalType,
  TrafficSource,
  CreateProposalPerDayDTO,
} from "@/types/proposal";
import { PROPOSAL_TYPE_OPTIONS, TRAFFIC_SOURCE_OPTIONS } from "./constants";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { handleBackendError, handleBackendSuccess } from "@/lib/error-handler";
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
  trafficSource: z.nativeEnum(TrafficSource),
  totalAmountInput: z.string().optional(),
});

type FormValues = z.infer<typeof baseFormSchema>;

interface PerDayProposalFormProps {
  venueId: string;
  onBack: () => void;
}

function formatWhatsapp(value: string) {
  value = value.replace(/\D/g, "");
  if (value.length > 11) value = value.slice(0, 11);
  if (value.length > 6) {
    return `(${value.slice(0, 2)}) ${value.slice(2, 7)}-${value.slice(7)}`;
  } else if (value.length > 2) {
    return `(${value.slice(0, 2)}) ${value.slice(2)}`;
  } else if (value.length > 0) {
    return `(${value}`;
  }
  return "";
}

export function ClientPerDayProposalForm({
  venueId,
  onBack,
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

  const onSubmit = async (values: FormValues) => {
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
        trafficSource: values.trafficSource,
        venueId,
        serviceIds: selectedServiceIds,
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

  return (
    <FormProvider {...form}>
      <form
        className="space-y-4 bg-white p-4 rounded-lg"
        onSubmit={e => {
          e.preventDefault();
          form.handleSubmit(onSubmit)(e);
        }}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  inputStyle={{ width: "100%" }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  <p className="text-xs text-gray-500">
                    Máximo de hóspedes: {selectedVenue.maxGuest}
                  </p>
                )}
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
                  placeholder="Descreva os detalhes da estadia"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

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

        <div>
          <FormLabel>Serviços</FormLabel>
          {isLoadingServices ? (
            <div>Carregando serviços...</div>
          ) : (
            <div className="flex flex-wrap gap-3 mt-2">
              {(services || []).map(service => {
                const guestNumber = parseInt(form.watch('guestNumber') || '0');
                const requiredServices = getRequiredServices(guestNumber);
                const isRequired = requiredServices.includes(service.id);
                let requiredText = '';
                if (service.rpaRequired && service.rpaMinPeople) {
                  requiredText = ` (Obrigatório - ${service.rpaMinPeople}+ pessoas)`;
                }
                return (
                  <label key={service.id} className={`flex items-center gap-2 ${isRequired ? 'opacity-75' : ''}`}>
                    <input
                      type="checkbox"
                      checked={selectedServiceIds.includes(service.id)}
                      disabled={isRequired}
                      onChange={e => {
                        if (!isRequired) {
                          if (e.target.checked) {
                            setSelectedServiceIds(ids => [...ids, service.id]);
                          } else {
                            setSelectedServiceIds(ids => ids.filter(id => id !== service.id));
                          }
                        }
                      }}
                    />
                    <span className={isRequired ? 'font-medium text-[13px]' : 'text-[13px]'}>
                      {service.name}
                    </span>
                    <span className="text-xs text-gray-500">(R$ {service.price.toFixed(2)})</span>
                  </label>
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
                  <SelectContent>
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
        <div className="flex justify-end space-x-2">

          <AsyncActionButton
            onClick={async () => {
              const isValid = await form.trigger();
              if (!isValid) {
                throw new Error("Por favor, corrija os erros no formulário");
              }
              const values = form.getValues();
              await onSubmit(values);
            }}
            label="Criar Orçamento"
          />
        </div>
      </form>
    </FormProvider>
  );
}
