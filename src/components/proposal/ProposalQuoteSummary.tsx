import { useId } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { handleBackendError } from "@/lib/error-handler";
import { applyDiscount, discountLabel, parseDiscountInput } from "@/lib/proposal-discount";
import { ProposalQuote } from "@/types/proposal";

interface ProposalQuoteSummaryProps {
  hasInput: boolean;
  isBarter: boolean;
  quote?: ProposalQuote;
  isUpdating: boolean;
  error: unknown;
  discountInput: string;
  onDiscountChange: (value: string) => void;
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
  discountInput,
  onDiscountChange,
  notice,
}: ProposalQuoteSummaryProps) {
  const discountId = useId();
  const { percent, error: discountError } = parseDiscountInput(discountInput);

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

    const discount = applyDiscount(quote.totalAmount, discountError ? 0 : percent);
    const hasDiscount = discount.discountAmount > 0;

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
        <div className="space-y-2 border-t pt-2">
          <Row label="Total" value={brl(quote.totalAmount)} strong={!hasDiscount} />
          {hasDiscount && (
            <>
              <Row label={discountLabel(discount.discountPercent)} value={`- ${brl(discount.discountAmount)}`} />
              <Row label="Total com desconto" value={brl(discount.totalAmount)} strong />
            </>
          )}
        </div>
        {quote.minimumApplied && (
          <p className="text-xs text-amber-700">Preço mínimo do espaço aplicado</p>
        )}
        {notice && <p className="text-xs text-blue-700">{notice}</p>}
        <div className="space-y-1">
          <Label htmlFor={discountId}>Desconto (%)</Label>
          <Input
            id={discountId}
            inputMode="decimal"
            placeholder="0"
            className="max-w-[8rem]"
            value={discountInput}
            aria-invalid={Boolean(discountError)}
            aria-describedby={discountError ? `${discountId}-error` : undefined}
            onChange={(event) => onDiscountChange(event.target.value)}
          />
          {discountError && (
            <p id={`${discountId}-error`} className="text-xs text-red-600">{discountError}</p>
          )}
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
