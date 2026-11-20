import { parsePhoneNumberFromString } from "libphonenumber-js";

export function canSendWhatsApp(phone: string | null | undefined, message: string): boolean {
  return Boolean(phone?.replace(/\D/g, "")) && Boolean(message.trim());
}

export function whatsAppUrl(rawPhone: string, message: string): string {
  const numeroLimpo = rawPhone.replace(/\D/g, "");
  const numeroComPlus = rawPhone.startsWith("+") ? rawPhone : `+${numeroLimpo}`;
  const phoneNumber = parsePhoneNumberFromString(numeroComPlus);
  const numeroFinal = phoneNumber && phoneNumber.isValid()
    ? phoneNumber.number.replace("+", "")
    : `55${numeroLimpo}`;

  return `https://wa.me/${numeroFinal}?text=${encodeURIComponent(message)}`;
}

export function openWhatsAppChat(rawPhone: string, message: string) {
  window.open(whatsAppUrl(rawPhone, message), "whatsapp");
}
