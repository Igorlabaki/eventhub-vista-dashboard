export function perPersonAmount(totalInput?: string | null, guestInput?: string | null) {
    if (!totalInput || !guestInput) return null;
    const total = Number(totalInput);
    const guests = Number(guestInput);
    if (!Number.isFinite(total) || total <= 0) return null;
    if (!Number.isInteger(guests) || guests <= 0) return null;
    return Math.round((total / guests) * 100) / 100;
}

export function perPersonLabel(totalInput?: string | null, guestInput?: string | null, estimatedTotal?: number | null) {
    const amount = perPersonAmount(totalInput, guestInput);
    if (amount !== null) return `${formatBrl(amount)} / pessoa`;
    const estimated = totalInput ? null : perPersonAmount(estimatedTotal ? String(estimatedTotal) : null, guestInput);
    if (estimated !== null) return `${formatBrl(estimated)} / pessoa (estimado)`;
    return "— / pessoa";
}

function formatBrl(value: number) {
    return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}
