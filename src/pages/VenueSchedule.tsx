import { useState, useEffect, useMemo } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Users, CalendarDays, Clock, Trash, Pencil } from "lucide-react";
import { useDateEventStore } from "@/store/dateEventStore";
import { DateEvent, DateEventType } from "@/types/dateEvent";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import { format } from "date-fns";
import { parse } from "date-fns";
import { startOfWeek } from "date-fns";
import { getDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "@/styles/fullcalendar-google.css"; // Pode ser usado para customização extra
import { formatInTimeZone } from "date-fns-tz";
import { AnimatedFormSwitcher } from "@/components/ui/animated-form-switcher";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormLayout } from "@/components/ui/form-layout";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  Form,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";
import { handleBackendError, handleBackendSuccess } from "@/lib/error-handler";
import { showSuccessToast } from "@/components/ui/success-toast";
import { useVenueStore } from "@/store/venueStore";
import { useUserStore } from "@/store/userStore";
import { ConfirmDeleteDialog } from "@/components/ui/confirm-delete-dialog";
import { useNavigate } from "react-router-dom";
import { useUserVenuePermissionStore } from "@/store/userVenuePermissionStore";
import AccessDenied from "@/components/accessDenied";
import { PageHeader } from "@/components/PageHeader";
import { createPortal } from "react-dom";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const locales = {
  "pt-BR": ptBR,
};
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 0 }),
  getDay,
  locales,
});

const eventColors = {
  [DateEventType.EVENT]: "#2563eb",
  [DateEventType.VISIT]: "#22c55e",
  [DateEventType.OTHER]: "#ef4444",
};

const eventFormSchema = z
  .object({
    title: z.string().min(1, "Título obrigatório"),
    startDay: z.string().min(1, "Data inicial obrigatória"),
    startHour: z.string().min(1, "Hora inicial obrigatória"),
    endDay: z.string().min(1, "Data final obrigatória"),
    endHour: z.string().min(1, "Hora final obrigatória"),
    venueId: z.string(),
    proposalId: z.string().optional(),
    userId: z.string(),
    username: z.string(),
  })
  .refine((data) => new Date(data.startDay) <= new Date(data.endDay), {
    message: "A data final deve ser igual ou posterior à data inicial",
    path: ["endDay"],
  });
type EventFormValues = z.infer<typeof eventFormSchema>;

// Adicionar função utilitária para gerar horários de meia em meia hora
function generateTimeOptions() {
  const options = [];
  for (let hour = 0; hour <= 23; hour++) {
    const hourStr = hour.toString().padStart(2, "0");
    options.push(`${hourStr}:00`);
    options.push(`${hourStr}:30`);
  }
  return options;
}

