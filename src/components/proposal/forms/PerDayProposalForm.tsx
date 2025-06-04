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
import { ProposalType, TrafficSource } from "@/types/proposal";
import { PROPOSAL_TYPE_OPTIONS, TRAFFIC_SOURCE_OPTIONS } from "./constants";
import { useEffect, useState } from "react";

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
  trafficSource: z.nativeEnum(TrafficSource)
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

export function PerDayProposalForm({ venueId, onBack }: PerDayProposalFormProps) {
  const navigate = useNavigate();
  const { createProposalPerDay } = useProposalStore();
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      completeClientName: "",
      startDay: "",
      endDay: "",
      startHour: "",
      endHour: "",
      guestNumber: "",
      email: "",
      whatsapp: "",
      description: "",
      knowsVenue: false,
      type: ProposalType.EVENT,
      trafficSource: TrafficSource.OTHER
    }
  });

  const onSubmit = async (values: FormValues) => {
    try {
      await createProposalPerDay({
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
        serviceIds: [] // Você precisará implementar a seleção de serviços
      });
      navigate('/venue/budgets');
    } catch (error) {
      console.error('Erro ao criar proposta:', error);
    }
  };

  return (
    <FormLayout
      title="Novo Orçamento - Diária"
      onSubmit={onSubmit}
      onCancel={onBack}
      submitLabel="Criar Orçamento"
      form={form}
    >
      <FormField
        control={form.control}
        name="completeClientName"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Nome do Cliente</FormLabel>
            <FormControl>
              <Input {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="grid grid-cols-2 gap-4">
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

      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="startHour"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Horário de Check-in</FormLabel>
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
              <FormLabel>Horário de Check-out</FormLabel>
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

      <FormField
        control={form.control}
        name="guestNumber"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Número de Hóspedes</FormLabel>
            <FormControl>
              <Input type="number" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>E-mail</FormLabel>
              <FormControl>
                <Input type="email" {...field} />
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
                <Input
                  {...field}
                  value={field.value}
                  onChange={e => field.onChange(formatWhatsapp(e.target.value))}
                  placeholder="(99) 99999-9999"
                  maxLength={15}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={form.control}
        name="type"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Tipo de Evento</FormLabel>
            <Select
              value={field.value}
              onValueChange={field.onChange}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo de evento" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {PROPOSAL_TYPE_OPTIONS.map(option => (
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
        name="trafficSource"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Fonte de Tráfego</FormLabel>
            <Select
              value={field.value}
              onValueChange={field.onChange}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a fonte de tráfego" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {TRAFFIC_SOURCE_OPTIONS.map(option => (
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
        name="description"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Descrição do Evento</FormLabel>
            <FormControl>
              <Textarea {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="knowsVenue"
        render={({ field }) => (
          <FormItem className="flex items-center space-x-2">
            <FormControl>
              <Switch
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            </FormControl>
            <FormLabel>Já conhece o local?</FormLabel>
            <FormMessage />
          </FormItem>
        )}
      />
    </FormLayout>
  );
} 