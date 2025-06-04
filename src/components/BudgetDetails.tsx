import { Button } from "@/components/ui/button";
import { Proposal } from "@/types/proposal";
import { format } from "date-fns";
import { pt } from "date-fns/locale";
import { ClipboardList } from "lucide-react";

export interface BudgetDetailsProps {
  proposal: Proposal;
  onClose: () => void;
}

export function BudgetDetails({ proposal, onClose }: BudgetDetailsProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Detalhes do Orçamento</h2>
        <Button variant="outline" onClick={onClose}>
          Fechar
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div>
          <h3 className="text-sm font-medium text-gray-500">Data do Evento</h3>
          <p className="mt-1 text-sm text-gray-900">
            {format(proposal.startDate, "dd/MM/yyyy", {
              locale: pt
            })}
          </p>
        </div>

        <div>
          <h3 className="text-sm font-medium text-gray-500">Valor Total</h3>
          <p className="mt-1 text-sm text-gray-900">
            {formatCurrency(proposal.totalAmount)}
          </p>
        </div>

        <div>
          <h3 className="text-sm font-medium text-gray-500">Número de Convidados</h3>
          <p className="mt-1 text-sm text-gray-900">{proposal.guestNumber}</p>
        </div>

        <div>
          <h3 className="text-sm font-medium text-gray-500">Horário do Evento</h3>
          <p className="mt-1 text-sm text-gray-900">
            {format(proposal.startDate, "HH:mm")} - {format(proposal.endDate, "HH:mm")}
          </p>
        </div>
      </div>

      <div className="border-t pt-6">
        <h3 className="text-lg font-medium mb-4">Valores</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h4 className="text-sm font-medium text-gray-500">Valor Base</h4>
            <p className="mt-1 text-sm text-gray-900">
              {formatCurrency(proposal.basePrice)}
            </p>
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-500">Hora Extra (R$ {formatCurrency(proposal.extraHoursQty)})</h4>
            <p className="mt-1 text-sm text-gray-900">
              {formatCurrency(proposal.extraHourPrice * proposal.extraHoursQty)}
            </p>
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-500">Descrição</h4>
            <p className="mt-1 text-sm text-gray-900">{proposal.description}</p>
          </div>

          {proposal.hostMessage && (
            <div>
              <h4 className="text-sm font-medium text-gray-500">Mensagem do Anfitrião</h4>
              <p className="mt-1 text-sm text-gray-900">{proposal.hostMessage}</p>
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button variant="outline" onClick={onClose}>
          Fechar
        </Button>
        <Button>
          <ClipboardList className="mr-2 h-4 w-4" />
          Gerar Contrato
        </Button>
      </div>
    </div>
  );
}
