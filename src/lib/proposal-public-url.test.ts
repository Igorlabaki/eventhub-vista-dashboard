import { readFileSync } from "fs";
import { describe, expect, it } from "vitest";
import {
  PROPOSAL_CLIENT_PUBLIC_ROUTES,
  proposalClientPath,
  proposalClientUrl,
  proposalPublicLabel,
  publicContractKind,
} from "./proposal-public-url";

const link = {
  venueName: "AR756",
  clientName: "Maria Silva",
  publicCode: "k7m2abcd",
  proposalId: "7a6974ae-d08f-4b9b-97a4-ccf3998aa7e7",
};

describe("proposal client url", () => {
  it("builds Maria Silva at AR756 with an 8 character code", () => {
    expect(proposalClientPath(link)).toBe("/espaco/AR756/orcamento/maria-silva-k7m2abcd");
    expect(proposalClientUrl(link)).toBe(
      "https://event-hub-dashboard.vercel.app/espaco/AR756/orcamento/maria-silva-k7m2abcd",
    );
    expect(link.publicCode).toHaveLength(8);
    expect(proposalClientUrl(link, undefined, undefined, "www.casa.com")).toBe(
      "https://www.casa.com/orcamento/maria-silva-k7m2abcd",
    );
    expect(proposalClientUrl(link, "convidados", undefined, "www.casa.com")).toBe(
      "https://www.casa.com/orcamento/maria-silva-k7m2abcd/convidados",
    );
    expect(proposalClientUrl({ ...link, publicCode: "" }, undefined, undefined, "www.casa.com")).toBe(
      "https://event-hub-dashboard.vercel.app/proposal/7a6974ae-d08f-4b9b-97a4-ccf3998aa7e7/view",
    );
  });

  it("omits the label when the name is empty", () => {
    expect(proposalClientPath({ ...link, clientName: "   " })).toBe("/espaco/AR756/orcamento/k7m2abcd");
  });

  it("turns José da Silva into jose-da-silva", () => {
    expect(proposalPublicLabel("José da Silva")).toBe("jose-da-silva");
    expect(proposalClientPath({ ...link, clientName: "José da Silva" })).toBe(
      "/espaco/AR756/orcamento/jose-da-silva-k7m2abcd",
    );
  });

  it("uses the portuguese suffixes and one contract path", () => {
    expect(proposalClientPath(link, "evento")).toBe("/espaco/AR756/orcamento/maria-silva-k7m2abcd/evento");
    expect(proposalClientPath(link, "convidados")).toContain("/convidados");
    expect(proposalClientPath(link, "colaboradores")).toContain("/colaboradores");
    expect(proposalClientPath(link, "programacao")).toContain("/programacao");
    expect(proposalClientPath(link, "indicacoes")).toContain("/indicacoes");
    expect(proposalClientPath(link, "contrato")).toBe("/espaco/AR756/orcamento/maria-silva-k7m2abcd/contrato");
  });

  it("keeps person and company on the same contract address", () => {
    expect(publicContractKind({ cnpj: "" })).toBe("pf");
    expect(publicContractKind({ cnpj: "123" })).toBe("pj");
    expect(proposalClientPath(link, "contrato")).toBe(proposalClientPath({ ...link, clientName: "Casa Ltda" }, "contrato").replace("casa-ltda", "maria-silva"));
  });

  it("registers the new paths and keeps the old proposal routes", () => {
    const app = readFileSync("src/App.tsx", "utf8");
    const axios = readFileSync("src/lib/axios.ts", "utf8");
    const bootstrap = readFileSync("src/hooks/useBootstrapUser.ts", "utf8");
    for (const route of PROPOSAL_CLIENT_PUBLIC_ROUTES) {
      expect(axios).toContain(route);
      expect(bootstrap).toContain(route);
    }
    expect(app).toContain('path="/espaco/:venueName/orcamento/:ref"');
    expect(app).toContain('path="/espaco/:venueName/orcamento/:ref/contrato"');
    expect(app).toContain('path="/proposal/:id/view"');
    expect(app).toContain('path="/proposal/:id/person-contract"');
    expect(app).toContain('path="/proposal/:id"');
  });
});
