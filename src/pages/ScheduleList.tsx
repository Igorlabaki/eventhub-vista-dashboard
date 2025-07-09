import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useScheduleStore } from "@/store/scheduleStore";
import { CreateScheduleDTO, Schedule } from "@/types/schedule";
import { FiPlus, FiTrash2, FiSearch, FiClock, FiUsers } from "react-icons/fi";
import { handleBackendError } from "@/lib/error-handler";
import { useToast } from "@/hooks/use-toast";
import { ConfirmDeleteDialog } from "@/components/ui/confirm-delete-dialog";
import { Calendar } from "lucide-react";
import { AppLoadingScreen } from "@/components/ui/AppLoadingScreen";
import { useProposalStore } from "@/store/proposalStore";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format, differenceInMinutes } from "date-fns";
import { ProposalFooter } from "@/components/proposalFooter";
import { useVenueStore } from "@/store/venueStore";

const getHourString = (date?: Date) => date ? new Date(date).toISOString().substring(11, 16) : undefined;

// Função utilitária para extrair hora de uma string de data ou hora
function extractHour(dateString: string) {
  if (!dateString) return "";
  // Se já está no formato HH:mm
  if (/^\d{2}:\d{2}$/.test(dateString)) return dateString;
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return "";
  return d.toISOString().substring(11, 16);
}

