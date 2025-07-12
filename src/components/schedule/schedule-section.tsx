import { Schedule } from "@/types/schedule";
import { ScheduleList } from "./schedule-list";
import { ScheduleListSkeleton } from "@/components/schedule/schedule-list-skeleton";
import { ScheduleForm } from "./schedule-form";
import { useScheduleStore } from "@/store/scheduleStore";
import { showSuccessToast } from "@/components/ui/success-toast";
import { useToast } from "@/hooks/use-toast";
import { handleBackendSuccess, handleBackendError } from "@/lib/error-handler";
import { AnimatedFormSwitcher } from "@/components/ui/animated-form-switcher";
import { useEffect } from "react";
import { useUserPermissionStore } from "@/store/userPermissionStore";
import { DashboardLayout } from "../DashboardLayout";
import AccessDenied from "../accessDenied";

interface ScheduleSectionProps {
  proposalId: string;
  isCreating: boolean;
  selectedSchedule: Schedule | null | undefined;
  setSelectedSchedule: (schedule: Schedule | null | undefined) => void;
  onCreateClick: () => void;
  onCancelCreate: () => void;
}

export function ScheduleSection({
  proposalId,
  isCreating,
  selectedSchedule,
  setSelectedSchedule,
  onCreateClick,
  onCancelCreate,
}: ScheduleSectionProps) {
  const { createSchedule, updateSchedule, deleteSchedule, schedules, isLoading, fetchSchedules } = useScheduleStore();
  const { toast } = useToast();

  useEffect(() => {
    fetchSchedules(proposalId);
  }, [proposalId, fetchSchedules]);

  const handleSubmit = async (data: {
    name: string;
    workerNumber: number;
    description?: string;
    startHour: string;
    endHour: string;
  }) => {
    try {
      let response;
      if (selectedSchedule) {
        response = await updateSchedule(selectedSchedule.id, data);
        const { title, message } = handleBackendSuccess(response, "Cronograma atualizado com sucesso!");
        showSuccessToast({
          title,
          description: message
        });
      } else {
        response = await createSchedule({
          ...data,
          proposalId,
        });
        const { title, message } = handleBackendSuccess(response, "Cronograma criado com sucesso!");
        showSuccessToast({
          title,
          description: message
        });
      }
      setSelectedSchedule(undefined);
      onCancelCreate();
    } catch (error: unknown) {
      const { title, message } = handleBackendError(error, "Erro ao salvar cronograma. Tente novamente mais tarde.");
      toast({
        title,
        description: message,
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteSchedule(id);
      setSelectedSchedule(undefined);
      onCancelCreate();
      showSuccessToast({
        title: "Sucesso",
        description: "Cronograma excluído com sucesso!",
      });
    } catch (error: unknown) {
      const { title, message } = handleBackendError(error, "Erro ao excluir cronograma. Tente novamente mais tarde.");
      toast({
        title,
        description: message,
        variant: "destructive",
      });
    }
  };

  const handleCancel = () => {
    setSelectedSchedule(undefined);
    onCancelCreate();
  };

  const showForm = isCreating || !!selectedSchedule;


  return (
    <div className="animate-fade-in">
      {isLoading ? (
        <ScheduleListSkeleton />
      ) : (
        <AnimatedFormSwitcher
          showForm={showForm}
          list={
            <ScheduleList
              schedules={schedules}
              onCreateClick={onCreateClick}
              onEditClick={setSelectedSchedule}
              onDeleteSchedule={(schedule) => handleDelete(schedule.id)}
            />
          }
          form={
            <ScheduleForm
              schedule={selectedSchedule}
              proposalId={proposalId}
              onSubmit={handleSubmit}
              onDelete={handleDelete}
              onCancel={handleCancel}
            />
          }
        />
      )}
    </div>
  );
} 