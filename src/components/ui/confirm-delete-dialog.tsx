import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import React from "react";

interface ConfirmDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => Promise<void>;
  entityName: string;
  entityType: string;
  isPending?: boolean;
}

export function ConfirmDeleteDialog({
  open,
  onOpenChange,
  onConfirm,
  entityName,
  entityType,
  isPending = false,
}: ConfirmDeleteDialogProps) {
  const [isDeleting, setIsDeleting] = React.useState(false);

  const handleConfirm = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isDeleting) return;
    
    setIsDeleting(true);
    try {
      await onConfirm();
    } finally {
      setIsDeleting(false);
      onOpenChange(false);
    }
  };

  const handleCancel = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onOpenChange(false);
  };

  return (
    <Dialog 
      open={open} 
      onOpenChange={(newOpen) => {
        if (!newOpen && !isDeleting) {
          onOpenChange(false);
        }
      }}
    >
      <DialogContent className="w-[90%] md:w-[50%] rounded-md">
        <DialogHeader>
          <DialogTitle>Tem certeza?</DialogTitle>
          <DialogDescription>
            Essa ação não pode ser desfeita. Esta operação irá excluir
            permanentemente o {entityType} "<strong>{entityName}</strong>" e todos os seus dados
            associados.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            disabled={isDeleting}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleConfirm}
            disabled={isDeleting || isPending}
          >
            {isDeleting ? "Deletando..." : "Deletar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 