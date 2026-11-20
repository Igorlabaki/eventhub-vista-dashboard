import { describe, expect, it } from "vitest";
import { canSendWhatsApp, whatsAppUrl } from "./whatsapp-link";

describe("whatsAppUrl", () => {
  it("monta o link com o texto e cai no DDI 55 quando o numero nao e valido sozinho", () => {
    expect(whatsAppUrl("11988887777", "Olá")).toBe("https://wa.me/5511988887777?text=Ol%C3%A1");
  });

  it("aceita numero que ja vem com DDI", () => {
    expect(whatsAppUrl("+5511988887777", "Oi")).toBe("https://wa.me/5511988887777?text=Oi");
  });

  it("nao envia sem telefone ou com a mensagem vazia", () => {
    expect(canSendWhatsApp("", "Olá")).toBe(false);
    expect(canSendWhatsApp("11988887777", "   ")).toBe(false);
    expect(canSendWhatsApp("11988887777", "Olá")).toBe(true);
  });
});
