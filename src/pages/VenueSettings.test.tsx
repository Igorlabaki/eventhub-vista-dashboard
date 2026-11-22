import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { VenueDomainBlock } from "@/components/venue/VenueDomainBlock";
import VenueSettings from "@/pages/VenueSettings";
import { cepDigits } from "@/lib/cep-lookup";
import { applyVenueDomainRemove, applyVenueDomainSave, emptyVenueDomain, type VenueDomainUi } from "@/lib/venue-domain";
import { publicVenueLinksShareUrl } from "@/lib/public-venue-links";
import { useOrganizationStore } from "@/store/organizationStore";
import { useVenueStore } from "@/store/venueStore";

function renderSettings() {
  useOrganizationStore.setState({
    currentOrganization: { id: "org-1", name: "Goncalos Hub" } as never,
  });
  useVenueStore.setState({
    selectedVenue: {
      id: "venue-1",
      name: "AR756",
      organizationId: "org-1",
      email: "ar756sp@gmail.com",
      slogan: "O OASIS URBANO",
      description: "Um espaço reservado.",
      maxGuest: 120,
      street: "Rua das Flores",
      streetNumber: "10",
      neighborhood: "Centro",
      city: "Sao Paulo",
      state: "SP",
      cep: "01000-000",
    } as never,
  });

  expect(useOrganizationStore.getState().currentOrganization).toMatchObject({ id: "org-1" });

  const queryClient = new QueryClient();
  return renderToStaticMarkup(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={["/venue/venue-1/settings"]}>
        <Routes>
          <Route path="/venue/:id/settings" element={<VenueSettings />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>
  );
}

describe("Configuracoes do espaco em abas", () => {
  it("mostra as quatro abas e so os campos gerais na primeira", () => {
    const html = renderSettings();

    expect(html).toContain("GERAL");
    expect(html).toContain("ENDEREÇO");
    expect(html).toContain("PREÇOS");
    expect(html).toContain("REDES");
    expect(html).toContain("APRESENTAÇÃO");
    expect(html.indexOf("GERAL")).toBeLessThan(html.indexOf("bg-white rounded-lg"));
    expect(html).not.toContain(">Geral<");
    expect(html).toContain("Nome do Espaço");
    expect(html).toContain("Slogan");
    expect(html).toContain("Descrição");
    expect(html).not.toContain("Rua/Avenida");
    expect(html).not.toContain("data-address-fields");
    expect(html).not.toContain("Modelo de precificação");
    expect(html).not.toContain("URL do Instagram");
    expect(html).not.toContain("Proprietários");
    expect(html).toContain("Salvar Alterações");
    expect(html).toContain(">Voltar<");
  });

  it("a aba Redes fica no fundo da pagina, sem o card branco do formulario", () => {
    useOrganizationStore.setState({
      currentOrganization: { id: "org-1", name: "Goncalos Hub" } as never,
    });
    useVenueStore.setState({
      selectedVenue: {
        id: "venue-1",
        name: "AR756",
        organizationId: "org-1",
        email: "ar756sp@gmail.com",
      } as never,
    });
    const queryClient = new QueryClient();
    const html = renderToStaticMarkup(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={["/venue/venue-1/settings?aba=redes"]}>
          <Routes>
            <Route path="/venue/:id/settings" element={<VenueSettings />} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    );

    expect(html).toContain("REDES");
    expect(html).not.toContain("bg-white rounded-lg border shadow-sm");
    expect(html).not.toContain("Salvar Alterações");
    expect(html).not.toContain(">Deletar<");
  });

  it("a aba Endereco usa o bloco e o CEP salvo fica so com digitos", () => {
    useOrganizationStore.setState({
      currentOrganization: { id: "org-1", name: "Goncalos Hub" } as never,
    });
    useVenueStore.setState({
      selectedVenue: {
        id: "venue-1",
        name: "AR756",
        organizationId: "org-1",
        email: "ar756sp@gmail.com",
        maxGuest: 120,
        street: "Rua das Flores",
        streetNumber: "10",
        complement: "sala 2",
        neighborhood: "Centro",
        city: "Sao Paulo",
        state: "SP",
        cep: "01000-000",
      } as never,
    });
    const queryClient = new QueryClient();
    const html = renderToStaticMarkup(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={["/venue/venue-1/settings?aba=endereco"]}>
          <Routes>
            <Route path="/venue/:id/settings" element={<VenueSettings />} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>,
    );

    expect(html).toContain('data-address-fields="panel"');
    expect(html.indexOf(">CEP<")).toBeLessThan(html.indexOf(">Logradouro<"));
    expect(html).toContain("Complemento");
    expect(cepDigits("01000-000")).toBe("01000000");
  });
});

function domainMarkup(state: VenueDomainUi) {
  return renderToStaticMarkup(
    <VenueDomainBlock
      hostname={state.hostname}
      venueName="Casa"
      domain={state.domain}
      error={state.error}
      saved={state.saved}
      removed={state.removed}
      onHostnameChange={() => undefined}
      onSave={() => undefined}
      onRemove={() => undefined}
    />,
  );
}

describe("bloco Dominio na aba geral", () => {
  const empty: VenueDomainUi = {
    domain: emptyVenueDomain,
    hostname: "",
    error: null,
    saved: false,
    removed: false,
  };

  it("mostra Dominio vazio e nao oferece www.ar756.com", () => {
    const html = renderSettings();
    expect(html).toContain('data-venue-domain');
    expect(html).toContain("Domínio");
    expect(html).not.toContain("www.ar756.com");
    expect(html).not.toContain("Pendente");
  });

  it("a aba Redes nao traz o bloco", () => {
    useOrganizationStore.setState({
      currentOrganization: { id: "org-1", name: "Goncalos Hub" } as never,
    });
    useVenueStore.setState({
      selectedVenue: {
        id: "venue-1",
        name: "AR756",
        organizationId: "org-1",
      } as never,
    });
    const queryClient = new QueryClient();
    const html = renderToStaticMarkup(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={["/venue/venue-1/settings?aba=redes"]}>
          <Routes>
            <Route path="/venue/:id/settings" element={<VenueSettings />} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>,
    );
    expect(html).not.toContain("data-venue-domain");
  });

  it("salvar www.casa.com lista o redirect de /links e nao mostra desafio DNS", () => {
    const next = applyVenueDomainSave(empty, {
      ok: true,
      data: {
        hostname: "www.casa.com",
        status: "PENDING",
        verification: { type: "TXT", name: "_vercel.www.casa.com", value: "challenge-token" },
      },
    });
    const html = domainMarkup(next);
    expect(html).toContain("https://www.casa.com/links");
    expect(html).toContain("https://event-hub-dashboard.vercel.app/espaco/Casa/links");
    expect(html).toContain("https://www.casa.com/orcamento/{codigo}");
    expect(html).not.toContain("Desafio DNS");
    expect(html).not.toContain("cname.vercel-dns.com");
  });

  it("mostra o erro de hostname invalido", () => {
    const next = applyVenueDomainSave({ ...empty, hostname: "localhost" }, { ok: false, status: 400 });
    expect(domainMarkup(next)).toContain("Hostname invalido.");
  });

  it("retirar o dominio limpa o hostname e volta o link para a url padrao", () => {
    const saved = applyVenueDomainSave(empty, {
      ok: true,
      data: { hostname: "www.casa.com", status: "PENDING", verification: null },
    });
    expect(domainMarkup(saved)).toContain("Retirar domínio");
    const cleared = applyVenueDomainRemove(saved, { ok: true, data: emptyVenueDomain });
    expect(cleared.hostname).toBe("");
    expect(cleared.domain).toEqual(emptyVenueDomain);
    const html = domainMarkup(cleared);
    expect(html).toContain("Os links públicos voltaram às URLs padrão.");
    expect(html).toContain('value=""');
    expect(html).not.toContain("https://www.casa.com/links");
    expect(html).not.toContain("Retirar domínio");
    expect(publicVenueLinksShareUrl("Casa", null)).toBe(
      "https://event-hub-dashboard.vercel.app/espaco/Casa/links",
    );
  });

  it("403 ao retirar mantem o dominio salvo", () => {
    const saved = applyVenueDomainSave(empty, {
      ok: true,
      data: { hostname: "www.casa.com", status: "ACTIVE", verification: null },
    });
    const next = applyVenueDomainRemove(saved, { ok: false, status: 403 });
    expect(next.hostname).toBe("www.casa.com");
    expect(next.removed).toBe(false);
    expect(domainMarkup(next)).toContain("Sem permissão para retirar o domínio.");
    expect(domainMarkup(next)).toContain("https://www.casa.com/links");
  });

  it("403 nao troca o estado vazio por sucesso", () => {
    const next = applyVenueDomainSave(empty, { ok: false, status: 403 });
    expect(next.saved).toBe(false);
    expect(next.domain).toEqual(emptyVenueDomain);
    const html = domainMarkup(next);
    expect(html).toContain("Sem permissão para salvar o domínio.");
    expect(html).not.toContain("Pendente");
    expect(html).not.toContain("Domínio pendente de verificação.");
  });
});
