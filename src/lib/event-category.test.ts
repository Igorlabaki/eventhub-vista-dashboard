import { describe, expect, it } from "vitest";
import { EventCategory, ProposalType } from "@/types/proposal";
import { EVENT_CATEGORY_OPTIONS, eventCategoryForPayload, proposalTypeWithCategoryLabel } from "./event-category";

describe("categoria do evento", () => {
    it("lista as seis categorias na ordem da spec", () => {
        expect(EVENT_CATEGORY_OPTIONS.map((option) => option.label)).toEqual([
            "Empresarial / confraternização",
            "Aniversário",
            "Despedida de solteiro",
            "Casamento",
            "Coffee break",
            "Outro",
        ]);
    });

    it("envia a categoria so quando o tipo e evento", () => {
        expect(eventCategoryForPayload(ProposalType.EVENT, EventCategory.BIRTHDAY)).toBe(EventCategory.BIRTHDAY);
        expect(eventCategoryForPayload(ProposalType.PRODUCTION, EventCategory.BIRTHDAY)).toBeNull();
        expect(eventCategoryForPayload(ProposalType.EVENT, undefined)).toBeNull();
    });

    it("junta tipo e categoria no detalhe", () => {
        expect(proposalTypeWithCategoryLabel("EVENT", "BIRTHDAY")).toBe("Evento · Aniversário");
        expect(proposalTypeWithCategoryLabel("EVENT", null)).toBe("Evento");
        expect(proposalTypeWithCategoryLabel("PRODUCTION", "BIRTHDAY")).toBe("Produção");
        expect(proposalTypeWithCategoryLabel("DESCONHECIDO", null)).toBe("DESCONHECIDO");
    });
});
