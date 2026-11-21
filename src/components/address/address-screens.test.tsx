import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { CreateVenueForm } from "@/components/venue/CreateVenueForm";
import { EditVenueForm } from "@/components/organization/venue-web/EditVenueForm";
import { OwnerForm } from "@/components/owner/OwnerForm";
import PFContractForm from "@/components/proposal/forms/pf-contract-form";
import PJContractForm from "@/components/proposal/forms/pj-contract-form";
import PFContractPersonalInfoForm from "@/components/proposal/forms/PFContractPersonalInfoForm";
import PJContractPersonalInfoForm from "@/components/proposal/forms/PJContractPersonalInfoForm";
import { useProposalStore } from "@/store/proposalStore";
import { cepDigits } from "@/lib/cep-lookup";

const surface = { cardStyle: {}, inputClassName: "campo-publico" };

describe("endereco nas telas do espaco", () => {
  it("criar espaco mostra o bloco no lugar dos inputs soltos", () => {
    const html = renderToStaticMarkup(
      <CreateVenueForm organizationId="org-1" userId="user-1" />,
    );
    expect(html).toContain('data-address-fields="panel"');
    expect(html.indexOf(">CEP<")).toBeLessThan(html.indexOf(">Logradouro<"));
    expect(html).not.toContain("Rua/Avenida*");
    expect(cepDigits("01001-000")).toBe("01001000");
  });

  it("o site da organizacao pede CEP so para cidade e UF", () => {
    const html = renderToStaticMarkup(
      <EditVenueForm
        venue={{ id: "venue-1", name: "AR756", city: "Sao Paulo", state: "SP" } as never}
        onCancel={() => undefined}
      />,
    );
    expect(html).toContain('data-address-scope="cityState"');
    expect(html).not.toContain("Logradouro");
    expect(html).not.toContain('name="cep"');
  });

  it("o proprietario usa o bloco inteiro", () => {
    const html = renderToStaticMarkup(<OwnerForm organizationId="org-1" onCancel={() => undefined} />);
    expect(html).toContain('data-address-fields="panel"');
    expect(html).toContain("Logradouro");
    expect(html).toContain("Nome do Banco");
  });

  it("o contrato do painel PF e PJ usa o bloco", () => {
    useProposalStore.setState({
      currentProposal: { city: "São Paulo", state: "SP", cep: "", totalAmount: 1000 } as never,
    });
    const pf = renderToStaticMarkup(<PFContractForm />);
    const pj = renderToStaticMarkup(<PJContractForm />);
    expect(pf).toContain('data-address-fields="panel"');
    expect(pj).toContain('data-address-fields="panel"');
    expect(pf.indexOf(">CEP<")).toBeLessThan(pf.indexOf(">Logradouro<"));
    expect(pj).not.toContain("Buscando CEP...");
  });

  it("o contrato publico PF e PJ usa o bloco e nao busca so por nascer em Sao Paulo", () => {
    useProposalStore.setState({
      currentProposal: { city: "São Paulo", state: "SP", cep: "" } as never,
    });
    const pf = renderToStaticMarkup(<PFContractPersonalInfoForm surface={surface} />);
    const pj = renderToStaticMarkup(<PJContractPersonalInfoForm surface={surface} />);
    expect(pf).toContain('data-address-fields="public"');
    expect(pj).toContain('data-address-fields="public"');
    expect(pf).not.toContain("Buscando CEP...");
    expect(pj).not.toContain("Buscando CEP...");
    expect(pf.indexOf(">CEP<")).toBeLessThan(pf.indexOf(">Logradouro<"));
    expect(cepDigits("")).toBe("");
  });
});
