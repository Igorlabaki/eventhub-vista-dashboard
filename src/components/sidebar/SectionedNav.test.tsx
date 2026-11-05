import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter } from "react-router-dom";
import { LayoutDashboard } from "lucide-react";
import { describe, expect, it } from "vitest";
import { SectionedNav } from "./SectionedNav";

const icon = LayoutDashboard;

function markup(pathname: string, collapsed = false) {
  return renderToStaticMarkup(
    <MemoryRouter>
      <SectionedNav
        heading="AR756"
        sections={[
          {
            id: "dia-a-dia",
            title: "Dia a dia",
            alwaysOpen: true,
            items: [{ title: "Visão Geral", href: "/venue/1", icon }],
          },
          {
            id: "comercial",
            title: "Comercial",
            alwaysOpen: false,
            items: [{ title: "Serviços", href: "/venue/1/services", icon }],
          },
          {
            id: "a-casa",
            title: "A casa",
            alwaysOpen: false,
            items: [{ title: "Regras", href: "/venue/1/rules", icon }],
          },
        ]}
        settings={{ title: "Configurações", href: "/venue/1/settings", icon }}
        isCollapsed={collapsed}
        collapsedMode="always-open"
        isActive={(href) => href === pathname}
        onNavigate={() => undefined}
      />
    </MemoryRouter>,
  );
}

describe("SectionedNav", () => {
  it("mostra todos os grupos abertos e o nome do registro acima dos rotulos", () => {
    const html = markup("/venue/1/rules");

    expect(html).toContain("Dia a dia");
    expect(html).toContain("Visão Geral");
    expect(html).toContain("Serviços");
    expect(html).toContain(">Regras<");
    expect(html).not.toContain("aria-expanded");
    expect(html).not.toContain('data-state="closed"');
    expect(html).toContain('data-nav-settings="true"');

    const headingClass = html.match(/data-nav-heading="true" class="([^"]+)"/)?.[1] ?? "";
    expect(html).toContain(">AR756<");
    expect(headingClass).toContain("text-gray-900");
    expect(headingClass).toContain("normal-case");
    expect(headingClass).not.toContain("uppercase");
  });

  it("abre um item externo em outra aba, fora da rota interna", () => {
    const html = renderToStaticMarkup(
      <MemoryRouter>
        <SectionedNav
          sections={[
            {
              id: "falar",
              title: "Falar com o cliente",
              alwaysOpen: true,
              items: [
                {
                  title: "Link do evento",
                  href: "https://event-hub-dashboard.vercel.app/proposal/proposal-1/links",
                  icon,
                  external: true,
                },
              ],
            },
          ]}
          isCollapsed={false}
          collapsedMode="always-open"
          isActive={() => false}
          onNavigate={() => undefined}
        />
      </MemoryRouter>,
    );

    expect(html).toContain('href="https://event-hub-dashboard.vercel.app/proposal/proposal-1/links"');
    expect(html).toContain('target="_blank"');
    expect(html).toContain('rel="noopener noreferrer"');
    expect(html).not.toContain("/event-link");
    expect(html).not.toContain("localhost");
  });

  it("no modo recolhido mostra o dia a dia e configuracoes, sem os outros grupos", () => {
    const html = markup("/venue/1", true);

    expect(html).toContain("Visão Geral");
    expect(html).toContain("Configurações");
    expect(html).not.toContain("Comercial");
    expect(html).not.toContain("Serviços");
    expect(html).not.toContain("Regras");
  });
});
