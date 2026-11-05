import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useScheduleStore } from "@/store/scheduleStore";
import { CreateScheduleDTO, Schedule } from "@/types/schedule";
import { FiPlus, FiClock, FiUsers } from "react-icons/fi";
import { handleBackendError } from "@/lib/error-handler";
import { useToast } from "@/hooks/use-toast";
import { ConfirmDeleteDialog } from "@/components/ui/confirm-delete-dialog";
import { useProposalStore } from "@/store/proposalStore";
import { PublicVenueListShell } from "@/components/proposal/PublicVenueListShell";
import {
  publicActionClass,
  publicCardClass,
  publicColumnClass,
  publicDividerClass,
  publicEyebrowClass,
  publicLabelClass,
  publicLeadClass,
  publicTitleClass,
  publicValueClass,
} from "@/components/proposal/public-list-pattern";
import { usePublicListVenue } from "@/components/proposal/usePublicListVenue";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { wallClockDateBr, wallClockTime } from "@/lib/wall-clock-datetime";
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
  const proposal = currentProposal?.id === proposalId ? currentProposal : null;
  const { venue, contentReady } = usePublicListVenue(proposal?.venueId, !isInitialLoading);

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
    setScheduleList(
      schedules.map(s => ({
        ...s,
        startHour: extractHour(s.startHour),
        endHour: extractHour(s.endHour),
      }))
    );
  }, [schedules]);

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
  const scheduleLead = savedCount === 0
    ? "A programação ainda está em branco."
    : savedCount === 1
      ? "1 atração na programação."
      : `${savedCount} atrações na programação.`;

  return (
    <>
      <PublicVenueListShell venue={venue} contentReady={contentReady} variant="schedule">
        {(surface) => {
          const fieldClass = (invalid?: boolean) =>
            `${surface.inputClassName}${invalid ? " border-red-500" : ""}`;
          return (
            <div className={publicColumnClass}>
              <section className={publicCardClass} style={surface.cardStyle}>
                <p className={publicEyebrowClass}>Programação</p>
                <h2 className={`${publicTitleClass} mt-2`}>Como a celebração acontece</h2>
                <p className={publicLeadClass}>Organize cada momento, com horário e equipe.</p>
                <form onSubmit={handleSubmit(onSubmit)}>
                  <div className={publicDividerClass} />
                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                    <div>
                      <label className={publicLabelClass} htmlFor="schedule-name">Título</label>
                      <input
                        id="schedule-name"
                        className={fieldClass(Boolean(errors.name))}
                        placeholder="Nome da atração"
                        {...register("name")}
                      />
                      {errors.name && <span className="text-xs text-red-500">{errors.name.message}</span>}
                    </div>
                    <div>
                      <label className={publicLabelClass} htmlFor="schedule-workers">Colaboradores</label>
                      <input
                        id="schedule-workers"
                        className={fieldClass(Boolean(errors.workerNumber))}
                        placeholder="0"
                        type="number"
                        min={0}
                        {...register("workerNumber", { valueAsNumber: true })}
                      />
                      {errors.workerNumber && <span className="text-xs text-red-500">{errors.workerNumber.message}</span>}
                    </div>
                    <div>
                      <label className={publicLabelClass} htmlFor="schedule-start">Início</label>
                      <input
                        id="schedule-start"
                        className={fieldClass(Boolean(errors.startHour))}
                        type="time"
                        min={minHour}
                        max={maxHour}
                        {...register("startHour")}
                      />
                      {errors.startHour && <span className="text-xs text-red-500">{errors.startHour.message}</span>}
                    </div>
                    <div>
                      <label className={publicLabelClass} htmlFor="schedule-end">Fim</label>
                      <input
                        id="schedule-end"
                        className={fieldClass(Boolean(errors.endHour))}
                        type="time"
                        min={minHour}
                        max={maxHour}
                        {...register("endHour")}
                      />
                      {errors.endHour && <span className="text-xs text-red-500">{errors.endHour.message}</span>}
                    </div>
                  </div>
                  <div className="mt-5">
                    <label className={publicLabelClass} htmlFor="schedule-description">Sobre a atração</label>
                    <textarea
                      id="schedule-description"
                      className={surface.inputClassName}
                      placeholder="Como este momento acontece"
                      {...register("description")}
                      rows={3}
                    />
                    {errors.description && <span className="text-xs text-red-500">{errors.description.message}</span>}
                  </div>
                  <div className="mt-5 flex justify-end border-t border-current/15 pt-5">
                    <button className={publicActionClass} type="submit" disabled={loading}>
                      {loading ? "Salvando atração" : (
                        <>
                          <FiPlus size={16} />
                          Adicionar atração
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </section>

              <section className={publicCardClass} style={surface.cardStyle}>
                <h2 className={publicTitleClass}>Atrações do evento</h2>
                <p className={publicLeadClass}>{scheduleLead}</p>
                <div className={publicDividerClass} />
                <label className={publicLabelClass} htmlFor="schedule-search">Buscar</label>
                <input
                  id="schedule-search"
                  className={surface.inputClassName}
                  placeholder="Nome da atração"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                <div className="mt-4 max-h-[400px] overflow-y-auto">
                  {filteredSchedules.length === 0 ? (
                    search.trim() ? <p className={publicLeadClass}>Nenhuma atração com esse nome.</p> : null
                  ) : (
                    filteredSchedules.map((g, i) => {
                      const toClock = (value: string | Date | undefined) => {
                        if (!value) return "";
                        if (typeof value === "string" && /^\d{2}:\d{2}/.test(value)) return value.slice(0, 5);
                        return wallClockTime(value);
                      };
                      const startLabel = toClock(g.startHour);
                      const endLabel = toClock(g.endHour);
                      let duration = "";
                      let dateHourStr = "";
                      if (/^\d{2}:\d{2}$/.test(startLabel) && /^\d{2}:\d{2}$/.test(endLabel)) {
                        const [sh, sm] = startLabel.split(":").map(Number);
                        const [eh, em] = endLabel.split(":").map(Number);
                        let mins = (eh * 60 + em) - (sh * 60 + sm);
                        if (mins < 0) mins += 24 * 60;
                        const h = Math.floor(mins / 60);
                        const m = mins % 60;
                        duration = m === 0 ? `${h}h` : `${h}h${m}min`;
                        const day = currentProposal?.startDate ? wallClockDateBr(currentProposal.startDate) : "";
                        dateHourStr = `${day} ${startLabel} às ${endLabel}`.trim();
                      }
                      const crewLabel = g.workerNumber === 1 ? "1 colaborador" : `${g.workerNumber} colaboradores`;
                      return (
                        <div
                          key={g.id || `${g.name}-${i}`}
                          className="border-t border-current/15 py-4 first:border-t-0"
                        >
                          <div className="flex items-start justify-between gap-4">
                            <p className={publicValueClass}>{g.name}</p>
                            <button
                              className="text-[13px] opacity-60 hover:opacity-100"
                              onClick={() => handleRemoveSchedule(g as Schedule, i)}
                              type="button"
                            >
                              Remover
                            </button>
                          </div>
                          <p className="mt-1 flex items-center gap-2 text-[13px] opacity-70">
                            <FiClock className="h-4 w-4 shrink-0" aria-hidden="true" />
                            {dateHourStr || "Horário inválido"}
                            {duration ? ` · ${duration}` : ""}
                          </p>
                          <p className="mt-1 flex items-center gap-2 text-[13px] opacity-70">
                            <FiUsers className="h-4 w-4 shrink-0" aria-hidden="true" />
                            {crewLabel}
                          </p>
                          {g.description && <p className={publicLeadClass}>{g.description}</p>}
                        </div>
                      );
                    })
                  )}
                </div>
              </section>
            </div>
          );
        }}
      </PublicVenueListShell>
      <ConfirmDeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleConfirmDelete}
        entityName={scheduleToDelete?.name || ""}
        entityType="atração"
        isPending={false}
      />
    </>
  );
}
