import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Calendar } from "lucide-react";
import { FaFacebook, FaGlobe, FaInstagram, FaTiktok, FaWhatsapp } from "react-icons/fa";
import { useVenueStore } from "@/store/venueStore";
import { ClientPerDayProposalForm } from "@/components/proposal/forms/ClientPerDayProposalForm";
import { ClientPerPersonProposalForm } from "@/components/proposal/forms/ClientPerPersonProposalForm";
import { EVENTHUB_TAB_TITLE, venueTabTitle } from "@/lib/venue-tab-title";
import type { Venue } from "@/types/venue";

const PUBLIC_LOADING_BACKGROUND = "#111315";
const PUBLIC_LOADING_TEXT = "#f7f7f5";
const LOGO_READY_WAIT_MS = 8000;

const PUBLIC_PAGE_FONT = "font-['Manrope',sans-serif]";

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

function PublicBudgetFormSkeleton({
  venue,
  shaped,
}: {
  venue: Venue | null;
  shaped: boolean;
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
        <section
          className={`space-y-4 rounded-lg p-4 shadow-lg ${cardShell}`}
          style={cardStyle}
          aria-hidden
        >
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {Array.from({ length: 6 }, (_, index) => (
              <div key={index}>
                <Bone tone={cardTone} className="h-3 w-24" />
                <Bone tone={cardTone} className="mt-2 h-10 w-full" />
              </div>
            ))}
          </div>
          <Bone tone={cardTone} className="h-3 w-28" />
          <Bone tone={cardTone} className="h-24 w-full" />
          <div className="flex justify-end">
            {cardBackground ? (
              <div
                className="h-10 w-24 rounded-md motion-safe:animate-pulse"
                style={{ backgroundColor: venue?.proposalPrimaryColor || "#8b5cf6" }}
              />
            ) : (
              <Bone tone={cardTone} className="h-10 w-24" />
            )}
          </div>
        </section>
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

export function ProposalForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { selectedVenue, isLoading, fetchVenueById } = useVenueStore() || {};
  const [readyForId, setReadyForId] = useState<string | null>(null);
  const [failedId, setFailedId] = useState<string | null>(null);
  const [trackedId, setTrackedId] = useState(id);

  if (id !== trackedId) {
    setTrackedId(id);
    setReadyForId(null);
    setFailedId(null);
  }

  const venue = selectedVenue?.id === id ? selectedVenue : null;

  useEffect(() => {
    if (!id || !fetchVenueById) return;
    let active = true;
    setFailedId(null);
    fetchVenueById(id).catch(() => {
      if (active) setFailedId(id);
    });
    return () => {
      active = false;
    };
  }, [id, fetchVenueById]);

  useEffect(() => {
    document.title = venue?.name ? venueTabTitle(venue.name, venue.description) : EVENTHUB_TAB_TITLE;
    return () => {
      document.title = EVENTHUB_TAB_TITLE;
    };
  }, [venue?.name, venue?.description]);

  useEffect(() => {
    if (!id || !venue || isLoading || readyForId === id) return;
    let cancelled = false;
    const timeout = window.setTimeout(() => {
      if (!cancelled) setReadyForId(id);
    }, LOGO_READY_WAIT_MS);
    const jobs: Promise<unknown>[] = [preloadManrope()];
    if (venue.logoUrl) jobs.push(preloadImage(venue.logoUrl));
    void Promise.all(jobs).finally(() => {
      if (!cancelled) setReadyForId(id);
    });
    return () => {
      cancelled = true;
      window.clearTimeout(timeout);
    };
  }, [id, venue, isLoading, readyForId]);

  if (!id) {
    return <div>Erro: ID do venue não encontrado</div>;
  }

  const handleBack = () => {
    try {
      window.history.back();
    } catch (error) {
      console.error("Erro ao voltar:", error);
      navigate("/");
    }
  };

  const loading = isLoading || isLoading === undefined;
  const pageReady = Boolean(venue) && !loading && readyForId === id;

  if (failedId === id && !venue && !loading) {
    return (
      <div
        className={`flex min-h-screen flex-col items-center justify-center px-6 text-center ${PUBLIC_PAGE_FONT}`}
        style={{ backgroundColor: PUBLIC_LOADING_BACKGROUND, color: PUBLIC_LOADING_TEXT }}
      >
        <p>Não foi possível carregar o espaço.</p>
        <button
          type="button"
          className="mt-4 rounded-md border border-current px-4 py-2"
          onClick={() => {
            if (!fetchVenueById) return;
            setFailedId(null);
            fetchVenueById(id).catch(() => setFailedId(id));
          }}
        >
          Tentar de novo
        </button>
      </div>
    );
  }

  if (!pageReady) {
    return <PublicBudgetFormSkeleton venue={venue} shaped={Boolean(venue)} />;
  }

  const primary = venue?.proposalPrimaryColor || undefined;
  const secondary = venue?.proposalSecondaryColor || undefined;
  const textColor = venue?.proposalTextColor || undefined;
  const pageBackground = primary || PUBLIC_LOADING_BACKGROUND;
  const pageText = textColor || PUBLIC_LOADING_TEXT;
  const cardStyle = {
    backgroundColor: secondary || "#ffffff",
    color: textColor || "#181818",
  };
  const buttonStyle = primary
    ? { backgroundColor: primary, color: textColor || "#ffffff" }
    : undefined;
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

        {venue?.hasOvernightStay ? (
          <ClientPerDayProposalForm venueId={id} onBack={handleBack} cardStyle={cardStyle} buttonStyle={buttonStyle} />
        ) : (
          <ClientPerPersonProposalForm venueId={id} onBack={handleBack} cardStyle={cardStyle} buttonStyle={buttonStyle} />
        )}
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
