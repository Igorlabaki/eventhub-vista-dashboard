import { useEffect, useState, type CSSProperties, type ReactNode } from "react";
import { Calendar } from "lucide-react";
import { FaFacebook, FaGlobe, FaInstagram, FaTiktok, FaWhatsapp } from "react-icons/fa";
import { EVENTHUB_TAB_TITLE, venueTabTitle } from "@/lib/venue-tab-title";
import type { Venue } from "@/types/venue";

const PUBLIC_LOADING_BACKGROUND = "#111315";
const PUBLIC_LOADING_TEXT = "#f7f7f5";
const LOGO_READY_WAIT_MS = 8000;
const PUBLIC_PAGE_FONT = "font-['Manrope',sans-serif]";

export type PublicListSurface = {
  cardStyle: CSSProperties;
  buttonStyle?: CSSProperties;
  inputClassName: string;
};

type ListVariant = "people" | "schedule";

function preloadManrope() {
  if (typeof document === "undefined" || !document.fonts?.load) return Promise.resolve();
  return Promise.all(
    [400, 500, 700, 800].map((weight) =>
      document.fonts.load(`${weight} 16px Manrope`).catch(() => undefined)
    )
  ).then(() => undefined);
}

function preloadImage(url: string) {
  return new Promise<void>((resolve) => {
    const img = new Image();
    const finish = () => resolve();
    img.onload = () => {
      if (typeof img.decode === "function") {
        img.decode().then(finish).catch(finish);
        return;
      }
      finish();
    };
    img.onerror = finish;
    img.src = url;
  });
}

function surfaceIsDark(color: string) {
  const match = color.trim().match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i);
  if (!match) return true;
  let hex = match[1];
  if (hex.length === 3) hex = hex.split("").map((char) => char + char).join("");
  const red = parseInt(hex.slice(0, 2), 16);
  const green = parseInt(hex.slice(2, 4), 16);
  const blue = parseInt(hex.slice(4, 6), 16);
  return (0.299 * red + 0.587 * green + 0.114 * blue) / 255 < 0.55;
}

function boneTone(color: string) {
  return surfaceIsDark(color) ? "bg-white/30" : "bg-black/10";
}

function Bone({ className, tone }: { className: string; tone: string }) {
  return <div className={`motion-safe:animate-pulse rounded-md ${tone} ${className}`} />;
}

function venueSocials(venue: Venue | null) {
  if (!venue) return [];
  return [
    venue.whatsappNumber
      ? {
          href: `https://wa.me/${venue.whatsappNumber.replace(/\D/g, "")}`,
          label: "WhatsApp",
          icon: FaWhatsapp,
        }
      : null,
    venue.facebookUrl ? { href: venue.facebookUrl, label: "Facebook", icon: FaFacebook } : null,
    venue.tiktokUrl ? { href: venue.tiktokUrl, label: "TikTok", icon: FaTiktok } : null,
    venue.instagramUrl ? { href: venue.instagramUrl, label: "Instagram", icon: FaInstagram } : null,
    venue.url ? { href: venue.url, label: "Site", icon: FaGlobe } : null,
  ].filter((item) => item !== null);
}

function venueShowsFooter(venue: Venue | null) {
  if (!venue) return false;
  return Boolean(venue.logoUrl || venueSocials(venue).length > 0);
}

