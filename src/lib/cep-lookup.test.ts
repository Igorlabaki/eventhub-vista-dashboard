import { describe, expect, it, vi } from "vitest";
import {
  CEP_LOOKUP_TIMEOUT_MS,
  brasilApiCepUrl,
  cepDigits,
  lookupCep,
  normalizeUf,
  viaCepUrl,
  type CepFetch,
} from "./cep-lookup";

const viaBody = {
  logradouro: "Praça da Sé",
  complemento: "lado ímpar",
  bairro: "Sé",
  localidade: "São Paulo",
  uf: "SP",
  ibge: "3550308",
};

function ok(body: unknown) {
  return { ok: true, json: async () => body };
}

describe("busca de CEP", () => {
  it("ViaCEP completa preenche os quatro campos e ignora complemento", async () => {
    const fetchImpl = vi.fn<CepFetch>(async () => ok(viaBody));
    const result = await lookupCep("01001-000", { fetchImpl });

    expect(result).toEqual({
      status: "filled",
      address: {
        street: "Praça da Sé",
        neighborhood: "Sé",
        city: "São Paulo",
        state: "SP",
      },
    });
    expect(result).not.toHaveProperty("address.complement");
    expect(fetchImpl).toHaveBeenCalledTimes(1);
  });

  it("CEP sem rua e sem bairro devolve cidade e UF com rua e bairro vazios", async () => {
    const fetchImpl = vi.fn<CepFetch>(async () =>
      ok({ logradouro: "", bairro: " ", localidade: "Campinas", uf: "sp" }),
    );
    const result = await lookupCep("13010000", { fetchImpl });

    expect(result).toEqual({
      status: "filled",
      address: { street: "", neighborhood: "", city: "Campinas", state: "SP" },
    });
  });

  it("ViaCEP com erro cai na BrasilAPI", async () => {
    const fetchImpl = vi.fn<CepFetch>(async (url) => {
      if (url.startsWith("https://viacep.com.br/")) return ok({ erro: true });
      return ok({ street: "Rua X", neighborhood: "Centro", city: "Curitiba", state: "PR", location: { coordinates: {} } });
    });

    const result = await lookupCep("80010000", { fetchImpl });

    expect(result).toEqual({
      status: "filled",
      address: { street: "Rua X", neighborhood: "Centro", city: "Curitiba", state: "PR" },
    });
    expect(fetchImpl.mock.calls.map((call) => call[0])).toEqual([
      viaCepUrl("80010000"),
      brasilApiCepUrl("80010000"),
    ]);
  });

  it("as duas falhas devolvem falha", async () => {
    const fetchImpl = vi.fn<CepFetch>(async (url) => {
      if (url.startsWith("https://viacep.com.br/")) return { ok: false, json: async () => ({}) };
      throw new Error("fora");
    });

    await expect(lookupCep("00000000", { fetchImpl })).resolves.toEqual({ status: "failed" });
  });

  it("resposta do CEP anterior nao aplica no CEP novo", async () => {
    let current = "01001000";
    let release: (value: { ok: boolean; json: () => Promise<unknown> }) => void = () => undefined;
    const fetchImpl: CepFetch = () =>
      new Promise((resolve) => {
        release = resolve;
      });

    const pending = lookupCep("01001000", { fetchImpl, currentDigits: () => current });
    current = "20040000";
    release(ok(viaBody));

    await expect(pending).resolves.toEqual({ status: "aborted" });
  });

  it("a URL leva so os 8 digitos", async () => {
    const fetchImpl = vi.fn<CepFetch>(async () => ok(viaBody));
    await lookupCep("01001-000", { fetchImpl });

    expect(cepDigits("01001-000")).toBe("01001000");
    expect(viaCepUrl("01001000")).toBe("https://viacep.com.br/ws/01001000/json/");
    expect(brasilApiCepUrl("01001000")).toBe("https://brasilapi.com.br/api/cep/v2/01001000");
    expect(fetchImpl.mock.calls[0][0]).toBe("https://viacep.com.br/ws/01001000/json/");
    expect(fetchImpl.mock.calls[0][0]).not.toContain("?");
    expect(Object.keys(fetchImpl.mock.calls[0][1])).toEqual(["signal"]);
  });

  it("timeout aborta em 4 segundos", async () => {
    vi.useFakeTimers();
    const fetchImpl = vi.fn<CepFetch>(
      (_url, init) =>
        new Promise((_resolve, reject) => {
          init.signal.addEventListener("abort", () => reject(new Error("abort")));
        }),
    );

    const pending = lookupCep("01001000", { fetchImpl });
    await vi.advanceTimersByTimeAsync(CEP_LOOKUP_TIMEOUT_MS - 1);
    const firstSignal = fetchImpl.mock.calls[0][1].signal;
    expect(firstSignal.aborted).toBe(false);

    await vi.advanceTimersByTimeAsync(1);
    expect(firstSignal.aborted).toBe(true);
    expect(fetchImpl.mock.calls[1][0]).toBe(brasilApiCepUrl("01001000"));

    await vi.advanceTimersByTimeAsync(CEP_LOOKUP_TIMEOUT_MS);
    await expect(pending).resolves.toEqual({ status: "failed" });
    vi.useRealTimers();
  });

  it("estado por extenso nao vira sigla cortada", () => {
    expect(normalizeUf("sp")).toBe("SP");
    expect(normalizeUf("Sao Paulo")).toBe("Sao Paulo");
  });
});
