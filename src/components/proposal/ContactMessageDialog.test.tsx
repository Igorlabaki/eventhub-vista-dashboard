import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { Dialog } from "@/components/ui/dialog";
import { ContactMessageFields } from "./ContactMessageDialog";
import { proposalShareMessage } from "./SendProposalDialog";

describe("ContactMessageFields", () => {
  it("mostra a saudacao editavel e trava o envio sem WhatsApp", () => {
    const html = renderToStaticMarkup(
      <Dialog open>
        <ContactMessageFields
          onSent={() => undefined}
          username="Igor Augusto Labaki"
          venueName="AR756"
          phone=""
        />
      </Dialog>,
    );

    expect(html).toContain("Olá, sou Igor Augusto Labaki, do espaço AR756! Tudo bem com você?");
    expect(html).toContain("Enviar via WhatsApp");
    expect(html).toMatch(/<button[^>]*disabled[^>]*>[\s\S]*Enviar via WhatsApp/);
  });

  it("mantem o nome do cliente e o link na mensagem do orcamento", () => {
    const message = proposalShareMessage({
      clientName: "Angela Melissa",
      proposalId: "proposal-1",
      venueName: "AR756",
      publicCode: "k7m2",
    });

    expect(message).toContain("Olá Angela Melissa");
    expect(message).toContain("/espaco/AR756/orcamento/angela-melissa-k7m2");
    expect(message).toContain("Equipe AR756");
  });
});
