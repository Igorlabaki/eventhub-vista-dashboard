export type IndicationCard = {
  id: string;
  name: string;
  role?: string | null;
  whatsapp?: string | null;
  email?: string | null;
  instagramUrl?: string | null;
  facebookUrl?: string | null;
  tiktokUrl?: string | null;
  url?: string | null;
};

export type IndicationLink = {
  label: string;
  href: string;
  external: boolean;
};

function filled(value?: string | null) {
  const text = value?.trim();
  return text ? text : null;
}

function absoluteHttp(value: string) {
  if (/^https?:\/\//i.test(value)) return value;
  if (value.startsWith("//")) return `https:${value}`;
  return `https://${value.replace(/^\/+/, "")}`;
}

function profileHref(value: string, host: "instagram.com" | "facebook.com" | "www.tiktok.com") {
  if (/^https?:\/\//i.test(value) || value.startsWith("//")) return absoluteHttp(value);
  const bare = value.replace(/^@/, "").replace(/^\/+/, "");
  if (/^(www\.)?(instagram|facebook|tiktok)\.com\b/i.test(bare) || bare.includes("/")) {
    return absoluteHttp(bare);
  }
  if (host === "www.tiktok.com") return `https://www.tiktok.com/@${bare}`;
  return `https://${host}/${bare}`;
}

export function indicationLinks(item: IndicationCard): IndicationLink[] {
  const links: IndicationLink[] = [];
  const digits = (item.whatsapp ?? "").replace(/\D/g, "");
  if (digits) links.push({ label: "WhatsApp", href: `https://wa.me/${digits}`, external: true });
  const email = filled(item.email);
  if (email) links.push({ label: "E-mail", href: `mailto:${email}`, external: false });
  const instagram = filled(item.instagramUrl);
  if (instagram) links.push({ label: "Instagram", href: profileHref(instagram, "instagram.com"), external: true });
  const facebook = filled(item.facebookUrl);
  if (facebook) links.push({ label: "Facebook", href: profileHref(facebook, "facebook.com"), external: true });
  const tiktok = filled(item.tiktokUrl);
  if (tiktok) links.push({ label: "TikTok", href: profileHref(tiktok, "www.tiktok.com"), external: true });
  const site = filled(item.url);
  if (site) links.push({ label: "Site", href: absoluteHttp(site), external: true });
  return links;
}
