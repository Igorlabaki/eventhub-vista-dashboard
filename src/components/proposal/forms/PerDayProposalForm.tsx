import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { FormLayout } from "@/components/ui/form-layout";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useProposalStore } from "@/store/proposalStore";
import { ProposalType, TrafficSource, CreateProposalPerDayDTO } from "@/types/proposal";
import { PROPOSAL_TYPE_OPTIONS, TRAFFIC_SOURCE_OPTIONS } from "./constants";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { handleBackendError, handleBackendSuccess } from "@/lib/error-handler";
import { showSuccessToast } from "@/components/ui/success-toast";
import { useServiceStore } from "@/store/serviceStore";
import { NumericFormat } from 'react-number-format';
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { useVenueStore } from "@/store/venueStore";

const formSchema = z.object({
  completeClientName: z.string().min(1, "Nome do cliente é obrigatório"),
  startDay: z.string().min(1, "Data de check-in é obrigatória"),
  endDay: z.string().min(1, "Data de check-out é obrigatória"),
  startHour: z.string().min(1, "Horário de início é obrigatório"),
  endHour: z.string().min(1, "Horário de término é obrigatório"),
  guestNumber: z.string().min(1, "Número de hóspedes é obrigatório"),
  email: z.string().email("E-mail inválido"),
  whatsapp: z.string().min(1, "WhatsApp é obrigatório"),
  description: z.string().min(1, "Descrição é obrigatória"),
  knowsVenue: z.boolean(),
  type: z.nativeEnum(ProposalType),
  trafficSource: z.nativeEnum(TrafficSource),
  totalAmountInput: z.string().optional(),
}).refine(
  (data) => data.startHour >= "07:00" && data.startHour <= "22:00",
  { message: "Horário de início deve ser entre 07:00 e 22:00", path: ["startHour"] }
).refine(
  (data) => data.endHour >= "07:00" && data.endHour <= "22:00",
  { message: "Horário de término deve ser entre 07:00 e 22:00", path: ["endHour"] }
).refine(
  (data) => data.startHour <= data.endHour,
  { message: "Horário de início não pode ser maior que o de término", path: ["endHour"] }
);

type FormValues = z.infer<typeof formSchema>;

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

function clampHour(value: string) {
  if (!value) return value;
  if (value < "07:00") return "07:00";
  if (value > "22:00") return "22:00";
  return value;
}

// Função para gerar opções de horário (hora cheia e meia hora)
function generateTimeOptions() {
  const options = [];
  for (let hour = 0; hour <= 23; hour++) {
    const hourStr = hour.toString().padStart(2, '0');
    options.push(`${hourStr}:00`);
    options.push(`${hourStr}:30`);
  }
  return options;
}

export function PerDayProposalForm({ venueId, onBack }: PerDayProposalFormProps) {
  const navigate = useNavigate();
  const { createProposalPerDay } = useProposalStore();
  const { services, fetchServices, isLoading: isLoadingServices } = useServiceStore();
  const { selectedVenue } = useVenueStore();
  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>([]);
  const { toast } = useToast();
  
  // Definir valores iniciais dos horários com base na venue
  const initialStartHour = selectedVenue?.checkIn || "";
  const initialEndHour = selectedVenue?.checkOut || "";
  
  useEffect(() => {
    if (venueId) fetchServices(venueId);
  }, [venueId, fetchServices]);
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      completeClientName: "",
      startDay: "",
      endDay: "",
      startHour: initialStartHour,
      endHour: initialEndHour,
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

  const onSubmit = async (values: FormValues) => {
    try {
      const proposalData: CreateProposalPerDayDTO = {
        completeClientName: values.completeClientName,
        startDay: values.startDay,
        endDay: values.endDay,
        startHour: values.startHour,
        endHour: values.endHour,
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
      
      const { title, message } = handleBackendSuccess(response, "Orçamento criado com sucesso!");
      showSuccessToast({
        title,
        description: message
      });
      
      onBack();
    } catch (error: unknown) {
      const { title, message } = handleBackendError(error, "Erro ao criar orçamento. Tente novamente mais tarde.");
      toast({
        title,
        description: message,
        variant: "destructive",
      });
    }
  };

  return (
    <FormLayout
      title="Novo Orçamento"
      onSubmit={onSubmit}
      onCancel={onBack}
      submitLabel="Criar Orçamento"
      form={form}
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
          name="totalAmountInput"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Valor Total</FormLabel>
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="startHour"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Horário de Check-in</FormLabel>
              <FormControl>
                <Select 
                  value={field.value} 
                  onValueChange={field.onChange}
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
          name="endHour"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Horário de Check-out</FormLabel>
              <FormControl>
                <Select 
                  value={field.value} 
                  onValueChange={field.onChange}
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
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="guestNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Número de Hóspedes</FormLabel>
              <FormControl>
                <Input type="number" placeholder="Ex: 4" {...field} />
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
                <Input type="email" placeholder="email@cliente.com" {...field} />
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

      <FormField
        control={form.control}
        name="description"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Descrição</FormLabel>
            <FormControl>
              <Textarea placeholder="Descreva os detalhes da estadia" {...field} />
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
        name="type"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Tipo do aluguel</FormLabel>
            <FormControl>
              <Select
                value={field.value}
                onValueChange={field.onChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {PROPOSAL_TYPE_OPTIONS.map((type) => (
                    <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                  ))}
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
            {(services || []).map(service => (
              <label key={service.id} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={selectedServiceIds.includes(service.id)}
                  onChange={e => {
                    if (e.target.checked) {
                      setSelectedServiceIds(ids => [...ids, service.id]);
                    } else {
                      setSelectedServiceIds(ids => ids.filter(id => id !== service.id));
                    }
                  }}
                />
                {service.name} <span className="text-xs text-gray-500">(R$ {service.price.toFixed(2)})</span>
              </label>
            ))}
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
              <Select
                value={field.value}
                onValueChange={field.onChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {TRAFFIC_SOURCE_OPTIONS.map((source) => (
                    <SelectItem key={source.value} value={source.value}>{source.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </FormLayout>
  );
} 