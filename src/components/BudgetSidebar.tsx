import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { Proposal } from "@/types/proposal";

export interface BudgetSidebarProps {
  onBack: () => void;
  proposal: Proposal;
}

export function BudgetSidebar({ onBack, proposal }: BudgetSidebarProps) {
  return (
    <div className="w-80 border-r bg-white p-6">
      <Button variant="ghost" onClick={onBack} className="mb-6">
        <ChevronLeft className="mr-2 h-4 w-4" />
        Voltar
      </Button>

      <div className="space-y-6">
        <div>
          <h3 className="text-sm font-medium text-gray-500">Cliente</h3>
          <p className="mt-1 text-sm text-gray-900">{proposal.completeClientName}</p>
          {proposal.completeCompanyName && (
            <p className="mt-1 text-sm text-gray-900">{proposal.completeCompanyName}</p>
          )}
        </div>

        <div>
          <h3 className="text-sm font-medium text-gray-500">Email</h3>
          <p className="mt-1 text-sm text-gray-900">{proposal.email}</p>
        </div>

        <div>
          <h3 className="text-sm font-medium text-gray-500">WhatsApp</h3>
          <p className="mt-1 text-sm text-gray-900">{proposal.whatsapp}</p>
        </div>

        <div>
          <h3 className="text-sm font-medium text-gray-500">Visitou o Local</h3>
          <p className="mt-1 text-sm text-gray-900">
            {proposal.knowsVenue ? "Sim" : "Não"}
          </p>
        </div>

        <div>
          <h3 className="text-sm font-medium text-gray-500">Fonte de Indicação</h3>
          <p className="mt-1 text-sm text-gray-900">{proposal.trafficSource}</p>
        </div>

        <div>
          <h3 className="text-sm font-medium text-gray-500">Tipo de Evento</h3>
          <p className="mt-1 text-sm text-gray-900">{proposal.type}</p>
        </div>

        {proposal.cpf && (
          <div>
            <h3 className="text-sm font-medium text-gray-500">CPF</h3>
            <p className="mt-1 text-sm text-gray-900">{proposal.cpf}</p>
          </div>
        )}

        {proposal.cnpj && (
          <div>
            <h3 className="text-sm font-medium text-gray-500">CNPJ</h3>
            <p className="mt-1 text-sm text-gray-900">{proposal.cnpj}</p>
          </div>
        )}

        {proposal.street && (
          <div>
            <h3 className="text-sm font-medium text-gray-500">Endereço</h3>
            <p className="mt-1 text-sm text-gray-900">
              {proposal.street}, {proposal.streetNumber}
              {proposal.neighborhood && ` - ${proposal.neighborhood}`}
              {proposal.city && `, ${proposal.city}`}
              {proposal.state && ` - ${proposal.state}`}
              {proposal.cep && `, ${proposal.cep}`}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