function ListSkeleton({
  venue,
  shaped,
  variant,
}: {
  venue: Venue | null;
  shaped: boolean;
  variant: ListVariant;
}) {
  const background = shaped ? venue?.proposalPrimaryColor || PUBLIC_LOADING_BACKGROUND : PUBLIC_LOADING_BACKGROUND;
  const color = shaped ? venue?.proposalTextColor || PUBLIC_LOADING_TEXT : PUBLIC_LOADING_TEXT;
  const cardBackground = shaped ? venue?.proposalSecondaryColor || "#ffffff" : null;
  const cardText = shaped ? venue?.proposalTextColor || "#181818" : color;
  const cardStyle = cardBackground ? { backgroundColor: cardBackground, color: cardText } : undefined;
  const cardShell = cardBackground ? "" : "bg-white/10";
  const footerBackground = shaped ? venue?.proposalSecondaryColor || "#4f46e5" : "#4f46e5";
  const footerText = shaped ? venue?.proposalTextColor || "#ffffff" : "#ffffff";
  const pageTone = boneTone(background);
  const cardTone = cardBackground ? boneTone(cardBackground) : pageTone;
  const footerTone = boneTone(footerBackground);
  const showFooter = shaped ? venueShowsFooter(venue) : true;
  const fieldCount = variant === "schedule" ? 4 : 2;

  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      className={`flex min-h-screen flex-col ${PUBLIC_PAGE_FONT}`}
      style={{ backgroundColor: background, color }}
    >
      <span className="sr-only">Carregando</span>
      <main className="flex flex-1 flex-col px-2 py-14 md:px-8">
        <div className="mb-10 flex w-full flex-col items-center justify-center gap-4" aria-hidden>
          <Bone tone={pageTone} className="h-16 w-48 max-w-full" />
          {venue?.description?.trim() ? (
            <>
              <Bone tone={pageTone} className="h-4 w-full max-w-2xl" />
              <Bone tone={pageTone} className="h-4 w-4/5 max-w-xl" />
            </>
          ) : null}
        </div>
        <div className="mx-auto flex w-full max-w-3xl flex-col gap-5" aria-hidden>
          <section className={`rounded-xl p-5 shadow-lg ${cardShell}`} style={cardStyle}>
            <Bone tone={cardTone} className="h-3 w-28" />
            <Bone tone={cardTone} className="mt-3 h-6 w-48" />
            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
              {Array.from({ length: fieldCount }, (_, index) => (
                <div key={index}>
                  <Bone tone={cardTone} className="h-3 w-24" />
                  <Bone tone={cardTone} className="mt-2 h-10 w-full" />
                </div>
              ))}
            </div>
            {variant === "schedule" ? (
              <>
                <Bone tone={cardTone} className="mt-4 h-3 w-40" />
                <Bone tone={cardTone} className="mt-2 h-24 w-full" />
              </>
            ) : null}
            <div className="mt-5 flex justify-end border-t border-current/15 pt-5">
              <Bone tone={cardTone} className="h-9 w-40 rounded-full" />
            </div>
          </section>
          <section className={`rounded-xl p-5 shadow-lg ${cardShell}`} style={cardStyle}>
            <Bone tone={cardTone} className="h-6 w-40" />
            <Bone tone={cardTone} className="mt-4 h-10 w-full" />
            <Bone tone={cardTone} className="mt-3 h-14 w-full" />
          </section>
        </div>
      </main>
      {showFooter && (
        <footer
          className="flex w-full flex-col gap-3 px-6 py-8"
          style={{ backgroundColor: footerBackground, color: footerText }}
          aria-hidden
        >
          <Bone tone={footerTone} className="h-12 w-40" />
        </footer>
      )}
    </div>
  );
}

