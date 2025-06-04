import { Payment, PaymentMethod } from "@/types/payment";
import { PaymentList } from "./payment-list";
import { PaymentListSkeleton } from "./payment-list-skeleton";
import { PaymentForm } from "./payment-form";
import { usePaymentStore } from "@/store/paymentStore";
import { useProposalStore } from "@/store/proposalStore";
import { showSuccessToast } from "@/components/ui/success-toast";
import { useToast } from "@/hooks/use-toast";
import { handleBackendSuccess, handleBackendError } from "@/lib/error-handler";
import { AnimatedFormSwitcher } from "@/components/ui/animated-form-switcher";
import { useUser } from "@/hooks/user/queries/byId";
import { CreatePaymentWithFileDTO } from "@/services/payment.service";
import { useEffect } from "react";

interface PaymentSectionProps {
  proposalId: string;
  venueId: string;
  isCreating: boolean;
  selectedPayment: Payment | null | undefined;
  setSelectedPayment: (payment: Payment | null | undefined) => void;
  onCreateClick: () => void;
  onCancelCreate: () => void;
  totalAmount: number;
}

export function PaymentSection({
  proposalId,
  venueId,
  isCreating,
  selectedPayment,
  setSelectedPayment,
  onCreateClick,
  onCancelCreate,
  totalAmount,
}: PaymentSectionProps) {
  const {
    createPayment,
    updatePayment,
    deletePayment,
    payments,
    isLoading,
    fetchPayments,
  } = usePaymentStore();
  const { toast } = useToast();
  const { data: user, isLoading: isUserLoading } = useUser();

  // Carregar pagamentos quando o componente montar ou proposalId mudar
  useEffect(() => {
    fetchPayments({ proposalId, venueId });
  }, [proposalId, venueId, fetchPayments]);

  // Calcular total já pago
  const totalPaid = payments.reduce((acc, p) => acc + (p.amount || 0), 0);

  if (!user || isUserLoading) {
    return <PaymentListSkeleton />;
  }

  const handleSubmit = async (data: CreatePaymentWithFileDTO) => {
    try {
      let response;
      if (selectedPayment) {
        response = await updatePayment({
          userId: user.id,
          username: user.username,
          paymentId: selectedPayment.id,
          proposalId,
          amount: data.amount,
          paymentDate: data.paymentDate,
          paymentMethod: data.paymentMethod,
        });
      } else {
        response = await createPayment(data);
      }

      const { title, message } = handleBackendSuccess(
        response,
        "Pagamento salvo com sucesso!"
      );
      showSuccessToast({ title, description: message });

      await fetchPayments({ proposalId, venueId });
      setSelectedPayment(undefined);
      onCancelCreate();
    } catch (error: unknown) {
      const { title, message } = handleBackendError(
        error,
        "Erro ao salvar pagamento."
      );
      toast({
        title,
        description: message,
        variant: "destructive",
      });
    }
  };

  const handleUpdate = async (
    data: CreatePaymentWithFileDTO & { paymentId: string }
  ) => {
    try {
      const response = await updatePayment({
        userId: user.id,
        username: user.username,
        paymentId: data.paymentId,
        proposalId,
        amount: data.amount,
        paymentDate: data.paymentDate,
        paymentMethod: data.paymentMethod,
        file: data.file,
      });

      const { title, message } = handleBackendSuccess(
        response,
        "Pagamento atualizado com sucesso!"
      );
      showSuccessToast({ title, description: message });

      await fetchPayments({ proposalId, venueId });
      setSelectedPayment(undefined);
      onCancelCreate();
    } catch (error: unknown) {
      const { title, message } = handleBackendError(
        error,
        "Erro ao atualizar pagamento."
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
      await deletePayment(id);
      await fetchPayments({ proposalId, venueId });
      setSelectedPayment(undefined);
      onCancelCreate();
      showSuccessToast({
        title: "Sucesso",
        description: "Pagamento excluído com sucesso!",
      });
    } catch (error: unknown) {
      const { title, message } = handleBackendError(
        error,
        "Erro ao excluir pagamento. Tente novamente mais tarde."
      );
      toast({
        title,
        description: message,
        variant: "destructive",
      });
    }
  };

  const showForm = isCreating || !!selectedPayment;

  return (
    <div className="animate-fade-in">
      {isLoading ? (
        <PaymentListSkeleton />
      ) : (
        <AnimatedFormSwitcher
          showForm={showForm}
          list={
            <PaymentList
              payments={payments}
              onCreateClick={onCreateClick}
              onEditClick={setSelectedPayment}
              onDeletePayment={(payment) => handleDelete(payment.id)}
            />
          }
          form={
            <PaymentForm
              payment={selectedPayment}
              proposalId={proposalId}
              venueId={venueId}
              userId={user.id}
              username={user.username}
              onSubmit={handleSubmit}
              onUpdate={handleUpdate}
              onDelete={handleDelete}
              onCancel={onCancelCreate}
              totalPaid={totalPaid}
              totalAmount={totalAmount}
            />
          }
        />
      )}
    </div>
  );
}
