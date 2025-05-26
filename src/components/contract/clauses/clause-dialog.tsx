import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ClauseForm } from "@/components/contract/clauses/clause-form";
import { Clause } from "@/types/clause";

interface ClauseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedClause: Clause | null;
  onSave: (data: Partial<Clause>) => void;
  isLoading?: boolean;
  organizationId: string;
}

export function ClauseDialog({ open, onOpenChange, selectedClause, onSave, isLoading = false, organizationId }: ClauseDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl" onClick={e => e.stopPropagation()}>
        <DialogHeader>
          <DialogTitle>
            {selectedClause ? "Editar Cláusula" : "Nova Cláusula"}
          </DialogTitle>
          <DialogDescription>
            Complete o formulário abaixo para {selectedClause ? "editar a" : "criar uma nova"} cláusula.
          </DialogDescription>
        </DialogHeader>
        <ClauseForm
          clause={selectedClause}
          onCancel={() => onOpenChange(false)}
          isLoading={isLoading}
          organizationId={organizationId}
        />
      </DialogContent>
    </Dialog>
  );
} 