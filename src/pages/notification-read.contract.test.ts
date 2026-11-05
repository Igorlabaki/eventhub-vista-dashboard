import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

function source(path: string) {
  return readFileSync(resolve(process.cwd(), path), "utf8");
}

describe("leitura de notificacoes no painel", () => {
  it("a lista nao filtra no navegador e o botao nao depende do card", () => {
    const page = source("src/pages/VenueNotifications.tsx");
    expect(page).not.toContain("FilterList");
    expect(page).toContain("summary: true");
    expect(page).toContain("Marcar todas como lidas");
    expect(page).not.toContain("summary?.unread");
    expect(page).toContain("!notification.isRead");
  });

  it("so o detalhe do painel marca o orcamento como lido", () => {
    const details = source("src/pages/ProposalDetails.tsx");
    const eventLink = source("src/pages/ProposalEventLink.tsx");
    const presentation = source("src/pages/ProposalView.tsx");
    expect(details).toContain("markReadByProposal");
    expect(details).toContain(".catch(() => undefined)");
    expect(eventLink).not.toContain("markReadByProposal");
    expect(eventLink).not.toContain("notificationService");
    expect(presentation).not.toContain("markReadByProposal");
    expect(presentation).not.toContain("notificationService");
  });
});