export function ScheduleListPage() {
  const { id: proposalId } = useParams();
  const [name, setName] = useState("");
  const [workerNumber, setWorkerNumber] = useState(0);
  const [startHour, setStartHour] = useState("");
  const [endHour, setEndHour] = useState("");
  const [description, setDescription] = useState("");
  const schedules = useScheduleStore((s) => s.schedules);
  const [scheduleList, setScheduleList] = useState<(CreateScheduleDTO & { id?: string })[]>(schedules);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [scheduleToDelete, setScheduleToDelete] = useState<Schedule | null>(null);
  const fetchSchedules = useScheduleStore((s) => s.fetchSchedules);
  const createSchedule = useScheduleStore((s) => s.createSchedule);
  const deleteSchedule = useScheduleStore((s) => s.deleteSchedule);
  const { toast } = useToast();
  const fetchProposalById = useProposalStore((s) => s.fetchProposalById);
  const currentProposal = useProposalStore((s) => s.currentProposal);

  // Venue
  const { selectedVenue, fetchVenueById } = useVenueStore();
  const [venueLoading, setVenueLoading] = useState(false);

  // Definir limites de horário
  const minHour = getHourString(currentProposal?.startDate);
  const maxHour = getHourString(currentProposal?.endDate);

  // Esquema de validação Zod
  const scheduleSchema = z.object({
    name: z.string().min(1, "Título obrigatório"),
    workerNumber: z.number().min(0, "Mínimo 0"),
    startHour: z.string().min(1, "Horário obrigatório").refine(
      (val) => !minHour || val >= minHour,
      { message: minHour ? `Não pode ser antes de ${minHour}` : "" }
    ).refine(
      (val) => !maxHour || val <= maxHour,
      { message: maxHour ? `Não pode ser depois de ${maxHour}` : "" }
    ),
    endHour: z.string().min(1, "Horário obrigatório").refine(
      (val) => !minHour || val >= minHour,
      { message: minHour ? `Não pode ser antes de ${minHour}` : "" }
    ).refine(
      (val) => !maxHour || val <= maxHour,
      { message: maxHour ? `Não pode ser depois de ${maxHour}` : "" }
    ),
    description: z.string().optional(),
  }).refine((data) => {
    // Validação: fim deve ser maior que início
    if (!/^\d{2}:\d{2}$/.test(data.startHour) || !/^\d{2}:\d{2}$/.test(data.endHour)) return true;
    const [sh, sm] = data.startHour.split(":").map(Number);
    const [eh, em] = data.endHour.split(":").map(Number);
    return eh > sh || (eh === sh && em > sm);
  }, {
    message: "Horário de fim deve ser maior que o início",
    path: ["endHour"],
  });

  type ScheduleFormType = z.infer<typeof scheduleSchema>;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ScheduleFormType>({
    resolver: zodResolver(scheduleSchema),
    defaultValues: {
      name: "",
      workerNumber: 0,
      startHour: "",
      endHour: "",
      description: "",
    },
  });

  useEffect(() => {
    if (proposalId) {
      setIsInitialLoading(true);
      Promise.all([
        fetchSchedules(proposalId),
        fetchProposalById(proposalId)
      ]).then(() => {
        setIsInitialLoading(false);
      });
    }
    // eslint-disable-next-line
  }, [proposalId]);

  useEffect(() => {
    if (currentProposal?.venueId) {
      setVenueLoading(true);
      fetchVenueById(currentProposal.venueId).finally(() => setVenueLoading(false));
    }
  }, [currentProposal?.venueId, fetchVenueById]);

  useEffect(() => {
    setScheduleList(
      schedules.map(s => ({
        ...s,
        startHour: extractHour(s.startHour),
        endHour: extractHour(s.endHour),
      }))
    );
  }, [schedules]);

  if (isInitialLoading || venueLoading) {
    return <AppLoadingScreen />;
  }

  const onSubmit = async (data: ScheduleFormType) => {
    setLoading(true);
    try {
      const response = await createSchedule({
        name: data.name,
        workerNumber: data.workerNumber,
        startHour: data.startHour,
        endHour: data.endHour,
        description: data.description,
        proposalId: proposalId || "",
      });
      await fetchSchedules(proposalId!);
      toast({
        title: "Atração adicionada",
        description: `A atração "${response.name}" foi salva com sucesso!`,
      });
      reset();
    } catch (error: unknown) {
      const { title, message } = handleBackendError(
        error,
        "Erro ao salvar atração. Tente novamente mais tarde."
      );
      toast({
        title,
        description: message,
        variant: "destructive",
      });
    }
    setLoading(false);
  };

  const handleRemoveSchedule = (schedule: Schedule, idx: number) => {
    if (schedule.id) {
      setScheduleToDelete(schedule);
      setDeleteDialogOpen(true);
    } else {
      setScheduleList((prev) => prev.filter((_, i) => i !== idx));
    }
  };

  const handleConfirmDelete = async () => {
    if (!scheduleToDelete) return;
    try {
      await deleteSchedule(scheduleToDelete.id);
      setScheduleList((prev) => prev.filter((g) => g.id !== scheduleToDelete.id));
      toast({
        title: "Atração removida",
        description: `A atração "${scheduleToDelete.name}" foi removida com sucesso.`,
      });
    } catch (error: unknown) {
      const { title, message } = handleBackendError(
        error,
        "Erro ao remover atração."
      );
      toast({
        title,
        description: message,
        variant: "destructive",
      });
    }
    setDeleteDialogOpen(false);
    setScheduleToDelete(null);
  };

  const filteredSchedules = scheduleList.filter(
    (g) =>
      g.name.toLowerCase().includes(search.toLowerCase()) ||
      (g.description && g.description.toLowerCase().includes(search.toLowerCase()))
  );

  const savedCount = scheduleList.filter((g) => g.id).length;

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex flex-1 flex-col bg-eventhub-background py-14 px-2 md:px-8">
        <div className="flex items-center w-full justify-center mb-10">
          <Calendar className="h-8 w-8 text-eventhub-primary" />
          <span className="ml-2 font-bold text-3xl text-eventhub-primary">
            EventHub
          </span>
        </div>
        <div className="max-w-6xl w-full md:mx-auto">
          {/* Card de adicionar atração */}
          <div className="bg-white rounded-xl shadow py-8 px-4 mb-8">
            <h2 className="text-2xl font-bold text-center mb-6 text-eventhub-primary">
              Adicionar Atração
            </h2>
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="flex flex-col gap-4 md:flex-row md:items-end">
                <div className="flex-1">
                  <label className="block text-gray-600 font-semibold mb-1">Título</label>
                  <input
                    className={`w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:to-eventhub-primary ${errors.name ? 'border-red-500' : ''}`}
                    placeholder="Título"
                    {...register("name")}
                  />
                  {errors.name && <span className="text-red-500 text-xs">{errors.name.message}</span>}
                </div>
                <div className="flex-1">
                  <label className="block text-gray-600 font-semibold mb-1">
                    Número de colaboradores
                  </label>
                  <input
                    className={`w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:to-eventhub-primary ${errors.workerNumber ? 'border-red-500' : ''}`}
                    placeholder="0"
                    type="number"
                    min={0}
                    {...register("workerNumber", { valueAsNumber: true })}
                  />
                  {errors.workerNumber && <span className="text-red-500 text-xs">{errors.workerNumber.message}</span>}
                </div>
                <div className="flex-1">
                  <label className="block text-gray-600 font-semibold mb-1">Horário de início</label>
                  <input
                    className={`w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:to-eventhub-primary ${errors.startHour ? 'border-red-500' : ''}`}
                    type="time"
                    min={minHour}
                    max={maxHour}
                    {...register("startHour")}
                  />
                  {errors.startHour && <span className="text-red-500 text-xs">{errors.startHour.message}</span>}
                </div>
                <div className="flex-1">
                  <label className="block text-gray-600 font-semibold mb-1">Horário fim</label>
                  <input
                    className={`w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:to-eventhub-primary ${errors.endHour ? 'border-red-500' : ''}`}
                    type="time"
                    min={minHour}
                    max={maxHour}
                    {...register("endHour")}
                  />
                  {errors.endHour && <span className="text-red-500 text-xs">{errors.endHour.message}</span>}
                </div>
                <button
                  className={`bg-eventhub-primary text-white rounded-full p-3 mt-4 md:mt-0 flex items-center justify-center hover:bg-eventhub-secondary transition ${loading ? 'opacity-60 cursor-not-allowed' : ''}`}
                  type="submit"
                  title="Adicionar atração"
                  disabled={loading}
                >
                  {loading ? (
                    <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                    </svg>
                  ) : (
                    <FiPlus size={24} />
                  )}
                </button>
              </div>
              <div className="mt-4">
                <label className="block text-gray-600 font-semibold mb-1">
                  Descrição sobre o evento
                </label>
                <textarea
                  className="w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:to-eventhub-primary"
                  placeholder="Descreva a atração..."
                  {...register("description")}
                  rows={3}
                />
                {errors.description && <span className="text-red-500 text-xs">{errors.description.message}</span>}
              </div>
            </form>
          </div>

          {/* Card da lista de atrações */}
          <div className="bg-white rounded-xl shadow p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-4 text-center">
              <span className="text-lg font-bold text-center mb-6 text-eventhub-primary">
                Lista de Atrações: {savedCount}
              </span>
            </div>
            {/* Barra de pesquisa com ícone dentro */}
            <div className="mb-4 relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                <FiSearch size={20} />
              </span>
              <input
                className="w-full border border-gray-300 rounded px-10 py-2 focus:outline-none focus:ring-2 focus:to-eventhub-primary"
                placeholder="Buscar atração..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {filteredSchedules.length === 0 ? (
                <div className="text-gray-400 text-center py-8">
                  Nenhuma atração adicionada.
                </div>
              ) : (
                filteredSchedules.map((g, i) => {
                  // Função para combinar data e hora em um Date
                  const combineDateAndTime = (date: Date | string | undefined, time: string) => {
                    if (!date || !time || !/^\d{2}:\d{2}$/.test(time)) return null;
                    const d = typeof date === "string" ? new Date(date) : date;
                    if (isNaN(d.getTime())) return null;
                    const [h, m] = time.split(":").map(Number);
                    if (isNaN(h) || isNaN(m)) return null;
                    const result = new Date(d);
                    result.setHours(h, m, 0, 0);
                    return result;
                  };
                  const startDateTime = combineDateAndTime(currentProposal?.startDate, g.startHour);
                  const endDateTime = combineDateAndTime(currentProposal?.startDate, g.endHour);
                  // Calcular duração
                  let duration = "";
                  if (startDateTime && endDateTime) {
                    let mins = differenceInMinutes(endDateTime, startDateTime);
                    if (mins < 0) mins += 24 * 60;
                    const h = Math.floor(mins / 60);
                    const m = mins % 60;
                    duration = m === 0 ? `${h}h` : `${h}h${m}min`;
                  }
                  // Formatar data e hora
                  let dateHourStr = "";
                  if (startDateTime && endDateTime) {
                    dateHourStr = `${format(startDateTime, "dd/MM/yyyy HH:mm")} - ${format(endDateTime, "HH:mm")}`;
                  }
                  return (
                    <div
                      key={i}
                      className="bg-gray-100 rounded-xl shadow-sm px-6 py-4 flex flex-col relative items-center mb-4"
                    >
                      <button
                        className="absolute top-3 right-3 text-gray-500 hover:text-red-600 transition"
                        onClick={() => handleRemoveSchedule(g as Schedule, i)}
                        title="Remover"
                      >
                        <FiTrash2 size={20} />
                      </button>
                      <div className="text-center font-bold text-lg mb-2 w-full">{g.name}</div>
                      <div className="flex items-center justify-center gap-2 mb-1 w-full">
                        <FiClock className="mr-1" />
                        <span className="text-sm">{dateHourStr || "Horário inválido"}</span>
                        {duration && <span className="text-xs text-gray-500 ml-2">({duration})</span>}
                      </div>
                      <div className="flex items-center justify-center gap-2 mb-1 w-full">
                        <FiUsers className="mr-1" />
                        <span className="text-sm">({g.workerNumber})</span>
                      </div>
                      {g.description && (
                        <div className="text-center text-gray-700 text-sm mt-1 w-full">{g.description}</div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </main>
      <ProposalFooter selectedVenue={selectedVenue} />
      {/* Dialog de confirmação de exclusão */}
      <ConfirmDeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleConfirmDelete}
        entityName={scheduleToDelete?.name || ""}
        entityType="atração"
        isPending={false}
      />
    </div>
  );
}
