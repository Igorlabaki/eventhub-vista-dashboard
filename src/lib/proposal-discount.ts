export const DISCOUNT_MESSAGE = "Informe um desconto de 0 a 100%, com até duas casas decimais.";

export interface ParsedDiscount {
    percent: number;
    error: string | null;
}

export interface AppliedDiscount {
    discountPercent: number;
    discountAmount: number;
    totalAmount: number;
}

function round2(value: number): number {
    return Math.round(value * 100) / 100;
}

export function parseDiscountInput(raw: string): ParsedDiscount {
    const value = raw.trim().replace(",", ".");
    if (!value) return { percent: 0, error: null };
    if (!/^\d{1,3}(\.\d{0,2})?$/.test(value)) return { percent: 0, error: DISCOUNT_MESSAGE };
    const percent = Number(value);
    if (percent > 100) return { percent: 0, error: DISCOUNT_MESSAGE };
    return { percent, error: null };
}

/** Mesma formula e arredondamento de `functions/proposal-discount.ts` no backend. */
export function applyDiscount(subtotal: number, percent: number): AppliedDiscount {
    if (!percent) return { discountPercent: 0, discountAmount: 0, totalAmount: subtotal };
    const discountAmount = round2((subtotal * percent) / 100);
    return { discountPercent: percent, discountAmount, totalAmount: round2(subtotal - discountAmount) };
}

export function formatDiscountPercent(percent: number): string {
    return String(percent).replace(".", ",");
}

export function discountLabel(percent: number): string {
    return `Desconto (${formatDiscountPercent(percent)}%)`;
}

export interface DiscountBreakdown {
    subtotal: number;
    label: string;
    amount: number;
}

/** Linhas de subtotal e desconto de um orcamento gravado; `null` quando nao ha desconto. */
export function discountBreakdown(proposal: {
    totalAmount: number;
    discountPercent?: number | null;
    discountAmount?: number | null;
}): DiscountBreakdown | null {
    const percent = proposal.discountPercent ?? 0;
    if (percent <= 0) return null;
    const amount = proposal.discountAmount ?? 0;
    return { subtotal: round2(proposal.totalAmount + amount), label: discountLabel(percent), amount };
}

export function discountRemovedNotice(percent: number | null | undefined): string | null {
    if (!percent) return null;
    return `O desconto de ${formatDiscountPercent(percent)}% deixa de valer se você alterar o orçamento.`;
}
