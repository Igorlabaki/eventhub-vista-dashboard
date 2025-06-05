import { useState } from "react";
import { PaymentSection } from "@/components/payment/payment-section";
import { useProposalStore } from "@/store/proposalStore";
import { Payment } from "@/types/payment";
import { DashboardLayout } from "@/components/DashboardLayout";
import { PageHeader } from "@/components/PageHeader";

const ProposalPayment = () => {
  const [isCreating, setIsCreating] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const { currentProposal } = useProposalStore();

  const proposalId = currentProposal?.id || "";
  const venueId = currentProposal?.venueId || "";
  const totalAmount = currentProposal?.totalAmount || 0;

  const showCreateButton = !isCreating && !selectedPayment;

  return (
    <DashboardLayout title="Pagamentos" subtitle="Gerencie os pagamentos deste evento">
      <PageHeader
        onCreateClick={() => setIsCreating(true)}
        createButtonText="Novo Pagamento"
        isFormOpen={!showCreateButton}
      />
      <PaymentSection
        proposalId={proposalId}
        venueId={venueId}
        isCreating={isCreating}
        selectedPayment={selectedPayment}
        setSelectedPayment={setSelectedPayment}
        onCreateClick={() => setIsCreating(true)}
        onCancelCreate={() => {
          setIsCreating(false);
          setSelectedPayment(null);
        }}
        totalAmount={totalAmount}
      />
    </DashboardLayout>
  );
}

export { ProposalPayment }; 