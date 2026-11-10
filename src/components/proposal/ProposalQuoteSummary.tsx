import { Button } from "@/components/ui/button";
import { handleBackendError } from "@/lib/error-handler";
import { ProposalQuote } from "@/types/proposal";

interface ProposalQuoteSummaryProps {
  hasInput: boolean;
  isBarter: boolean;
  quote?: ProposalQuote;
  isUpdating: boolean;
  error: unknown;
  onUseValue: (totalAmount: number) => void;
  notice?: string | null;
}

function brl(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function Row({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className={`flex justify-between gap-4 text-sm ${strong ? "font-semibold text-gray-900" : "text-gray-600"}`}>
      <span>{label}</span>
      <span className="tabular-nums">{value}</span>
    </div>
  );
}

export function ProposalQuoteSummary({
  hasInput,
  isBarter,
  quote,
  isUpdating,
  error,
  onUseValue,
  notice,
}: ProposalQuoteSummaryProps) {
  const renderBody = () => {
    if (isBarter) return <Row label="Total" value={brl(0)} strong />;

    if (!hasInput) {
      return (
        <>
          <Row label="Total" value="—" strong />
          <p className="text-xs text-gray-500">Preencha data, horários e convidados para ver o total.</p>
        </>
      );
    }

    if (error) {
      return (
        <p className="text-sm text-red-600">
          {handleBackendError(error, "Não foi possível calcular agora.").message}
        </p>
      );
    }

    if (!quote) return <p className="text-sm text-gray-500">Calculando...</p>;

    return (
      <>
        <Row label="Espaço" value={brl(quote.basePrice)} />
        {quote.extraHoursQty > 0 && (
          <Row
            label={`Horas extras (${quote.extraHoursQty}h × ${brl(quote.extraHourPrice)})`}
            value={brl(quote.extraHoursQty * quote.extraHourPrice)}
          />
        )}
        <Row label="Serviços" value={brl(quote.totalAmountService)} />
        <div className="border-t pt-2">
          <Row label="Total" value={brl(quote.totalAmount)} strong />
        </div>
        {quote.minimumApplied && (
          <p className="text-xs text-amber-700">Preço mínimo do espaço aplicado</p>
        )}
        {notice && <p className="text-xs text-blue-700">{notice}</p>}
        <div className="flex justify-end">
          <Button type="button" variant="outline" size="sm" onClick={() => onUseValue(quote.totalAmount)}>
            Usar este valor
          </Button>
        </div>
      </>
    );
  };

  return (
    <div className="space-y-2 rounded-md border bg-gray-50 p-4" aria-live="polite">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">Total estimado</span>
        {hasInput && !isBarter && isUpdating && (
          <span className="text-xs text-gray-500">Atualizando...</span>
        )}
      </div>
      {renderBody()}
    </div>
  );
}
