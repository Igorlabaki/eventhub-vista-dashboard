export type VenueDomainView = {
  hostname: string | null;
  status: "PENDING" | "ACTIVE" | "REMOVED" | null;
  verification: { type: string; name: string; value: string } | null;
};

export const emptyVenueDomain: VenueDomainView = {
  hostname: null,
  status: null,
  verification: null,
};

export type VenueDomainUi = {
  domain: VenueDomainView;
  hostname: string;
  error: string | null;
  saved: boolean;
  removed: boolean;
};

export function venueDomainErrorMessage(status: number) {
  if (status === 400) return "Hostname invalido.";
  if (status === 403) return "Sem permissão para salvar o domínio.";
  if (status === 409) return "Esse domínio já está em outro espaço.";
  return "Não foi possível salvar o domínio.";
}

export function applyVenueDomainSave(
  current: VenueDomainUi,
  outcome: { ok: true; data: VenueDomainView } | { ok: false; status: number },
): VenueDomainUi {
  if (!outcome.ok) {
    return { ...current, error: venueDomainErrorMessage(outcome.status), saved: false, removed: false };
  }
  return {
    domain: outcome.data,
    hostname: outcome.data.hostname ?? current.hostname,
    error: null,
    saved: true,
    removed: false,
  };
}

export function venueDomainRemoveErrorMessage(status: number) {
  if (status === 403) return "Sem permissão para retirar o domínio.";
  return "Não foi possível retirar o domínio.";
}

export function applyVenueDomainRemove(
  current: VenueDomainUi,
  outcome: { ok: true; data: VenueDomainView } | { ok: false; status: number },
): VenueDomainUi {
  if (!outcome.ok) {
    return { ...current, error: venueDomainRemoveErrorMessage(outcome.status), saved: false, removed: false };
  }
  const stillAttached = outcome.data.status === "PENDING" || outcome.data.status === "ACTIVE";
  return {
    domain: stillAttached ? outcome.data : emptyVenueDomain,
    hostname: stillAttached ? (outcome.data.hostname ?? "") : "",
    error: null,
    saved: false,
    removed: !stillAttached,
  };
}
