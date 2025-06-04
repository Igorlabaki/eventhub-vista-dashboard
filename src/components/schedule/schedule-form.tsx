import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { FormLayout } from "@/components/ui/form-layout";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Schedule } from "@/types/schedule";
import { Textarea } from "@/components/ui/textarea";
import { useProposalStore } from "@/store/proposalStore";

const scheduleFormSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  workerNumber: z.coerce.number().min(1, "Número de trabalhadores é obrigatório"),
  description: z.string().optional(),
  startHour: z.string().min(1, "Horário de início é obrigatório"),
  endHour: z.string().min(1, "Horário de término é obrigatório"),
});

type ScheduleFormValues = z.infer<typeof scheduleFormSchema>;

interface ScheduleFormProps {
  schedule?: Schedule;
  proposalId: string;
  onSubmit: (data: ScheduleFormValues) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
  onCancel: () => void;
}

// Função utilitária para extrair apenas o horário (HH:mm) de uma string ISO
function extractTime(isoString?: string) {
  if (!isoString) return "";
  const match = isoString.match(/T(\d{2}:\d{2})/);
  if (match) return match[1];
  // Se já for só o horário, retorna como está
  return isoString.split(":").slice(0, 2).join(":");
}

export function ScheduleForm({
  schedule,
  proposalId,
  onSubmit,
  onDelete,
  onCancel,
}: ScheduleFormProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);
  const { currentProposal } = useProposalStore();

  // Horários do evento (caso existam)
  function toIsoStringOrString(val: unknown) {
    if (!val) return "";
    if (val instanceof Date) return val.toISOString();
    return String(val);
  }
  const eventStart = extractTime(toIsoStringOrString(currentProposal?.startDate));
  const eventEnd = extractTime(toIsoStringOrString(currentProposal?.endDate));

  // Schema com validações
  const scheduleFormSchema = React.useMemo(() =>
    z.object({
      name: z.string().min(1, "Nome é obrigatório"),
      workerNumber: z.coerce.number().min(1, "Número de trabalhadores é obrigatório"),
      description: z.string().optional(),
      startHour: z.string().min(1, "Horário de início é obrigatório"),
      endHour: z.string().min(1, "Horário de término é obrigatório"),
    })
    .refine((data) => data.startHour < data.endHour, {
      message: "O horário de início deve ser antes do término.",
      path: ["endHour"],
    })
    .refine((data) => {
      if (!eventStart || !eventEnd) return true;
      return data.startHour >= eventStart && data.endHour <= eventEnd;
    }, {
      message: `Os horários devem estar dentro do horário do evento (${eventStart} - ${eventEnd})`,
      path: ["startHour"],
    }),
  [eventStart, eventEnd]);

  const form = useForm<ScheduleFormValues>({
    resolver: zodResolver(scheduleFormSchema),
    defaultValues: {
      name: schedule?.name || "",
      workerNumber: schedule?.workerNumber || 1,
      description: schedule?.description || "",
      startHour: extractTime(schedule?.startHour),
      endHour: extractTime(schedule?.endHour),
    },
  });

  React.useEffect(() => {
    form.reset({
      name: schedule?.name || "",
      workerNumber: schedule?.workerNumber || 1,
      description: schedule?.description || "",
      startHour: extractTime(schedule?.startHour),
      endHour: extractTime(schedule?.endHour),
    });
  }, [schedule]);

  const handleSubmit = async (data: ScheduleFormValues) => {
    try {
      setIsSubmitting(true);
      await onSubmit(data);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!schedule?.id || !onDelete) return;

    try {
      setIsDeleting(true);
      await onDelete(schedule.id);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <FormLayout
      form={form}
      title={schedule ? "Editar Cronograma" : "Novo Cronograma"}
      onSubmit={handleSubmit}
      onCancel={onCancel}
      isSubmitting={isSubmitting}
      isEditing={!!schedule}
      onDelete={schedule?.id && onDelete ? handleDelete : undefined}
      entityName={schedule?.name}
      entityType="cronograma"
      isDeleting={isDeleting}
    >
      <div className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome</FormLabel>
              <FormControl>
                <Input placeholder="Digite o nome do cronograma" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="workerNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Número de Trabalhadores</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min={1}
                  placeholder="Digite o número de trabalhadores"
                  {...field}
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
                <Textarea
                  placeholder="Digite a descrição do cronograma"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="startHour"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Horário de Início</FormLabel>
                <FormControl>
                  <Input type="time" {...field} />
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
                <FormLabel>Horário de Término</FormLabel>
                <FormControl>
                  <Input type="time" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>
    </FormLayout>
  );
} 