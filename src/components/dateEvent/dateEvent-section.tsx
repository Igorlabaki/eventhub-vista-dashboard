import { DateEvent, DateEventType } from "@/types/dateEvent";
import { DateEventList } from "@/components/dateEvent/dateEvent-list";
import { DateEventListSkeleton } from "@/components/dateEvent/dateEvent-list-skeleton";
import { DateEventForm } from "@/components/dateEvent/dateEvent-form";
import { useDateEventStore } from "@/store/dateEventStore";
import { showSuccessToast } from "@/components/ui/success-toast";
import { useToast } from "@/hooks/use-toast";
import { handleBackendSuccess, handleBackendError } from "@/lib/error-handler";
import { AnimatedFormSwitcher } from "@/components/ui/animated-form-switcher";
import { useUser } from "@/hooks/user/queries/byId";
import { CreateDateEventDTO } from "@/types/dateEvent";
import { useEffect } from "react";

interface DateEventSectionProps {
  proposalId: string;
  venueId: string;
  isCreating: boolean;
  selectedDateEvent: DateEvent | null | undefined;
  setSelectedDateEvent: (dateEvent: DateEvent | null | undefined) => void;
  onCreateClick: () => void;
  onCancelCreate: () => void;
}

export function DateEventSection({
  proposalId,
  venueId,
  isCreating,
  selectedDateEvent,
  setSelectedDateEvent,
  onCreateClick,
  onCancelCreate,
}: DateEventSectionProps) {
  const {
    createSameDayEvent,
    createOvernightEvent,
    updateSameDayEvent,
    updateOvernightEvent,
    deleteDateEvent,
    dateEvents,
    isLoading,
    fetchDateEvents,
  } = useDateEventStore();
  const { toast } = useToast();
  const { data: user, isLoading: isUserLoading } = useUser();

  useEffect(() => {
    fetchDateEvents(venueId, proposalId);
  }, [proposalId, venueId, fetchDateEvents]);

  if (!user || isUserLoading) {
    return <DateEventListSkeleton />;
  }

  const handleSubmit = async (data: CreateDateEventDTO) => {
    try {
      let response;
      if (selectedDateEvent) {
        response = selectedDateEvent.type === DateEventType.OVERNIGHT
          ? await updateOvernightEvent(data)
          : await updateSameDayEvent(data);
      } else {
        response = data.data.type === DateEventType.OVERNIGHT
          ? await createOvernightEvent(data)
          : await createSameDayEvent(data);
      }

      const { title, message } = handleBackendSuccess(
        response,
        "Data salva com sucesso!"
      );
      showSuccessToast({ title, description: message });

      await fetchDateEvents(venueId, proposalId);
      setSelectedDateEvent(undefined);
      onCancelCreate();
    } catch (error: unknown) {
      const { title, message } = handleBackendError(
        error,
        "Erro ao salvar data."
      );
      toast({
        title,
        description: message,
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteDateEvent(id);
      await fetchDateEvents(venueId, proposalId);
      setSelectedDateEvent(undefined);
      onCancelCreate();
      showSuccessToast({
        title: "Sucesso",
        description: "Data excluída com sucesso!",
      });
    } catch (error: unknown) {
      const { title, message } = handleBackendError(
        error,
        "Erro ao excluir data. Tente novamente mais tarde."
      );
      toast({
        title,
        description: message,
        variant: "destructive",
      });
    }
  };

  const handleCancel = () => {
    setSelectedDateEvent(undefined);
    onCancelCreate();
  };

  const showForm = isCreating || !!selectedDateEvent;

  return (
    <div className="animate-fade-in">
      {isLoading ? (
        <DateEventListSkeleton />
      ) : (
        <AnimatedFormSwitcher
          showForm={showForm}
          list={
            <DateEventList
              dateEvents={dateEvents}
              onCreateClick={onCreateClick}
              onEditClick={setSelectedDateEvent}
              onDeleteDateEvent={(dateEvent) => handleDelete(dateEvent.id)}
            />
          }
          form={
            <DateEventForm
              dateEvent={selectedDateEvent}
              proposalId={proposalId}
              venueId={venueId}
              userId={user.id}
              username={user.username}
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