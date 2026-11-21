import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, expect, it } from "vitest";
import VenueSettings from "@/pages/VenueSettings";
import { cepDigits } from "@/lib/cep-lookup";
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