export default function VenueSchedule() {
  const {
    dateEvents,
    fetchDateEvents,
    isLoading,
    createOvernightEvent,
    updateOvernightEvent,
    deleteDateEvent,
  } = useDateEventStore();
  const [selectedEvent, setSelectedEvent] = useState<DateEvent | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const { selectedVenue } = useVenueStore();
  const { user } = useUserStore();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { currentUserVenuePermission } = useUserVenuePermissionStore();

  const navigate = useNavigate();

  const form = useForm<EventFormValues>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: {
      title: "",
      startDay: "",
      startHour: "",
      endDay: "",
      endHour: "",
      userId: user?.id,
      username: user?.username,
      venueId: selectedVenue.id,
    },
  });

  // Função para preencher o formulário com dados da data selecionada
  const fillFormWithEventData = (event: DateEvent) => {
    const startDate = new Date(event.startDate);
    const endDate = new Date(event.endDate);

    form.reset({
      title: event.title,
      startDay: startDate.toISOString().split("T")[0],
      endDay: endDate.toISOString().split("T")[0],
      startHour: startDate.toTimeString().slice(0, 5),
      endHour: endDate.toTimeString().slice(0, 5),
      userId: user?.id,
      username: user?.username,
      venueId: selectedVenue.id,
      proposalId: event.proposalId,
    });
  };

  const events = useMemo(
    () =>
      dateEvents.map((event) => ({
        id: event.id,
        title: event.title,
        start: new Date(event.startDate),
        end: new Date(event.endDate),
        allDay: false,
        resource: event,
      })),
    [dateEvents]
  );

  useEffect(() => {
    fetchDateEvents();
  }, []);

  const hasEditPermission = () => {
    if (!currentUserVenuePermission?.permissions) return false;
    return currentUserVenuePermission.permissions.includes(
      "EDIT_VENUE_CALENDAR"
    );
  };

  // Formulário de criação de evento

  async function onSubmit(data: EventFormValues) {
    try {
      let response;

      if (isEditing && selectedEvent) {
        response = await updateOvernightEvent({
          userId: data.userId,
          username: data.username,
          venueId: data.venueId,
          proposalId: data.proposalId || undefined,
          data: {
            title: data.title,
            startDay: data.startDay,
            endDay: data.endDay,
            startHour: data.startHour,
            endHour: data.endHour,
            type: DateEventType.OTHER,
          },
        });
      } else {
        response = await createOvernightEvent({
          userId: data.userId,
          username: data.username,
          venueId: data.venueId,
          proposalId: data.proposalId || undefined,
          data: {
            title: data.title,
            startDay: data.startDay,
            endDay: data.endDay,
            startHour: data.startHour,
            endHour: data.endHour,
            type: DateEventType.OTHER,
          },
        });
      }

      const { title, message } = handleBackendSuccess(
        response,
        isEditing ? "Data atualizada com sucesso!" : "Data criada com sucesso!"
      );
      showSuccessToast({ title, description: message });
      await fetchDateEvents();
      setShowForm(false);
      setIsEditing(false);
      setSelectedEvent(null);
      form.reset({
        title: "",
        startDay: "",
        startHour: "",
        endDay: "",
        endHour: "",
        userId: user?.id,
        username: user?.username,
        venueId: selectedVenue.id,
      });
    } catch (error: unknown) {
      const { title, message } = handleBackendError(
        error,
        isEditing
          ? "Erro ao atualizar data. Tente novamente mais tarde."
          : "Erro ao criar data. Tente novamente mais tarde."
      );
      toast({ title, description: message, variant: "destructive" });
    }
  }

  function eventStyleGetter(event) {
    const color = eventColors[event.resource.type] || "#6b7280";
    return {
      style: {
        backgroundColor: color,
        borderRadius: "8px",
        color: "#fff",
        border: "none",
        display: "block",
        fontWeight: 500,
        fontSize: "0.95rem",
        boxShadow: "0 1px 4px 0 rgba(60,64,67,.10)",
      },
    };
  }

  // Formulário de criação/edição de evento
  const eventForm = (
    <FormLayout
      title={isEditing ? "Editar Data" : "Nova Data"}
      onSubmit={onSubmit}
      onCancel={() => {
        setShowForm(false);
        setIsEditing(false);
        setSelectedEvent(null);
        form.reset({
          title: "",
          startDay: "",
          startHour: "",
          endDay: "",
          endHour: "",
          userId: user?.id,
          username: user?.username,
          venueId: selectedVenue.id,
        });
      }}
      onDelete={
        !selectedEvent?.proposalId
          ? async () => {
              setIsDeleting(true);
              try {
                await deleteDateEvent(selectedEvent.id);
                const { title, message } = handleBackendSuccess(
                  {
                    success: true,
                    message: "Data excluída com sucesso",
                    data: undefined,
                  },
                  "Data excluída com sucesso!"
                );
                showSuccessToast({ title, description: message });
                await fetchDateEvents();
                setSelectedEvent(null);
                setShowForm(false);
                setIsEditing(false);
                form.reset({
                  title: "",
                  startDay: "",
                  startHour: "",
                  endDay: "",
                  endHour: "",
                  userId: user?.id,
                  username: user?.username,
                  venueId: selectedVenue.id,
                });
              } catch (error: unknown) {
                const { title, message } = handleBackendError(
                  error,
                  "Erro ao excluir data. Tente novamente mais tarde."
                );
                toast({ title, description: message, variant: "destructive" });
              } finally {
                setIsDeleting(false);
              }
            }
          : undefined
      }
      isEditing={isEditing}
      isDeleting={isDeleting}
      isSubmitting={form.formState.isSubmitting}
      entityName={selectedEvent?.title}
      entityType="data"
      form={form}
    >
      <div className="space-y-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Título</FormLabel>
              <FormControl>
                <Input placeholder="Título" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex flex-col md:flex-row gap-2">
          <FormField
            control={form.control}
            name="startDay"
            render={({ field }) => (
              <FormItem className="w-full md:w-1/2">
                <FormLabel>Data Inicial</FormLabel>
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
              <FormItem className="w-full md:w-1/2">
                <FormLabel>Hora Inicial</FormLabel>
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
        <div className="flex flex-col md:flex-row gap-2">
          <FormField
            control={form.control}
            name="endDay"
            render={({ field }) => (
              <FormItem className="w-full md:w-1/2">
                <FormLabel>Data Final</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="endHour"
            render={({ field }) => (
              <FormItem className="w-full md:w-1/2">
                <FormLabel>Hora Final</FormLabel>
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
      </div>
    </FormLayout>
  );

  // Calendário + detalhes
  const calendar = (
    <div className="relative">
      {hasEditPermission() && (
        <PageHeader
          onCreateClick={() => setShowForm(true)}
          createButtonText="Nova Data"
          isFormOpen={showForm}
        />
      )}
      <Card className="shadow-lg border-0">
        <CardContent className="p-4">
          <Calendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            style={{ height: 600 }}
            messages={{
              next: "Próximo",
              previous: "Anterior",
              today: "Hoje",
              month: "Mês",
              week: "Semana",
              day: "Dia",
              agenda: "Agenda",
              date: "Data",
              time: "Hora",
              event: "Evento",
              noEventsInRange: "Nenhum evento neste período.",
            }}
            views={["month"]}
            onSelectEvent={(event) => setSelectedEvent(event.resource)}
            onSelectSlot={() => setSelectedEvent(null)}
            eventPropGetter={eventStyleGetter}
            popup
            toolbar={true}
            selectable={false}
            components={{
              toolbar: (props) => (
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <button
                      onClick={() => props.onNavigate("PREV")}
                      className="px-2 py-1 rounded hover:bg-gray-100 mr-2"
                    >
                      &#8592;
                    </button>
                    <button
                      onClick={() => props.onNavigate("NEXT")}
                      className="px-2 py-1 rounded hover:bg-gray-100"
                    >
                      &#8594;
                    </button>
                  </div>
                  <div className="text-lg font-bold uppercase tracking-wide">
                    {format(props.label, "MMMM yyyy", { locale: ptBR })}
                  </div>
                  <div></div>
                </div>
              ),
            }}
          />
        </CardContent>
      </Card>
      {/* Detalhes do evento selecionado */}
      {selectedEvent && (
        <div
          className="mt-6 flex flex-col items-center"
          onClick={() => {
            if (selectedEvent.proposalId) {
              navigate(`/proposal/${selectedEvent.proposalId}`);
            }
          }}
        >
          <Card className="w-full bg-white border-0 shadow-lg">
            <CardContent className="p-6 flex flex-col items-center gap-4 relative">
              <div className="flex items-center gap-2 mb-2 ">
                <div className="text-lg font-bold">{selectedEvent.title}</div>
                {!selectedEvent.proposalId && (
                  <button
                    type="button"
                    className="absolute top-3 right-3 ml-2 text-gray-400 hover:bg-gray-100 hover:text-blue-700 z-50 h-8 w-8 rounded-full flex items-center justify-center"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsEditing(true);
                      fillFormWithEventData(selectedEvent);
                      setShowForm(true);
                    }}
                    title="Editar data"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                )}
              </div>
              <div className="flex gap-8 text-sm mb-2">
                <div className="flex items-center gap-2  font-medium">
                  <Users className="w-5 h-5" />
                  {selectedEvent.proposal?.guestNumber || "--"}
                </div>
                <div className="flex items-center gap-2  font-medium">
                  <CalendarDays className="w-5 h-5" />
                  {selectedEvent.startDate
                    ? formatInTimeZone(
                        selectedEvent.startDate,
                        "UTC",
                        "dd/MM/yyyy"
                      )
                    : "--"}
                </div>
                <div className="flex items-center gap-2  font-medium">
                  <Clock className="w-5 h-5" />
                  {selectedEvent.startDate && selectedEvent.endDate ? (
                    <>
                      {formatInTimeZone(
                        selectedEvent.startDate,
                        "UTC",
                        "HH:mm"
                      )}
                      /{formatInTimeZone(selectedEvent.endDate, "UTC", "HH:mm")}
                    </>
                  ) : (
                    "--"
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );

  return (
    <DashboardLayout title="Agenda" subtitle="Visualize e gerencie sua agenda">
      <AnimatedFormSwitcher
        showForm={showForm}
        list={calendar}
        form={eventForm}
      />
    </DashboardLayout>
  );
}
