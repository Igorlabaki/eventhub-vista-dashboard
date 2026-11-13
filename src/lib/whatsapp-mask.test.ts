import { describe, expect, it } from "vitest";
import { formatWhatsapp } from "./whatsapp-mask";

describe("mascara do whatsapp", () => {
    it("formata enquanto digita, no mesmo formato gravado no orcamento", () => {
        expect(formatWhatsapp("")).toBe("");
        expect(formatWhatsapp("1")).toBe("(1");
        expect(formatWhatsapp("11")).toBe("(11");
        expect(formatWhatsapp("119")).toBe("(11) 9");
        expect(formatWhatsapp("1199999")).toBe("(11) 99999-");
        expect(formatWhatsapp("11999998888")).toBe("(11) 99999-8888");
    });

    it("ignora o que nao e digito e corta em 11 digitos", () => {
        expect(formatWhatsapp("(11) 99999-8888")).toBe("(11) 99999-8888");
        expect(formatWhatsapp("+55 11 99999-8888")).toBe("(55) 11999-9988");
        expect(formatWhatsapp("119999988887777")).toBe("(11) 99999-8888");
        expect(formatWhatsapp("abc")).toBe("");
    });
});
