import { useState } from "react";
import { PaymentSection } from "@/components/payment/payment-section";
import { useProposalStore } from "@/store/proposalStore";
import { Payment } from "@/types/payment";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export function ProposalPayment() {
  const [isCreating, setIsCreating] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const { currentProposal } = useProposalStore();

  const proposalId = currentProposal?.id || "";
  const venueId = currentProposal?.venueId || "";
  const totalAmount = currentProposal?.totalAmount || 0;

  const showCreateButton = !isCreating && !selectedPayment;

  return (
    <DashboardLayout title="Pagamentos" subtitle="Gerencie os pagamentos deste evento">
      {/* Botão desktop/tablet */}
      {showCreateButton && (
        <div className="hidden sm:flex justify-end mb-4">
          <Button onClick={() => setIsCreating(true)}>
            <Plus className="w-4 h-4 mr-2" /> Novo Pagamento
          </Button>
        </div>
      )}
      {/* Botão flutuante mobile */}
      {showCreateButton && (
        <button
          className="sm:hidden fixed bottom-6 right-6 z-50 bg-primary text-white rounded-full shadow-lg p-4 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-primary/50"
          onClick={() => setIsCreating(true)}
          aria-label="Novo Pagamento"
        >
          <Plus className="w-6 h-6" />
        </button>
      )}
      <PaymentSection
        proposalId={proposalId}
        venueId={venueId}
        isCreating={isCreating}
        selectedPayment={selectedPayment}
        setSelectedPayment={setSelectedPayment}
        onCreateClick={() => setIsCreating(true)}
        onCancelCreate={() => setIsCreating(false)}
        totalAmount={totalAmount}
      />
    </DashboardLayout>
  );
} 