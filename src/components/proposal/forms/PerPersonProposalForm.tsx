import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
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
import { ProposalType, TrafficSource } from "@/types/proposal";
import { PROPOSAL_TYPE_OPTIONS, TRAFFIC_SOURCE_OPTIONS } from "./constants";
import { useServiceStore } from "@/store/serviceStore";
import { useEffect, useState } from "react";
import { NumericFormat } from 'react-number-format';
import InputMask from 'react-input-mask';
import { CreateProposalPerPersonDTO } from "@/types/proposal";
import { useToast } from "@/hooks/use-toast";
import { handleBackendError, handleBackendSuccess } from "@/lib/error-handler";
import { showSuccessToast } from "@/components/ui/success-toast";

const formSchema = z.object({
  completeClientName: z.string().min(1, "Nome do cliente é obrigatório"),
  completeCompanyName: z.string().optional(),
  date: z.string().min(1, "Data do evento é obrigatória"),
  startHour: z.string().min(1, "Horário de início é obrigatório"),
  endHour: z.string().min(1, "Horário de término é obrigatório"),
  guestNumber: z.string().min(1, "Número de convidados é obrigatório"),
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

interface PerPersonProposalFormProps {
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

export function PerPersonProposalForm({
  venueId,
  onBack,
}: PerPersonProposalFormProps) {
  const navigate = useNavigate();
  const { createProposalPerPerson } = useProposalStore();
  const { services, fetchServices, isLoading: isLoadingServices } = useServiceStore();
  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    if (venueId) fetchServices(venueId);
  }, [venueId, fetchServices]);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      completeClientName: "",
      completeCompanyName: "",
      date: "",
      startHour: "",
      endHour: "",
      guestNumber: "",
      email: "",
      whatsapp: "",
      description: "",
      knowsVenue: false,
      type: ProposalType.EVENT,
      trafficSource: TrafficSource.OTHER,
      totalAmountInput: "",
    },
  });

  const onSubmit = async (values: FormValues) => {
    try {
      const proposalData: CreateProposalPerPersonDTO = {
        date: values.date,
        completeClientName: values.completeClientName,
        venueId,
        endHour: values.endHour,
        whatsapp: values.whatsapp,
        startHour: values.startHour,
        guestNumber: values.guestNumber,
        description: values.description,
        knowsVenue: values.knowsVenue,
        email: values.email,
        serviceIds: selectedServiceIds,
        totalAmountInput: values.totalAmountInput,
        type: values.type,
        trafficSource: values.trafficSource,
      };
      
      const response = await createProposalPerPerson(proposalData);
      
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
          name="completeCompanyName"
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
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

        <FormField
          control={form.control}
          name="whatsapp"
          render={({ field }) => (
            <FormItem>
              <FormLabel>WhatsApp</FormLabel>
              <FormControl>
                <InputMask
                  mask="(99) 99999-9999"
                  placeholder="(00) 00000-0000"
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <FormField
          control={form.control}
          name="date"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Data do evento</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="startHour"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Horário Início</FormLabel>
              <FormControl>
                <Input
                  type="time"
                  min="07:00"
                  max="22:00"
                  {...field}
                  value={field.value}
                  onChange={e => field.onChange(clampHour(e.target.value))}
                />
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
              <FormLabel>Horário Fim</FormLabel>
              <FormControl>
                <Input
                  type="time"
                  min="07:00"
                  max="22:00"
                  {...field}
                  value={field.value}
                  onChange={e => field.onChange(clampHour(e.target.value))}
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
          name="guestNumber"
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
          name="totalAmountInput"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Total</FormLabel>
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

      <FormField
        control={form.control}
        name="description"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Descrição</FormLabel>
            <FormControl>
              <Textarea placeholder="Descreva os detalhes do evento" {...field} />
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
