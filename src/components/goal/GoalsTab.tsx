import { useState } from "react";
import { AnimatedFormSwitcher } from "@/components/ui/animated-form-switcher";
import { ConfirmDeleteDialog } from "@/components/ui/confirm-delete-dialog";

import { useGoalStore } from "@/store/goalStore";
import { toast } from "@/components/ui/use-toast";
import { handleBackendError, handleBackendSuccess } from "@/lib/error-handler";
import { showSuccessToast } from "@/components/ui/success-toast";
import { GoalList } from "@/components/goal/GoalList";
import { GoalListSkeleton } from "@/components/goal/GoalListSkeleton";

import type { Goal } from "@/types/goal";
import { useVenueStore } from "@/store/venueStore";
import { GoalForm } from "./GoalForm";

interface GoalsTabProps {
  goals: Goal[];
  isLoading: boolean;
  monthLabels: string[];
  showForm: boolean;
  setShowForm: (open: boolean) => void;
  selectedGoal: Goal | null;
  setSelectedGoal: (goal: Goal | null) => void;
}

export const monthsList = [
  { display: "Jan", value: "1" },
  { display: "Fev", value: "2" },
  { display: "Mar", value: "3" },
  { display: "Abr", value: "4" },
  { display: "Mai", value: "5" },
  { display: "Jun", value: "6" },
  { display: "Jul", value: "7" },
  { display: "Ago", value: "8" },
  { display: "Set", value: "9" },
  { display: "Out", value: "10" },
  { display: "Nov", value: "11" },
  { display: "Dez", value: "12" },
];

export function GoalsTab({ goals, isLoading, monthLabels, showForm, setShowForm, selectedGoal, setSelectedGoal }: GoalsTabProps) {
  const { deleteGoal } = useGoalStore();    
  const [goalToDelete, setGoalToDelete] = useState<Goal | null>(null);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);

  const handleEditGoal = (goal: Goal) => {
    setSelectedGoal(goal);
    setShowForm(true);
  };

  const handleNewGoal = () => {
    setSelectedGoal(null);
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setSelectedGoal(null);
  };

  const handleDeleteGoal = async () => {
    if (goalToDelete) {
      try {
        const response = await deleteGoal(goalToDelete.id);
        const { title, message } = handleBackendSuccess(response, "Meta excluída com sucesso!");
        showSuccessToast({
          title,
          description: message
        });
        setGoalToDelete(null);
        setConfirmDeleteOpen(false);
        setSelectedGoal(null);
        setShowForm(false);
      } catch (error: unknown) {
        const { title, message } = handleBackendError(error, "Erro ao excluir meta. Tente novamente mais tarde.");
        toast({ 
          title,
          description: message,
          variant: "destructive" 
        });
      }
    }
  };

  return (
    <div className="animate-fade-in">
      {isLoading ? (
        <GoalListSkeleton />
      ) : (
        <AnimatedFormSwitcher
          showForm={showForm}
          list={
            <GoalList
              goals={goals}
              onCreateClick={handleNewGoal}
              onEditClick={handleEditGoal}
              onDeleteGoal={(goal) => {
                setGoalToDelete(goal);
                setConfirmDeleteOpen(true);
              }}
            />
          }
          form={
            <GoalForm
              goal={selectedGoal}
              onCancel={handleCancel}
            />
          }
        />
      )}
      <ConfirmDeleteDialog
        open={confirmDeleteOpen}
        onOpenChange={setConfirmDeleteOpen}
        onConfirm={handleDeleteGoal}
        entityName={goalToDelete?.minValue?.toString() || ""}
        entityType="meta"
      />
    </div>
  );
} 