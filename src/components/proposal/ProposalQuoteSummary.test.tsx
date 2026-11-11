import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { ProposalQuoteSummary } from "./ProposalQuoteSummary";
import { DISCOUNT_MESSAGE } from "@/lib/proposal-discount";

const quote = {
  basePrice: 5000,
  extraHoursQty: 0,
  extraHourPrice: 0,
  totalAmountService: 800,
  totalAmount: 5800,
  minimumApplied: false,
};

function render(discountInput: string, overrides: Partial<Parameters<typeof ProposalQuoteSummary>[0]> = {}) {
  const html = renderToStaticMarkup(
    <ProposalQuoteSummary
      hasInput
      isBarter={false}
      quote={quote}
      isUpdating={false}
      error={null}
      discountInput={discountInput}
      onDiscountChange={() => undefined}
      {...overrides}
    />,
  );
  return html.replace(/\u00a0/g, " ").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ");
}

describe("bloco Total estimado com desconto", () => {
  it("10% sobre 5800 mostra desconto e total com desconto", () => {
    const text = render("10");
    expect(text).toContain("Desconto (10%) - R$ 580,00");
    expect(text).toContain("Total com desconto R$ 5.220,00");
    expect(text).toContain("Desconto (%)");
  });

  it("7,5% aparece com virgula", () => {
    expect(render("7,5")).toContain("Desconto (7,5%) - R$ 435,00");
  });

  it("sem % mostra so o Total e o campo vazio", () => {
    const text = render("");
    expect(text).toContain("Total R$ 5.800,00");
    expect(text).not.toContain("Total com desconto");
    expect(text).not.toContain("Usar este valor");
  });

  it.each(["101", "-1"])("%s mostra o erro no campo e nao aplica", (raw) => {
    const text = render(raw);
    expect(text).toContain(DISCOUNT_MESSAGE);
    expect(text).not.toContain("Total com desconto");
  });

  it("permuta esconde o campo", () => {
    expect(render("10", { isBarter: true })).not.toContain("Desconto (%)");
  });

  it("sem estimado nao mostra o campo", () => {
    expect(render("10", { quote: undefined })).not.toContain("Desconto (%)");
  });
});
