import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { FormLayout } from "@/components/ui/form-layout";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { DateEvent, DateEventType } from "@/types/dateEvent";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useVenueStore } from "@/store/venueStore";
import { useProposalStore } from "@/store/proposalStore";

interface DateEventFormProps {
  dateEvent?: DateEvent | null;
  proposalId: string;
  venueId: string;
  userId: string;
  username: string;
  onSubmit: (data: any) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onCancel: () => void;
}

function formatarDataIso(isoString: string) {
  const [datePart, timePart] = isoString.split("T");
  const [year, month, day] = datePart.split("-");
  const hour = timePart.slice(0, 5); // "HH:mm"
  return `${day}/${month}/${year} às ${hour}`;
}


type DateEventFormValues = {
  title: string;
  startDay: string;
  endDay: string;
  startHour: string;
  endHour: string;
  type: DateEventType;
};

// Adiciona a função para gerar opções de horário (hora cheia e meia hora)
function generateTimeOptions() {
  const options = [];
  for (let hour = 0; hour <= 23; hour++) {
    const hourStr = hour.toString().padStart(2, '0');
    options.push(`${hourStr}:00`);
    options.push(`${hourStr}:30`);
  }
  return options;
}

export function DateEventForm({ dateEvent, proposalId, venueId, userId, username, onSubmit, onDelete, onCancel }: DateEventFormProps) {
  const isEditing = !!dateEvent;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { selectedVenue: currentVenue } = useVenueStore();
  const { currentProposal } = useProposalStore();
  const isOvernight = currentVenue?.hasOvernightStay;


  const baseSchema = {
    title: z.string().min(1, "Título é obrigatório"),
    startHour: z.string().min(1, "Hora de início é obrigatória"),
    endHour: z.string().min(1, "Hora de fim é obrigatória"),
    type: z.nativeEnum(DateEventType, {
      required_error: "Tipo de evento é obrigatório",
    }),
  };

  const formSchema = z.object({
    ...baseSchema,
    ...(isOvernight ? {
      startDay: z.string().min(1, "Data de início é obrigatória"),
      endDay: z.string().min(1, "Data de fim é obrigatória"),
    } : {
      startDay: z.string().min(1, "Data é obrigatória"),
    }),
  });

  const form = useForm<DateEventFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: dateEvent?.title || "",
      startDay: dateEvent?.startDate ? dateEvent.startDate.split('T')[0] : "",
      endDay: dateEvent?.endDate ? dateEvent.endDate.split('T')[0] : "",
      startHour: dateEvent?.startDate ? dateEvent.startDate.split('T')[1].slice(0, 5) : "",
      endHour: dateEvent?.endDate ? dateEvent.endDate.split('T')[1].slice(0, 5) : "",
      type: dateEvent?.type ?? undefined,
    },
  });

  React.useEffect(() => {
    form.reset({
      title: dateEvent?.title || "",
      startDay: dateEvent?.startDate ? dateEvent.startDate.split('T')[0] : "",
      endDay: dateEvent?.endDate ? dateEvent.endDate.split('T')[0] : "",
      startHour: dateEvent?.startDate ? dateEvent.startDate.split('T')[1].slice(0, 5) : "",
      endHour: dateEvent?.endDate ? dateEvent.endDate.split('T')[1].slice(0, 5) : "",
      type: dateEvent?.type ?? undefined,
    });
  }, [dateEvent, form]);

  const handleDelete = async () => {
    if (!dateEvent) return;
    setIsDeleting(true);
    try {
      await onDelete(dateEvent.id);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSubmit = async (values: DateEventFormValues) => {
    setIsSubmitting(true);
    try {
      const payload = {
        userId,
        username,
        venueId,
        proposalId,
        ...(isEditing && dateEvent ? { dateEventId: dateEvent.id } : {}),
        data: isOvernight ? {
          title: values.title,
          startDay: values.startDay,
          endDay: values.endDay,
          startHour: values.startHour,
          endHour: values.endHour,
          type: values.type,
        } : {
          title: values.title,
          date: values.startDay,
          startHour: values.startHour,
          endHour: values.endHour,
          type: values.type,
        }
      };

      await onSubmit(payload);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    form.reset();
    onCancel();
  };

  const handleTypeChange = (value: DateEventType) => {
    form.setValue('type', value as DateEventType);
    if (value === DateEventType.EVENT && currentProposal) {
      form.setValue('title', `Evento - ${currentProposal.completeClientName || currentProposal.venue?.name || ''}`);
      if (currentProposal.startDate && currentProposal.endDate) {
        const start = new Date(currentProposal.startDate);
        const end = new Date(currentProposal.endDate);
        const pad = (n: number) => n.toString().padStart(2, '0');
        const startDay = `${start.getFullYear()}-${pad(start.getMonth()+1)}-${pad(start.getDate())}`;
        const endDay = `${end.getFullYear()}-${pad(end.getMonth()+1)}-${pad(end.getDate())}`;
        const startHour = `${pad(start.getHours())}:${pad(start.getMinutes())}`;
        const endHour = `${pad(end.getHours())}:${pad(end.getMinutes())}`;
        if (isOvernight) {
          form.setValue('startDay', startDay);
          form.setValue('endDay', endDay);
        } else {
          form.setValue('startDay', startDay);
        }
        form.setValue('startHour', startHour);
        form.setValue('endHour', endHour);
      }
    }
    else if (value === DateEventType.VISIT && currentProposal) {
      form.setValue('title', `Visita - ${currentProposal.completeClientName || currentProposal.venue?.name || ''}`);
      form.setValue('startDay', '');
      form.setValue('endDay', '');
      form.setValue('startHour', '');
      form.setValue('endHour', '');
    }
  };

  const handleStartHourChange = (value: string) => {
    form.setValue('startHour', value);
    if (form.getValues('type') === DateEventType.VISIT && value) {
      const [h, m] = value.split(':').map(Number);
      let endH = h;
      let endM = m + 30;
      if (endM >= 60) {
        endH += 1;
        endM -= 60;
      }
      const pad = (n: number) => n.toString().padStart(2, '0');
      const endHour = `${pad(endH)}:${pad(endM)}`;
      form.setValue('endHour', endHour);
    }
  };

  return (
    <FormLayout
      form={form}
      title={dateEvent ? 'Editar Data' : 'Nova Data'}
      onSubmit={handleSubmit}
      onCancel={handleCancel}
      isSubmitting={isSubmitting}
      isEditing={!!dateEvent}
      onDelete={handleDelete}
      entityName={`Data ${dateEvent?.title}`}
      entityType="data"
      isDeleting={isDeleting}
    >
      <FormField
        control={form.control}
        name="type"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Tipo de Evento</FormLabel>
            <Select onValueChange={handleTypeChange} defaultValue={field.value} value={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo de evento" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value={DateEventType.EVENT}>Evento</SelectItem>
                <SelectItem value={DateEventType.VISIT}>Visita</SelectItem>
                {isOvernight && <SelectItem value={DateEventType.OVERNIGHT}>Pernoite</SelectItem>}
                <SelectItem value={DateEventType.PRODUCTION}>Produção</SelectItem>
                <SelectItem value={DateEventType.OTHER}>Outro</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="title"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Título</FormLabel>
            <FormControl>
              <Input
                type="text"
                placeholder="Digite o título"
                required
                className="mt-1"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {isOvernight ? (
        <>
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="startDay"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Data de Início</FormLabel>
                  <FormControl>
                    <Input
                      type="date"
                      required
                      className="mt-1"
                      {...field}
                    />
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
                  <FormLabel>Hora de Início</FormLabel>
                  <FormControl>
                    <Select
                      value={field.value}
                      onValueChange={value => {
                        field.onChange(value);
                        handleStartHourChange(value);
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
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="endDay"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Data de Fim</FormLabel>
                  <FormControl>
                    <Input
                      type="date"
                      required
                      className="mt-1"
                      {...field}
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
                  <FormLabel>Hora de Fim</FormLabel>
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
        </>
      ) : (
        <>
          <FormField
            control={form.control}
            name="startDay"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Data</FormLabel>
                <FormControl>
                  <Input
                    type="date"
                    required
                    className="mt-1"
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
                  <FormLabel>Hora de Início</FormLabel>
                  <FormControl>
                    <Select
                      value={field.value}
                      onValueChange={value => {
                        field.onChange(value);
                        handleStartHourChange(value);
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
              name="endHour"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Hora de Fim</FormLabel>
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
        </>
      )}
    </FormLayout>
  );
} 