import { Clause } from "@/types/clause";
import { ClauseList } from "./clause-list";
import { ClauseListSkeleton } from "./clause-list-skeleton";
import { ClauseForm } from "./clause-form";
import { useClauseStore } from "@/store/clauseStore";
import { showSuccessToast } from "@/components/ui/success-toast";
import { useToast } from "@/hooks/use-toast";
import { handleBackendSuccess, handleBackendError } from "@/lib/error-handler";
import { AnimatedFormSwitcher } from "@/components/ui/animated-form-switcher";

interface ClauseSectionProps {
  clauses: Clause[];
  organizationId: string;
  isLoading: boolean;
  isCreating: boolean;
  selectedClause: Clause | null | undefined;
  setSelectedClause: (clause: Clause | null | undefined) => void;
  onCreateClick: () => void;
  onCancelCreate: () => void;
}

export function ClauseSection({
  clauses,
  organizationId,
  isLoading,
  isCreating,
  selectedClause,
  setSelectedClause,
  onCreateClick,
  onCancelCreate,
}: ClauseSectionProps) {
  const { createClause, updateClause } = useClauseStore();
  const { toast } = useToast();

  const handleSubmit = async (data: { title: string; text: string }) => {
    try {
      let response;
      if (selectedClause) {
        response = await updateClause({
          clauseId: selectedClause.id,
          previousTitle: selectedClause.title,
          data: {
            title: data.title,
            text: data.text,
          },
        });
        const { title, message } = handleBackendSuccess(response, "Cláusula atualizada com sucesso!");
        showSuccessToast({
          title,
          description: message
        });
      } else {
        response = await createClause({
          title: data.title,
          text: data.text,
          organizationId,
        });
        const { title, message } = handleBackendSuccess(response, "Cláusula criada com sucesso!");
        showSuccessToast({
          title,
          description: message
        });
      }
      setSelectedClause(undefined);
      onCancelCreate();
    } catch (error: unknown) {
      const { title, message } = handleBackendError(error, "Erro ao salvar cláusula. Tente novamente mais tarde.");
      toast({
        title,
        description: message,
        variant: "destructive",
      });
    }
  };

  const showForm = isCreating || !!selectedClause;

  return (
    <div className="animate-fade-in">
      {isLoading ? (
        <ClauseListSkeleton />
      ) : (
        <AnimatedFormSwitcher
          showForm={showForm}
          list={
            <ClauseList
              clauses={clauses || []}
              onCreateClick={onCreateClick}
              onEditClick={setSelectedClause}
            />
          }
          form={
            <ClauseForm
              clause={selectedClause}
              onSubmit={handleSubmit}
              onCancel={() => {
                setSelectedClause(undefined);
                onCancelCreate();
              }}
            />
          }
        />
      )}
    </div>
  );
} 