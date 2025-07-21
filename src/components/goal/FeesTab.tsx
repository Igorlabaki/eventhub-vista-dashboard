import { useState } from "react";
import { AnimatedFormSwitcher } from "@/components/ui/animated-form-switcher";
import { ConfirmDeleteDialog } from "@/components/ui/confirm-delete-dialog";
import { FeeForm } from "@/components/goal/fee-form";
import { useSeasonalFeeStore } from "@/store/seasonalFeeStore";
import { showSuccessToast } from "@/components/ui/success-toast";
import { useToast } from "@/hooks/use-toast";
import { handleBackendSuccess, handleBackendError } from "@/lib/error-handler";
import { SeasonalFee } from "@/types/seasonalFee";
import { FeeList } from "./fee-list";
import { useUserVenuePermissionStore } from "@/store/userVenuePermissionStore";

interface FeesTabProps {
  fees: SeasonalFee[];
  isLoading: boolean;
  traduzirDiasSemana: (dias: string) => string;
  venueId: string;
  showForm: boolean;
  setShowForm: (open: boolean) => void;
}

export function FeesTab({ fees, isLoading, traduzirDiasSemana, venueId, showForm, setShowForm }: FeesTabProps) {
  const [feeToDelete, setFeeToDelete] = useState<SeasonalFee | null>(null);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [selectedFee, setSelectedFee] = useState<SeasonalFee | null>(null);
  const { deleteSeasonalFee } = useSeasonalFeeStore();
  const { toast } = useToast();

  const handleDelete = async () => {
    if (!feeToDelete) return;
    try {
      const response = await deleteSeasonalFee(feeToDelete.id, feeToDelete.type as "SURCHARGE");
      const { title, message } = handleBackendSuccess(response, "Taxa sazonal excluída com sucesso!");
      showSuccessToast({
        title,
        description: message
      });
      setFeeToDelete(null);
      setSelectedFee(null);
      setShowForm(false);
    } catch (error: unknown) {
      const { title, message } = handleBackendError(error, "Erro ao excluir taxa sazonal. Tente novamente mais tarde.");
      toast({
        title,
        description: message,
        variant: "destructive",
      });
    }
  };


  return (
    <div className="animate-fade-in">
      <AnimatedFormSwitcher
        showForm={showForm}
        list={
          <FeeList
            fees={fees}
            traduzirDiasSemana={traduzirDiasSemana}
            onEdit={(fee) => {
              setSelectedFee(fee);
              setShowForm(true);
            }}
            onDelete={(fee) => {
              setFeeToDelete(fee);
              setConfirmDeleteOpen(true);
            }}
          />
        }
        form={
          <FeeForm
            fee={selectedFee}
            venueId={venueId}
            onCancel={() => {
              setSelectedFee(null);
              setShowForm(false);
            }}
            onDelete={() => {
              setFeeToDelete(selectedFee);
              setConfirmDeleteOpen(true);
            }}
          />
        }
      />
      <ConfirmDeleteDialog
        open={confirmDeleteOpen}
        onOpenChange={setConfirmDeleteOpen}
        onConfirm={handleDelete}
        entityName={feeToDelete?.title || ""}
        entityType="taxa sazonal"
      />
    </div>
  );
} 