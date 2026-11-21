import { renderToStaticMarkup } from "react-dom/server";
import { useForm } from "react-hook-form";
import { describe, expect, it } from "vitest";
import { Form } from "@/components/ui/form";
import { AddressFields } from "./AddressFields";
import {
  ADDRESS_LABELS,
  CEP_LOOKUP_ERROR,
  applyAddressLookup,
  applyUfChoice,
  requestsLookup,
  type AddressValues,
} from "./address-fields-model";
import { ibgeMunicipiosUrl } from "./load-municipalities";

const previous: AddressValues = {
  cep: "01001000",
  street: "Rua das Flores",
  streetNumber: "10",
  complement: "sala 2",
  neighborhood: "Centro",
  city: "São Paulo",
  state: "SP",
};

const names = {
  cep: "cep",
  street: "street",
  streetNumber: "streetNumber",
  complement: "complement",
  neighborhood: "neighborhood",
  city: "city",
  state: "state",
};

function Harness({
  variant,
  scope,
  stateOverride,
  inputClassName,
}: {
  variant: "panel" | "public";
  scope?: "full" | "cityState";
  stateOverride?: { loading: boolean; error: string | null; widgets: { city: "input" | "select"; state: "input" | "select"; cityOptions: string[] } };
  inputClassName?: string;
}) {
  const form = useForm({
    defaultValues: {
      cep: "",
      street: "Rua das Flores",
      streetNumber: "10",
      complement: "sala 2",
      neighborhood: "Centro",
      city: "São Paulo",
      state: "SP",
    },
  });
  return (
    <Form {...form}>
      <AddressFields
        variant={variant}
        scope={scope}
        names={scope === "cityState" ? { city: "city", state: "state" } : names}
        inputClassName={inputClassName}
        stateOverride={stateOverride}
      />
    </Form>
  );
}

describe("bloco de endereco", () => {
  it("mostra CEP, logradouro, numero, complemento, bairro, cidade e UF nessa ordem", () => {
    const html = renderToStaticMarkup(<Harness variant="panel" />);
    let cursor = -1;
    for (const label of ADDRESS_LABELS) {
      const at = html.indexOf(label);
      expect(at).toBeGreaterThan(cursor);
      cursor = at;
    }
    expect(html).toContain('data-address-fields="panel"');
    expect(html).not.toContain("Buscando CEP...");
  });

  it("a variante publica usa a classe recebida e o mesmo bloco", () => {
    const html = renderToStaticMarkup(<Harness variant="public" inputClassName="campo-publico" />);
    expect(html).toContain('data-address-fields="public"');
    expect(html).toContain("campo-publico");
    expect(html).toContain("Logradouro");
  });

  it("o modo local de CEP nao pede logradouro", () => {
    const html = renderToStaticMarkup(<Harness variant="panel" scope="cityState" />);
    expect(html).toContain('data-address-scope="cityState"');
    expect(html).toContain("CEP");
    expect(html).not.toContain("Logradouro");
  });

  it("durante a espera mostra Buscando CEP e mantem o que ja estava digitado", () => {
    const html = renderToStaticMarkup(
      <Harness variant="panel" stateOverride={{ loading: true, error: null, widgets: { city: "input", state: "input", cityOptions: [] } }} />,
    );
    expect(html).toContain("Buscando CEP...");
    expect(html).toContain("Rua das Flores");
    expect(html).toContain("sala 2");
  });

  it("erro no CEP nao apaga os campos", () => {
    const next = applyAddressLookup(previous, { status: "failed" }, ["São Paulo"]);
    expect(next.error).toBe(CEP_LOOKUP_ERROR);
    expect(next.values.street).toBe("Rua das Flores");
    expect(next.values.streetNumber).toBe("10");
    expect(next.values.complement).toBe("sala 2");
    expect(next.values.neighborhood).toBe("Centro");
    expect(next.values.city).toBe("São Paulo");
    expect(next.widgets.state).toBe("select");
    expect(next.widgets.city).toBe("select");

    const html = renderToStaticMarkup(
      <Harness
        variant="public"
        stateOverride={{ loading: false, error: CEP_LOOKUP_ERROR, widgets: next.widgets }}
      />,
    );
    expect(html).toContain(CEP_LOOKUP_ERROR);
    expect(html).toContain("Rua das Flores");
    expect(html).toContain('aria-label="Cidade"');
    expect(html).toContain('aria-label="Estado"');
  });

  it("sucesso com rua deixa cidade e UF como input", () => {
    const next = applyAddressLookup(
      previous,
      { status: "filled", address: { street: "Praça da Sé", neighborhood: "Sé", city: "São Paulo", state: "sp" } },
      ["São Paulo"],
    );
    expect(next.widgets).toEqual({ city: "input", state: "input", cityOptions: [] });
    expect(next.values.street).toBe("Praça da Sé");
    expect(next.values.state).toBe("SP");
    expect(next.values.streetNumber).toBe("10");
    expect(next.values.complement).toBe("sala 2");
  });

  it("sucesso sem rua nem bairro zera os dois e abre o select de cidade", () => {
    const next = applyAddressLookup(
      previous,
      { status: "filled", address: { street: "", neighborhood: "", city: "Campinas", state: "SP" } },
      ["Campinas", "São Paulo"],
    );
    expect(next.values.street).toBe("");
    expect(next.values.neighborhood).toBe("");
    expect(next.values.city).toBe("Campinas");
    expect(next.widgets.city).toBe("select");
    expect(next.widgets.state).toBe("input");
  });

  it("falha sem sigla abre so o select de UF", () => {
    const next = applyAddressLookup({ ...previous, state: "Sao Paulo" }, { status: "failed" }, ["Sao Paulo"]);
    expect(next.values.state).toBe("Sao Paulo");
    expect(next.widgets.state).toBe("select");
    expect(next.widgets.city).toBe("input");
  });

  it("IBGE falho devolve o input de cidade", () => {
    const next = applyAddressLookup(previous, { status: "failed" }, null);
    expect(next.widgets.city).toBe("input");
    expect(next.widgets.state).toBe("select");
    const chosen = applyUfChoice(previous, "rj", null, CEP_LOOKUP_ERROR);
    expect(chosen.values.state).toBe("RJ");
    expect(chosen.widgets.city).toBe("input");
  });

  it("valor inicial igual nao dispara busca e o CEP fica so com digitos", () => {
    expect(requestsLookup("", "")).toBeNull();
    expect(requestsLookup("01001000", "01001-000")).toBeNull();
    expect(requestsLookup("", "01001-000")).toBe("01001000");
  });

  it("a lista do IBGE pede so a sigla", () => {
    expect(ibgeMunicipiosUrl("SP")).toBe("https://servicodados.ibge.gov.br/api/v1/localidades/estados/SP/municipios");
    expect(ibgeMunicipiosUrl("SP")).not.toContain("?");
  });
});
