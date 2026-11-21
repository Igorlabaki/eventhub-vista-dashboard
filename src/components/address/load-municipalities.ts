import type { CepFetch } from "@/lib/cep-lookup";

const cache = new Map<string, string[]>();

export function ibgeMunicipiosUrl(uf: string): string {
  return `https://servicodados.ibge.gov.br/api/v1/localidades/estados/${uf}/municipios`;
}

export function resetMunicipalityCache(): void {
  cache.clear();
}

export async function loadMunicipalities(
  uf: string,
  fetchImpl: CepFetch,
  signal: AbortSignal,
): Promise<string[] | null> {
  const key = uf.trim().toUpperCase();
  if (!/^[A-Z]{2}$/.test(key)) return null;
  const hit = cache.get(key);
  if (hit) return hit;
  try {
    const response = await fetchImpl(ibgeMunicipiosUrl(key), { signal });
    if (!response.ok) return null;
    const body = await response.json();
    if (!Array.isArray(body)) return null;
    const names = body.flatMap((item) => {
      if (!item || typeof item !== "object") return [];
      const nome = (item as { nome?: unknown }).nome;
      return typeof nome === "string" && nome.trim() ? [nome.trim()] : [];
    });
    cache.set(key, names);
    return names;
  } catch {
    return null;
  }
}
