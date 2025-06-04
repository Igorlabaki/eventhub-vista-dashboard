import { useState } from "react";
import { AnimatedFormSwitcher } from "@/components/ui/animated-form-switcher";
import { ConfirmDeleteDialog } from "@/components/ui/confirm-delete-dialog";
import { DiscountForm } from "@/components/goal/discount-form";
import { DiscountList } from "@/components/goal/discount-list";
import { useSeasonalFeeStore } from "@/store/seasonalFeeStore";
import { showSuccessToast } from "@/components/ui/success-toast";
import { useToast } from "@/hooks/use-toast";
import { handleBackendSuccess, handleBackendError } from "@/lib/error-handler";

interface Discount {
  id: string;
  type: string;
  title: string;
  fee: number;
  startDay?: string;
  endDay?: string;
  affectedDays?: string;
}

interface DiscountsTabProps {
  discounts: Discount[];
  isLoading: boolean;
  traduzirDiasSemana: (dias: string) => string;
  showForm: boolean;
  setShowForm: (open: boolean) => void;
}

export function DiscountsTab({ discounts, isLoading, traduzirDiasSemana, showForm, setShowForm }: DiscountsTabProps) {
  const [discountToDelete, setDiscountToDelete] = useState<Discount | null>(null);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [selectedDiscount, setSelectedDiscount] = useState<Discount | null>(null);
  const { deleteSeasonalFee } = useSeasonalFeeStore();
  const { toast } = useToast();

  const handleDelete = async () => {
    if (!discountToDelete) return;
    try {
      const response = await deleteSeasonalFee(discountToDelete.id, discountToDelete.type as "DISCOUNT");
      const { title, message } = handleBackendSuccess(response, "Desconto excluído com sucesso!");
      showSuccessToast({
        title,
        description: message
      });
      setDiscountToDelete(null);
      setSelectedDiscount(null);
      setShowForm(false);
    } catch (error: unknown) {
      const { title, message } = handleBackendError(error, "Erro ao excluir desconto. Tente novamente mais tarde.");
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
          <DiscountList
            discounts={discounts}
            traduzirDiasSemana={traduzirDiasSemana}
            onEdit={(discount) => {
              setSelectedDiscount(discount);
              setShowForm(true);
            }}
            onDelete={(discount) => {
              setDiscountToDelete(discount);
              setConfirmDeleteOpen(true);
            }}
          />
        }
        form={
          <DiscountForm
            discount={selectedDiscount}
            onCancel={() => {
              setSelectedDiscount(null);
              setShowForm(false);
            }}
            onDelete={() => {
              setDiscountToDelete(selectedDiscount);
              setConfirmDeleteOpen(true);
            }}
          />
        }
      />
      <ConfirmDeleteDialog
        open={confirmDeleteOpen}
        onOpenChange={setConfirmDeleteOpen}
        onConfirm={handleDelete}
        entityName={discountToDelete?.title || ""}
        entityType="desconto"
      />
    </div>
  );
} 