export function PublicVenueListShell({
  venue,
  contentReady,
  variant,
  children,
}: {
  venue: Venue | null;
  contentReady: boolean;
  variant: ListVariant;
  children: (surface: PublicListSurface) => ReactNode;
}) {
  const waitKey = venue?.id ?? (contentReady ? "sem-espaco" : null);
  const [readyKey, setReadyKey] = useState<string | null>(null);

  useEffect(() => {
    document.title = venue?.name ? venueTabTitle(venue.name, venue.description) : EVENTHUB_TAB_TITLE;
    return () => {
      document.title = EVENTHUB_TAB_TITLE;
    };
  }, [venue?.name, venue?.description]);

  useEffect(() => {
    if (!waitKey || readyKey === waitKey) return;
    let cancelled = false;
    const timeout = window.setTimeout(() => {
      if (!cancelled) setReadyKey(waitKey);
    }, LOGO_READY_WAIT_MS);
    const jobs: Promise<unknown>[] = [preloadManrope()];
    if (venue?.logoUrl) jobs.push(preloadImage(venue.logoUrl));
    void Promise.all(jobs).finally(() => {
      if (!cancelled) setReadyKey(waitKey);
    });
    return () => {
      cancelled = true;
      window.clearTimeout(timeout);
    };
  }, [waitKey, venue?.logoUrl, readyKey]);

  const pageReady = contentReady && readyKey === (venue?.id ?? "sem-espaco");

  if (!pageReady) {
    return <ListSkeleton venue={venue} shaped={Boolean(venue)} variant={variant} />;
  }

  const primary = venue?.proposalPrimaryColor || undefined;
  const secondary = venue?.proposalSecondaryColor || undefined;
  const textColor = venue?.proposalTextColor || undefined;
  const pageBackground = primary || PUBLIC_LOADING_BACKGROUND;
  const pageText = textColor || PUBLIC_LOADING_TEXT;
  const surface: PublicListSurface = {
    cardStyle: {
      backgroundColor: secondary || "#ffffff",
      color: textColor || "#181818",
    },
    buttonStyle: primary ? { backgroundColor: primary, color: textColor || "#ffffff" } : undefined,
    inputClassName:
      "w-full rounded border border-gray-300 bg-white px-4 py-2 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-current",
  };
  const socials = venueSocials(venue);
  const showFooter = venueShowsFooter(venue);

  return (
    <div
      className={`flex min-h-screen flex-col ${PUBLIC_PAGE_FONT} text-[15px] font-normal leading-[1.6]`}
      style={{ backgroundColor: pageBackground, color: pageText }}
    >
      <main className="flex flex-1 flex-col px-2 py-14 md:px-8">
        <div className="mb-10 flex w-full flex-col items-center justify-center gap-4 text-center">
          {venue?.logoUrl ? (
            <img
              src={venue.logoUrl}
              alt={`Logo ${venue.name}`}
              className="max-h-24 max-w-64 object-contain motion-safe:animate-logo-in"
            />
          ) : (
            <div className="flex items-center justify-center motion-safe:animate-logo-in">
              <Calendar className="h-8 w-8" style={{ color: pageText }} />
              <span className="ml-2 text-3xl font-bold" style={{ color: pageText }}>
                EventHub
              </span>
            </div>
          )}
          {venue?.description?.trim() ? (
            <p className="max-w-2xl whitespace-pre-line text-center text-[15px] font-normal leading-[1.6]">
              {venue.description.trim()}
            </p>
          ) : null}
        </div>
        <div className="motion-safe:animate-rise-in">{children(surface)}</div>
      </main>
      {showFooter && venue && (
        <footer
          className="flex w-full flex-col items-center justify-between gap-y-8 px-6 py-8 md:flex-row md:items-start md:gap-x-8 md:gap-y-0"
          style={{
            backgroundColor: secondary || "#4f46e5",
            color: textColor || "#ffffff",
          }}
        >
          {venue.logoUrl && (
            <div className="flex max-w-xl flex-col items-center md:items-start">
              <img
                src={venue.logoUrl}
                alt={`Logo ${venue.name}`}
                className="max-h-16 max-w-48 object-contain"
              />
            </div>
          )}
          {socials.length > 0 && (
            <div className="flex flex-col items-center md:items-start">
              <span className="mb-4 text-lg font-semibold md:mb-6">Siga nas redes sociais:</span>
              <div className="flex justify-center gap-8 md:justify-start">
                {socials.map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={link.label}
                    aria-label={link.label}
                    className="transition-transform hover:scale-110"
                    style={{ color: "inherit" }}
                  >
                    <link.icon size={26} />
                  </a>
                ))}
              </div>
            </div>
          )}
        </footer>
      )}
    </div>
  );
}
