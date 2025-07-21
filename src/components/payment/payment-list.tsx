import * as React from "react"
import { cn } from "@/lib/utils"
import { EmptyState } from "@/components/EmptyState"
import { Pencil, Trash2 } from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { PaymentListSkeleton } from "./payment-list-skeleton"
import { ConfirmDeleteDialog } from "@/components/ui/confirm-delete-dialog"
import { Payment } from "@/types/payment"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { usePaymentStore } from "@/store/paymentStore"
import { showSuccessToast } from "@/components/ui/success-toast"
import { useToast } from "@/hooks/use-toast"
import { handleBackendSuccess, handleBackendError } from "@/lib/error-handler"
import { formatCurrency } from "@/lib/utils"
import { useUserVenuePermissionStore } from "@/store/userVenuePermissionStore"

interface PaymentListProps {
  payments: Payment[]
  onDeletePayment?: (payment: Payment) => void
  emptyMessage?: string
  className?: string
  selectedPaymentIds?: string[]
  isLoading?: boolean
  isDeleting?: boolean
  onCreateClick: () => void
  onEditClick: (payment: Payment) => void
}

export function PaymentList({
  payments,
  onDeletePayment,
  emptyMessage = "Nenhum pagamento encontrado",
  className,
  selectedPaymentIds = [],
  isLoading = false,
  isDeleting = false,
  onCreateClick,
  onEditClick
}: PaymentListProps) {
  const [paymentToDelete, setPaymentToDelete] = React.useState<Payment | null>(null);
  const { deletePayment } = usePaymentStore();
  const { toast } = useToast();

  const handleDelete = async (paymentId: string) => {
    try {
      const response = await deletePayment(paymentId);
      const { title, message } = handleBackendSuccess(response, "Pagamento excluído com sucesso!");
      showSuccessToast({
        title,
        description: message
      });
      setPaymentToDelete(null);
    } catch (error: unknown) {
      const { title, message } = handleBackendError(error, "Erro ao excluir pagamento. Tente novamente mais tarde.");
      toast({
        title,
        description: message,
        variant: "destructive",
      });
    }
  };

  const { currentUserVenuePermission } = useUserVenuePermissionStore();

  const hasEditPermission = () => {
    if (!currentUserVenuePermission?.permissions) return false;
    return currentUserVenuePermission.permissions.includes(
      "EDIT_PROPOSAL_PAYMENTS"
    );
  };

  if (isLoading) {
    return <PaymentListSkeleton />;
  }

  if (!payments || payments.length === 0) {
    return <EmptyState title={emptyMessage} actionText="Novo Pagamento" onAction={onCreateClick} hasEditPermission={hasEditPermission()} />;
  }

  return (
    <div className={cn("space-y-4", className)}>
      <Table className="bg-white rounded-md shadow-lg ">
        <TableHeader>
          <TableRow>
            <TableHead>Valor</TableHead>
            <TableHead className="">Data</TableHead>
            {hasEditPermission() && (
              <TableHead className="w-[100px] text-center">Ações</TableHead>
            )}
          </TableRow>
        </TableHeader>
        <TableBody>
          {payments.map((payment) => (
            <TableRow 
              key={payment.id}
              className={cn(
                "hover:bg-gray-50",
                selectedPaymentIds.includes(payment.id) && "bg-violet-100"
              )}
            >
              <TableCell className="font-medium">
                {formatCurrency(payment.amount)}
              </TableCell>
              <TableCell>
                {new Date(payment.paymentDate).toLocaleDateString('pt-BR')}
              </TableCell>
              {hasEditPermission() && (
              <TableCell className="text-center">
                <div className="flex items-center justify-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onEditClick(payment);
                    }}
                    className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setPaymentToDelete(payment);
                    }}
                    className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                  </div>
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <ConfirmDeleteDialog
        open={!!paymentToDelete}
        onOpenChange={(open) => !open && setPaymentToDelete(null)}
        onConfirm={async () => {
          if (paymentToDelete) {
            await handleDelete(paymentToDelete.id);
          }
        }}
        entityName={paymentToDelete ? `Pagamento de ${formatCurrency(paymentToDelete.amount)}` : ""}
        entityType="pagamento"
        isPending={isDeleting}
      />
    </div>
  )
} 