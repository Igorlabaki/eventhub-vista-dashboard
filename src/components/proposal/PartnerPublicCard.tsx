import type { CSSProperties } from "react";
import { FaEnvelope, FaFacebook, FaGlobe, FaInstagram, FaTiktok, FaWhatsapp } from "react-icons/fa";
import type { IconType } from "react-icons";
import { indicationLinks } from "@/lib/indication-links";
import { publicCardClass, publicValueClass } from "@/components/proposal/public-list-pattern";

const LINK_ICONS: Record<string, IconType> = {
  WhatsApp: FaWhatsapp,
  "E-mail": FaEnvelope,
  Instagram: FaInstagram,
  Facebook: FaFacebook,
  TikTok: FaTiktok,
  Site: FaGlobe,
};

export type PartnerPublicCardProps = {
  variant: "preview" | "public";
  name?: string | null;
  description?: string | null;
  logoUrl?: string | null;
  whatsapp?: string | null;
  email?: string | null;
  instagramUrl?: string | null;
  facebookUrl?: string | null;
  tiktokUrl?: string | null;
  url?: string | null;
  style?: CSSProperties;
  avatarStyle?: CSSProperties;
};

function initialOf(name?: string | null) {
  const text = name?.trim();
  if (!text) return "";
  return text[0]?.toUpperCase() ?? "";
}

export function PartnerPublicCard({
  variant,
  name,
  description,
  logoUrl,
  style,
  avatarStyle,
  ...links
}: PartnerPublicCardProps) {
  const preview = variant === "preview";
  const trimmedName = name?.trim() ?? "";
  const trimmedDescription = description?.trim() ?? "";
  const displayName = trimmedName || (preview ? "Seu nome" : "");
  const displayDescription = trimmedDescription || (preview ? "Descrição do serviço" : "");
  const photo = logoUrl?.trim() ?? "";
  const initial = initialOf(trimmedName);
  const icons = indicationLinks({ id: "partner-card", name: displayName, ...links });

  return (
    <article
      className={preview ? "rounded-xl border border-black/10 px-5 py-6" : `${publicCardClass} flex justify-center`}
      style={preview ? undefined : style}
    >
      <div className="mx-auto flex w-full max-w-xs flex-col items-center text-center">
        <div
          className={`flex h-[72px] w-[72px] items-center justify-center overflow-hidden rounded-full text-xl font-bold ${avatarStyle ? "" : "bg-neutral-200"}`}
          style={avatarStyle}
        >
          {photo ? <img src={photo} alt="" className="h-full w-full object-cover" /> : initial}
        </div>
        {displayName ? <p className={`${publicValueClass} mt-3`}>{displayName}</p> : null}
        {displayDescription ? (
          <p className={`mt-2 text-[14px] leading-[1.6] whitespace-pre-line break-words ${trimmedDescription ? "" : "opacity-60"}`}>
            {displayDescription}
          </p>
        ) : null}
        {icons.length > 0 ? (
          <div className="mt-4 flex flex-wrap justify-center gap-3">
            {icons.map((link) => {
              const Icon = LINK_ICONS[link.label];
              const glyph = Icon ? <Icon size={18} aria-hidden /> : link.label;
              return (
                <a
                  key={link.label}
                  href={link.href}
                  aria-label={link.label}
                  title={link.label}
                  className="inline-flex opacity-80 transition-transform hover:scale-110 hover:opacity-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 active:scale-95"
                  {...(link.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                >
                  {glyph}
                </a>
              );
            })}
          </div>
        ) : null}
      </div>
    </article>
  );
}
