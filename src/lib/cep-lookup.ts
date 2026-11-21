export const CEP_LOOKUP_TIMEOUT_MS = 4000;

const VIA_CEP_PREFIX = "https://viacep.com.br/ws/";
const BRASIL_API_PREFIX = "https://brasilapi.com.br/api/cep/v2/";

export function cepDigits(value: string): string {
  return value.replace(/\D/g, "").slice(0, 8);
}

export function viaCepUrl(digits: string): string {
  return `${VIA_CEP_PREFIX}${digits}/json/`;
}

export function brasilApiCepUrl(digits: string): string {
  return `${BRASIL_API_PREFIX}${digits}`;
}

export function normalizeUf(value: string): string {
  const text = value.trim();
  if (/^[a-zA-Z]{2}$/.test(text)) return text.toUpperCase();
  return value;
}

export type CepFields = {
  street: string;
  neighborhood: string;
  city: string;
  state: string;
};

export type CepLookupResult =
  | { status: "filled"; address: CepFields }
  | { status: "failed" }
  | { status: "aborted" };

type FetchResponse = {
  ok: boolean;
  json: () => Promise<unknown>;
};

export type CepFetch = (url: string, init: { signal: AbortSignal }) => Promise<FetchResponse>;

export const browserCepFetch: CepFetch = async (url, init) => {
  const response = await fetch(url, { signal: init.signal });
  return { ok: response.ok, json: () => response.json() };
};

function text(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function fromViaCep(body: unknown): CepFields | null {
  if (!body || typeof body !== "object") return null;
  const record = body as Record<string, unknown>;
  if (record.erro === true) return null;
  const city = text(record.localidade);
  const state = text(record.uf);
  if (!city || !state) return null;
  return {
    street: text(record.logradouro),
    neighborhood: text(record.bairro),
    city,
    state: normalizeUf(state),
  };
}

function fromBrasilApi(body: unknown): CepFields | null {
  if (!body || typeof body !== "object") return null;
  const record = body as Record<string, unknown>;
  const city = text(record.city);
  const state = text(record.state);
  if (!city || !state) return null;
  return {
    street: text(record.street),
    neighborhood: text(record.neighborhood),
    city,
    state: normalizeUf(state),
  };
}

function linkTimeout(parent: AbortSignal | undefined, ms: number) {
  const controller = new AbortController();
  let didTimeout = false;
  const timer = setTimeout(() => {
    didTimeout = true;
    controller.abort();
  }, ms);
  const onParent = () => controller.abort();
  parent?.addEventListener("abort", onParent);
  return {
    signal: controller.signal,
    cancel: () => {
      clearTimeout(timer);
      parent?.removeEventListener("abort", onParent);
    },
    callerAborted: () => Boolean(parent?.aborted),
    timedOut: () => didTimeout && !parent?.aborted,
  };
}

async function readProvider(
  url: string,
  parse: (body: unknown) => CepFields | null,
  fetchImpl: CepFetch,
  parent: AbortSignal | undefined,
  timeoutMs: number,
): Promise<{ address: CepFields | null; aborted: boolean }> {
  if (parent?.aborted) return { address: null, aborted: true };
  const link = linkTimeout(parent, timeoutMs);
  try {
    const response = await fetchImpl(url, { signal: link.signal });
    if (link.callerAborted()) return { address: null, aborted: true };
    if (!response.ok) return { address: null, aborted: false };
    const body = await response.json();
    if (link.callerAborted()) return { address: null, aborted: true };
    return { address: parse(body), aborted: false };
  } catch {
    if (link.callerAborted()) return { address: null, aborted: true };
    return { address: null, aborted: false };
  } finally {
    link.cancel();
  }
}

export async function lookupCep(
  raw: string,
  options: {
    fetchImpl: CepFetch;
    signal?: AbortSignal;
    currentDigits?: () => string;
    timeoutMs?: number;
  },
): Promise<CepLookupResult> {
  const digits = cepDigits(raw);
  if (digits.length !== 8) return { status: "failed" };
  const timeoutMs = options.timeoutMs ?? CEP_LOOKUP_TIMEOUT_MS;
  const stillCurrent = () => (options.currentDigits ? options.currentDigits() === digits : true);

  const via = await readProvider(
    viaCepUrl(digits),
    fromViaCep,
    options.fetchImpl,
    options.signal,
    timeoutMs,
  );
  if (via.aborted || !stillCurrent()) return { status: "aborted" };
  if (via.address) return { status: "filled", address: via.address };

  const brasil = await readProvider(
    brasilApiCepUrl(digits),
    fromBrasilApi,
    options.fetchImpl,
    options.signal,
    timeoutMs,
  );
  if (brasil.aborted || !stillCurrent()) return { status: "aborted" };
  if (brasil.address) return { status: "filled", address: brasil.address };
  return { status: "failed" };
}
