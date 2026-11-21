import * as React from "react";
import { Button } from "@/components/ui/button";
import { AsyncActionButton } from "@/components/AsyncActionButton";
import { ArrowLeft } from "lucide-react";
import { ConfirmDeleteDialog } from "@/components/ui/confirm-delete-dialog";
import { Form } from "@/components/ui/form";
import { UseFormReturn, FieldValues } from "react-hook-form";

interface FormLayoutProps<T extends FieldValues = FieldValues> {
  title?: string;
  children: React.ReactNode;
  onSubmit: (values: T) => void | Promise<void>;
  onCancel?: () => void;
  submitLabel?: string;
  isSubmitting?: boolean;
  isEditing?: boolean;
  className?: string;
  onDelete?: () => Promise<void>;
  entityName?: string;
  entityType?: string;
  isDeleting?: boolean;
  form: UseFormReturn<T>;
  customSubmitButton?: React.ReactNode;
  plain?: boolean;
  hideActions?: boolean;
}

export function FormLayout<T extends FieldValues = FieldValues>({
  title,
  children,
  onSubmit,
  onCancel,
  submitLabel,
  isSubmitting = false,
  isEditing = false,
  className = "",
  onDelete,
  entityName,
  entityType,
  isDeleting = false,
  form,
  customSubmitButton,
  plain = false,
  hideActions = false,
}: FormLayoutProps<T>) {
  const [showDeleteDialog, setShowDeleteDialog] = React.useState(false);

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowDeleteDialog(true);
  };

  return (
    <div className={`${plain ? "" : "bg-white rounded-lg border shadow-sm p-6 "}animate-slide-in ${className}`}>
      {(title || onCancel) && (
        <div className="flex justify-between items-center mb-6">
          {title ? (
            <h2 className="text-xl font-semibold">
              {title}
            </h2>
          ) : (
            <span />
          )}
          {
            onCancel && (
              <Button variant="outline" size="sm" onClick={onCancel}>
                Voltar
              </Button>
            )
          }
        </div>
      )}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {children}
          {!hideActions && (
            <div className="flex justify-end space-x-2">
              {isEditing && onDelete && (
                <Button
                  type="button"
                  variant="destructive"
                  onClick={handleDeleteClick}
                  disabled={isSubmitting || isDeleting}
                >
                  Deletar
                </Button>
              )}
              {customSubmitButton || (
                <AsyncActionButton
                  onClick={form.handleSubmit(onSubmit)}
                  label={submitLabel || (isEditing ? "Atualizar" : "Criar")}
                  disabled={isSubmitting}
                />
              )}
            </div>
          )}
        </form>
      </Form>
      {!hideActions && isEditing && onDelete && (
        <ConfirmDeleteDialog
          open={showDeleteDialog}
          onOpenChange={setShowDeleteDialog}
          onConfirm={onDelete}
          entityName={entityName || ""}
          entityType={entityType || ""}
          isPending={isDeleting}
        />
      )}
    </div>
  );
} 