import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { useProposalStore } from "@/store/proposalStore";
import { ArrowRight, Calendar, Check, Circle, Clock, GripVertical, House, Info, MapPin, Users } from "lucide-react";
import { FaFacebook, FaGlobe, FaInstagram, FaTiktok, FaWhatsapp } from "react-icons/fa";
import NotFound from "./NotFound";
import { wallClockDateIso, wallClockTime } from "@/lib/wall-clock-datetime";
import {
  proposalService,
  ProposalPresentation,
} from "@/services/proposal.service";
import { imageOrderAfterSave, moveImageBefore, sameImageOrder } from "@/lib/reorder-proposal-images";
import { replaceProposalImage } from "@/lib/choose-proposal-image";
import { resolveTourVideo } from "@/lib/tour-video";
import { EVENTHUB_TAB_TITLE, venueTabTitle } from "@/lib/venue-tab-title";
import { RecalculateProposalDialog } from "@/components/proposal/RecalculateProposalDialog";
import { ProposalTourVideo } from "@/components/proposal/ProposalTourVideo";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

const MONTHS_PT = [
  "janeiro",
  "fevereiro",
  "março",
  "abril",
  "maio",
  "junho",
  "julho",
  "agosto",
  "setembro",
  "outubro",
  "novembro",
  "dezembro",
];

function formatCurrency(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function eventDateLabel(value: string | Date) {
  const [year, month, day] = wallClockDateIso(value).split("-");
  return `${day} de ${MONTHS_PT[Number(month) - 1] || month} de ${year}`;
}

function hourLabel(value: string) {
  const [hour, minute = "00"] = value.split(":");
  const hourNumber = Number(hour);
  if (!hour || Number.isNaN(hourNumber)) return value;
  return minute === "00" ? `${hourNumber}h` : `${hourNumber}h${minute}`;
}

const actionButtonMotion =
  "transition-[transform,box-shadow,background-color] duration-200 ease-out active:translate-y-0 active:scale-[0.98] [@media(hover:hover)]:hover:-translate-y-0.5 [@media(hover:hover)]:hover:shadow-md";

const PUBLIC_LOADING_BACKGROUND = "#111315";
const PUBLIC_LOADING_TEXT = "#f7f7f5";

function PublicProposalLoadingScreen({
  presentation,
}: {
  presentation: ProposalPresentation | null;
}) {
  const background = presentation?.proposalPrimaryColor || PUBLIC_LOADING_BACKGROUND;
  const color = presentation?.proposalTextColor || PUBLIC_LOADING_TEXT;
  const name = presentation?.name?.trim();

  return (
    <div
      role="status"
      aria-live="polite"
      className="flex min-h-screen w-full items-center justify-center font-['Manrope',sans-serif]"
      style={{ backgroundColor: background, color }}
    >
      <div className="flex flex-col items-center gap-6 px-6">
        {presentation?.logoUrl ? (
          <img
            src={presentation.logoUrl}
            alt={name ? `Logo ${name}` : "Logo do espaço"}
            className="max-h-24 max-w-64 object-contain"
          />
        ) : name ? (
          <span className="text-center text-3xl font-bold tracking-wide">{name}</span>
        ) : null}
        <span className="relative flex h-10 w-10" aria-hidden>
          <span className="absolute inline-flex h-full w-full animate-spin rounded-full border-4 border-current border-t-transparent opacity-80" />
        </span>
        <span className="sr-only">Carregando</span>
      </div>
    </div>
  );
}

function RevealBlock({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [phase, setPhase] = useState<"static" | "hidden" | "shown">("static");

  useLayoutEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (typeof IntersectionObserver === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const rect = node.getBoundingClientRect();
    const inView = rect.bottom > 0 && rect.top < window.innerHeight;
    if (inView) {
      setPhase("shown");
      return;
    }

    let observer: IntersectionObserver;
    try {
      observer = new IntersectionObserver(
        (entries) => {
          if (entries.some((entry) => entry.isIntersecting)) {
            setPhase("shown");
            observer.disconnect();
          }
        },
        { threshold: 0 }
      );
      observer.observe(node);
    } catch {
      return;
    }

    setPhase("hidden");
    return () => observer.disconnect();
  }, []);

  const motionClass =
    phase === "hidden"
      ? "translate-y-4 opacity-0"
      : phase === "shown"
        ? "motion-safe:animate-rise-in"
        : "";

  return (
    <div ref={ref} className={`w-full ${motionClass}`.trim()}>
      {children}
    </div>
  );
}

function PhotoChoiceButton({ disabled, onChoose }: { disabled: boolean; onChoose: () => void }) {
  return (
    <button
      type="button"
      aria-label="Trocar foto"
      disabled={disabled}
      draggable={false}
      onMouseDown={(event) => event.stopPropagation()}
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        onChoose();
      }}
      className="absolute right-2 top-2 z-10 rounded-full bg-black/70 px-3 py-1 text-xs font-medium text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white disabled:cursor-not-allowed disabled:opacity-50"
    >
      Trocar foto
    </button>
  );
}

export default function ProposalView() {
  const { id } = useParams<{ id: string }>();
  const { currentProposal, isLoading, error, fetchProposalById, setCurrentProposal } =
    useProposalStore();
  const [presentation, setPresentation] = useState<ProposalPresentation | null>(
    null
  );
  const [presentationLoading, setPresentationLoading] = useState(true);
  const [activePhoto, setActivePhoto] = useState<number | null>(null);
  const [orderedImages, setOrderedImages] = useState<ProposalPresentation["images"]>([]);
  const [savingOrder, setSavingOrder] = useState(false);
  const [catalog, setCatalog] = useState<ProposalPresentation["catalog"]>([]);
  const [choiceSlotId, setChoiceSlotId] = useState<string | null>(null);
  const [savingChoice, setSavingChoice] = useState(false);
  const [choiceError, setChoiceError] = useState<string | null>(null);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [coverSettled, setCoverSettled] = useState(false);
  const [recalculateOpen, setRecalculateOpen] = useState(false);
  const dragMoved = useRef(false);

  useEffect(() => {
    setCoverSettled(false);
    if (id) {
      fetchProposalById(id);
    }
  }, [id, fetchProposalById]);

  useEffect(() => {
    if (!id) {
      setPresentationLoading(false);
      return;
    }
    setPresentation(null);
    setPresentationLoading(true);
    proposalService
      .getProposalPresentation(id)
      .then((response) => setPresentation(response.data))
      .catch(() => setPresentation(null))
      .finally(() => setPresentationLoading(false));
  }, [id]);

  useEffect(() => {
    setOrderedImages(presentation?.images ?? []);
    setCatalog(presentation?.catalog ?? []);
  }, [presentation]);

  useEffect(() => {
    document.title = presentation?.name
      ? venueTabTitle(presentation.name, presentation.description)
      : EVENTHUB_TAB_TITLE;
    return () => {
      document.title = EVENTHUB_TAB_TITLE;
    };
  }, [presentation?.name, presentation?.description]);

  if (isLoading || presentationLoading) {
    return <PublicProposalLoadingScreen presentation={presentation} />;
  }
  if (error || !currentProposal) return <NotFound />;

  const {
    email,
    guestNumber,
    startDate,
    endDate,
    basePrice,
    extraHoursQty,
    extraHourPrice,
    totalAmount,
    proposalServices,
  } = currentProposal;

  const serviceList = proposalServices || [];
  const durationHours = Math.round(
    (new Date(endDate).getTime() - new Date(startDate).getTime()) /
      (1000 * 60 * 60)
  );
  const house = presentation;
  const tourVideo = resolveTourVideo(house?.tourVideoUrl);
  const cover = orderedImages[0];
  const gallery = orderedImages.slice(1);
  const canReorderPhotos = Boolean(house?.canReorder) && orderedImages.length > 1;
  const canChoosePhotos = Boolean(house?.canReorder) && catalog.length > 1;
  const photoEditLocked = savingOrder || savingChoice;
  const dragEnabled = canReorderPhotos && !photoEditLocked;

  async function persistOrder(fromId: string, toId: string) {
    if (!id || !dragEnabled) return;
    const next = moveImageBefore(orderedImages, fromId, toId);
    if (sameImageOrder(next, orderedImages)) return;
    setOrderedImages(next);
    setSavingOrder(true);
    try {
      await proposalService.reorderProposalImages(id, next.map((image) => image.id));
      setOrderedImages(imageOrderAfterSave(orderedImages, next, true));
    } catch {
      setOrderedImages(imageOrderAfterSave(orderedImages, next, false));
    } finally {
      setSavingOrder(false);
      setDraggedId(null);
    }
  }

  async function persistChoice(slotId: string, replacement: ProposalPresentation["catalog"][number]) {
    if (!id || !canChoosePhotos || photoEditLocked) return;
    if (replacement.id === slotId) {
      setChoiceSlotId(null);
      setChoiceError(null);
      return;
    }
    const previous = orderedImages;
    const next = replaceProposalImage(orderedImages, slotId, replacement);
    setOrderedImages(next);
    setSavingChoice(true);
    setChoiceError(null);
    try {
      const response = await proposalService.chooseProposalImage(id, slotId, replacement.id);
      setOrderedImages(response.data.images);
      setCatalog(response.data.catalog);
      setChoiceSlotId(null);
    } catch {
      setOrderedImages(imageOrderAfterSave(previous, next, false));
      setChoiceError("Não foi possível trocar a foto. A foto anterior voltou.");
    } finally {
      setSavingChoice(false);
    }
  }

  function dragBindings(imageId: string) {
    return {
      draggable: true as const,
      onDragStart: (event: React.DragEvent) => {
        dragMoved.current = true;
        event.dataTransfer.setData("text/plain", imageId);
        event.dataTransfer.effectAllowed = "move";
        setDraggedId(imageId);
      },
      onDragOver: (event: React.DragEvent) => {
        event.preventDefault();
      },
      onDrop: (event: React.DragEvent) => {
        event.preventDefault();
        const fromId = event.dataTransfer.getData("text/plain") || draggedId;
        if (fromId) {
          void persistOrder(fromId, imageId);
        }
      },
      onDragEnd: () => {
        setDraggedId(null);
        window.setTimeout(() => {
          dragMoved.current = false;
        }, 0);
      },
    };
  }
  const primary = house?.proposalPrimaryColor || undefined;
  const secondary = house?.proposalSecondaryColor || undefined;
  const textColor = house?.proposalTextColor || undefined;
  const pageBackground = primary || "#111315";
  const pageText = textColor || "#f7f7f5";
  const cardText = textColor || "#181818";
  const sectionTitleClass = "text-[20px] font-bold tracking-[-0.035em]";
  const sectionLeadClass = "mt-1 text-[15px] font-normal leading-[1.6] opacity-70";
  const whatsapp = house?.whatsappNumber || "";
  const proposalLink = typeof window === "undefined" ? "" : window.location.href;
  const visitMessage = [
    house?.name
      ? `Olá! Recebi o orçamento da ${house.name} e gostaria de agendar uma visita para conhecer o espaço.`
      : "Olá! Recebi o orçamento e gostaria de agendar uma visita para conhecer o espaço.",
    "",
    "Segue o link da minha proposta:",
    proposalLink,
  ].join("\n");
  const cardStyle = {
    backgroundColor: secondary || "#ffffff",
    color: cardText,
  };
  const footerSocials = [
    whatsapp
      ? {
          href: `https://wa.me/${whatsapp.replace(/\D/g, "")}`,
          label: "WhatsApp",
          icon: FaWhatsapp,
        }
      : null,
    house?.facebookUrl
      ? { href: house.facebookUrl, label: "Facebook", icon: FaFacebook }
      : null,
    house?.tiktokUrl
      ? { href: house.tiktokUrl, label: "TikTok", icon: FaTiktok }
      : null,
    house?.instagramUrl
      ? { href: house.instagramUrl, label: "Instagram", icon: FaInstagram }
      : null,
    house?.url ? { href: house.url, label: "Site", icon: FaGlobe } : null,
  ].filter((item) => item !== null);
  const showSpaceFooter = Boolean(
    house && (house.logoUrl || house.description || footerSocials.length > 0)
  );
  const mapQuery = house
    ? [house.street, house.streetNumber, house.neighborhood, house.city, house.state]
        .filter(Boolean)
        .join(", ")
    : "";
  const mapHref = mapQuery
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapQuery)}`
    : undefined;
  const mapEmbedSrc = mapQuery
    ? `https://maps.google.com/maps?q=${encodeURIComponent(mapQuery)}&hl=pt-BR&z=15&output=embed`
    : undefined;

  const coverBlock = cover ? (
    <div
      className={`group relative w-full overflow-hidden rounded-2xl ${tourVideo ? "" : "mb-6"} ${dragEnabled ? "cursor-grab" : ""} ${draggedId === cover.id ? "opacity-60" : ""}`}
      {...(dragEnabled ? dragBindings(cover.id) : {})}
    >
      {canReorderPhotos && (
        <span
          aria-label="Arrastar foto"
          className="absolute left-2 top-2 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-black/70 text-white"
        >
          <GripVertical className="h-4 w-4" />
        </span>
      )}
      {canChoosePhotos && (
        <PhotoChoiceButton disabled={photoEditLocked} onChoose={() => setChoiceSlotId(cover.id)} />
      )}
      <img
        src={cover.imageUrl}
        alt={cover.description || house?.name}
        onAnimationEnd={() => setCoverSettled(true)}
        className={`h-72 w-full object-cover proposal-photo-zoom ${coverSettled ? "" : "motion-safe:animate-cover-in"}`}
      />
    </div>
  ) : null;

  const galleryBlock = gallery.length > 0 ? (
    <RevealBlock>
      <section>
        <div className="grid grid-cols-2 gap-3">
          {gallery.map((image, index) => {
            const spansFullRow = gallery.length % 2 === 1 && index === gallery.length - 1;
            const photoLabel = image.description || house?.name || "Foto da casa";
            return (
              <div
                key={image.id}
                className={`group relative overflow-hidden rounded-xl${spansFullRow ? " col-span-2" : ""} ${dragEnabled ? "cursor-grab" : ""} ${draggedId === image.id ? "opacity-60" : ""}`}
                {...(dragEnabled ? dragBindings(image.id) : {})}
              >
                {canReorderPhotos && (
                  <span
                    aria-label="Arrastar foto"
                    className="absolute left-2 top-2 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-black/70 text-white"
                  >
                    <GripVertical className="h-4 w-4" />
                  </span>
                )}
                {canChoosePhotos && (
                  <PhotoChoiceButton disabled={photoEditLocked} onChoose={() => setChoiceSlotId(image.id)} />
                )}
                <button
                  type="button"
                  onClick={() => {
                    if (dragMoved.current) {
                      dragMoved.current = false;
                      return;
                    }
                    setActivePhoto(index);
                  }}
                  aria-label={`Ampliar ${photoLabel}`}
                  className="block w-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                >
                  <img
                    src={image.imageUrl}
                    alt=""
                    className="h-40 w-full object-cover proposal-photo-zoom"
                  />
                </button>
              </div>
            );
          })}
        </div>
      </section>
    </RevealBlock>
  ) : null;

  return (
    <div
      className="flex min-h-screen flex-col font-['Manrope',sans-serif] text-[15px] font-normal leading-[1.6]"
      style={{ color: pageText, backgroundColor: pageBackground }}
    >
      <main className="flex flex-1 flex-col items-center justify-start px-3 py-10">
        <div className="flex w-full max-w-3xl flex-col gap-5">
          <header className="flex flex-col items-center text-center">
            {house?.logoUrl ? (
              <img
                src={house.logoUrl}
                alt={`Logo ${house.name}`}
                className="max-h-24 max-w-64 object-contain mb-4 motion-safe:animate-logo-in"
              />
            ) : (
              <div className="flex items-center justify-center mb-4 motion-safe:animate-logo-in">
                <Calendar className="h-8 w-8 text-eventhub-primary" style={textColor ? { color: textColor } : undefined} />
                <span className="ml-2 font-bold text-3xl text-eventhub-primary" style={textColor ? { color: textColor } : undefined}>
                  EventHub
                </span>
              </div>
            )}
            {tourVideo ? (
              <ProposalTourVideo
                video={tourVideo}
                className="mb-6 aspect-video w-full overflow-hidden rounded-2xl motion-safe:animate-cover-in"
              />
            ) : (
              coverBlock
            )}
          </header>

          <section className="rounded-xl px-5 py-6 shadow-lg motion-safe:animate-rise-in" style={cardStyle}>
            <p className="text-[11px] font-medium uppercase tracking-[0.16em] opacity-60">
              Proposta personalizada
            </p>
            <h2 className={`${sectionTitleClass} mt-2`}>
              {house?.name ? `Seu evento na ${house.name}` : "Seu evento"}
            </h2>
            <p className={sectionLeadClass}>
              Preparamos esta proposta especialmente para a sua celebração.
            </p>
            <div className="my-5 border-t border-current/15" />
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div>
                <p className="flex items-center gap-2 text-[13px] opacity-70">
                  <Calendar className="h-4 w-4 shrink-0" aria-hidden="true" />
                  Data do evento
                </p>
                <p className="mt-1 text-[18px] font-bold tracking-[-0.03em]">
                  {eventDateLabel(startDate) === eventDateLabel(endDate)
                    ? eventDateLabel(startDate)
                    : `${eventDateLabel(startDate)} até ${eventDateLabel(endDate)}`}
                </p>
              </div>
              <div>
                <p className="flex items-center gap-2 text-[13px] opacity-70">
                  <Clock className="h-4 w-4 shrink-0" aria-hidden="true" />
                  {house?.hasOvernightStay ? "Estadia" : "Horário reservado"}
                </p>
                <p className="mt-1 text-[18px] font-bold tracking-[-0.03em]">
                  {house?.hasOvernightStay
                    ? `Check-in ${house.checkIn ? hourLabel(house.checkIn) : "—"} · Check-out ${house.checkOut ? hourLabel(house.checkOut) : "—"}`
                    : `${hourLabel(wallClockTime(startDate))} às ${hourLabel(wallClockTime(endDate))} · ${durationHours === 1 ? "1 hora" : `${durationHours} horas`}`}
                </p>
              </div>
              <div>
                <p className="flex items-center gap-2 text-[13px] opacity-70">
                  <Users className="h-4 w-4 shrink-0" aria-hidden="true" />
                  Convidados previstos
                </p>
                <p className="mt-1 text-[18px] font-bold tracking-[-0.03em]">
                  {guestNumber === 1 ? "1 pessoa" : `${guestNumber} pessoas`}
                </p>
              </div>
              {house && (
                <div>
                  <p className="flex items-center gap-2 text-[13px] opacity-70">
                    <House className="h-4 w-4 shrink-0" aria-hidden="true" />
                    Capacidade do espaço
                  </p>
                  <p className="mt-1 text-[18px] font-bold tracking-[-0.03em]">
                    Até {house.maxGuest} pessoas
                  </p>
                </div>
              )}
            </div>
            {house?.hasOvernightStay && house.minimumNights ? (
              <>
                <div className="my-5 border-t border-current/15" />
                <p className="flex items-center gap-2 text-[14px]">
                  <Info className="h-4 w-4 shrink-0" aria-hidden="true" />
                  Mínimo de {house.minimumNights} {house.minimumNights === 1 ? "noite" : "noites"}.
                </p>
              </>
            ) : null}
            {house && !house.hasOvernightStay && (house.openingHour || house.closingHour) && (
              <>
                <div className="my-5 border-t border-current/15" />
                <p className="flex items-center gap-2 text-[14px]">
                  <Info className="h-4 w-4 shrink-0" aria-hidden="true" />
                  Horário de funcionamento do espaço: {house.openingHour ? hourLabel(house.openingHour) : "—"} às {house.closingHour ? hourLabel(house.closingHour) : "—"}.
                </p>
              </>
            )}
          </section>

          {tourVideo ? (coverBlock ? <RevealBlock>{coverBlock}</RevealBlock> : null) : galleryBlock}

          {house && house.amenities.length > 0 && (
            <RevealBlock>
            <section className="rounded-xl px-5 py-6 shadow-lg" style={cardStyle}>
              <h2 className={sectionTitleClass}>Conheça nosso espaço</h2>
              <p className={sectionLeadClass}>
                Um ambiente versátil, com estrutura completa para transformar seu evento em uma experiência especial.
              </p>
              <ul className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
                {house.amenities.map((amenity) => (
                  <li key={`${amenity.position}-${amenity.name}`} className="flex items-start gap-2">
                    <Check className="mt-1 h-4 w-4 shrink-0" aria-hidden="true" />
                    <span>{amenity.name}</span>
                  </li>
                ))}
              </ul>
              {whatsapp && (
                <div className="mt-5 flex flex-col gap-4 border-t border-current/15 pt-5 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-bold tracking-[-0.03em]">Quer conhecer pessoalmente?</p>
                    <p className={sectionLeadClass}>
                      {house.name
                        ? `Agende uma visita e descubra tudo o que a ${house.name} oferece.`
                        : "Agende uma visita e descubra tudo o que o espaço oferece."}
                    </p>
                  </div>
                  <a
                    href={`https://wa.me/${whatsapp.replace(/\D/g, "")}?text=${encodeURIComponent(visitMessage)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`inline-flex shrink-0 items-center justify-center gap-2 self-start rounded-full border border-black/10 bg-white px-4 py-2 text-[14px] font-medium text-black hover:bg-neutral-100 sm:self-center ${actionButtonMotion}`}
                  >
                    <Calendar className="h-4 w-4" aria-hidden="true" />
                    Agendar uma visita
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </a>
                </div>
              )}
            </section>
            </RevealBlock>
          )}

          {serviceList.length > 0 && (
            <RevealBlock>
            <section className="rounded-xl px-5 py-6 shadow-lg" style={cardStyle}>
              <h2 className={sectionTitleClass}>Sua experiência inclui</h2>
              <p className={sectionLeadClass}>
                Serviços para que você aproveite cada momento com mais tranquilidade.
              </p>
              <ul className="mt-4 space-y-2">
                {serviceList.map((service) => (
                  <li key={service.id} className="flex items-start gap-2">
                    <Circle className="mt-1 h-4 w-4 shrink-0" aria-hidden="true" />
                    <span>{service.service?.name || "Serviço"}</span>
                  </li>
                ))}
              </ul>
            </section>
            </RevealBlock>
          )}

          {tourVideo ? galleryBlock : null}

          <RevealBlock>
          <section className="rounded-xl px-5 py-6 shadow-lg" style={cardStyle}>
            <div className="flex items-start justify-between gap-4">
              <h2 className={sectionTitleClass}>Seu investimento</h2>
              <button
                type="button"
                onClick={() => setRecalculateOpen(true)}
                className="inline-flex shrink-0 items-center justify-center rounded-full border border-current/40 px-4 py-1.5 text-[14px] font-medium hover:bg-white/10"
              >
                Alterar orçamento
              </button>
            </div>
            <RecalculateProposalDialog
              open={recalculateOpen}
              onOpenChange={setRecalculateOpen}
              proposalId={currentProposal.id}
              startDate={startDate}
              endDate={endDate}
              guestNumber={guestNumber}
              approved={Boolean(currentProposal.approved)}
              paid={Boolean(currentProposal.paid)}
              maxGuest={house?.maxGuest}
              onSaved={(data) => setCurrentProposal({ ...currentProposal, ...data })}
            />
            <p className={sectionLeadClass}>
              {house?.name
                ? `Confira os valores para realizar seu evento na ${house.name}.`
                : "Confira os valores para realizar seu evento."}
            </p>
            <div className="mt-4 space-y-2">
              <div className="flex items-baseline justify-between gap-4">
                <span>Locação exclusiva do espaço</span>
                <span className="text-base font-medium tabular-nums">{formatCurrency(basePrice)}</span>
              </div>
              {extraHoursQty > 0 && (
                <div className="flex items-baseline justify-between gap-4">
                  <span>Horas extras ({extraHoursQty}hrs)</span>
                  <span className="text-base font-medium tabular-nums">{formatCurrency(extraHourPrice * extraHoursQty)}</span>
                </div>
              )}
              {serviceList.map((service) => (
                <div className="flex items-baseline justify-between gap-4" key={service.id}>
                  <span>{service.service?.name || "Serviço"}</span>
                  <span className="text-base font-medium tabular-nums">{formatCurrency(Number(service.service?.price || 0))}</span>
                </div>
              ))}
            </div>
            <div className="mt-5 border-t border-current/15 pt-5">
              <p className="text-[15px] font-medium">Investimento total</p>
              <p className="mt-1 text-[30px] font-extrabold leading-none tracking-[-0.04em] tabular-nums">
                {formatCurrency(totalAmount)}
              </p>
              <p className="mt-2 text-xs font-normal">* Valores sujeitos a alteração até a confirmação da reserva.</p>
              <div className="mt-3 flex flex-col gap-1 text-xs font-normal opacity-70">
                <div className="flex items-baseline justify-between gap-4">
                  <span>Referência por convidado</span>
                  <span className="tabular-nums">
                    {guestNumber && basePrice ? formatCurrency(basePrice / guestNumber) : "-"}
                  </span>
                </div>
                <div className="flex items-baseline justify-between gap-4">
                  <span>Hora adicional de evento</span>
                  <span className="tabular-nums">{formatCurrency(extraHourPrice) || "-"}</span>
                </div>
              </div>
            </div>
            <p className="mb-1 mt-6 text-center font-medium">
              Vamos tornar seu evento especial?
            </p>
            <p className="mb-3 text-center">
              Nossa equipe está à disposição para esclarecer suas dúvidas e ajudar você a dar o próximo passo.
            </p>
            {whatsapp && (
              <div className="mb-4 text-center">
                <a
                  href={`https://wa.me/${whatsapp.replace(/\D/g, "")}?text=${encodeURIComponent(
                    `Olá, gostaria de saber mais sobre a ${house?.name}.`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`inline-flex items-center justify-center gap-2 rounded-full bg-[#1FA855] px-6 py-3 text-[15px] font-bold text-white hover:bg-[#188a46] ${actionButtonMotion}`}
                >
                  <FaWhatsapp size={18} />
                  Conversar com nossa equipe
                </a>
              </div>
            )}
            {email && (
              <div className="text-xs text-center mt-2">
                * Este orçamento foi encaminhado para o seu email: <b>{email}</b>
              </div>
            )}
          </section>
          </RevealBlock>

          {house && (
            <RevealBlock>
            <div className="flex w-full flex-col items-center text-center">
              <a
                className="flex items-center justify-center gap-1 hover:underline"
                href={mapHref}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Abrir a localização no Google Maps"
              >
                <MapPin className="h-4 w-4" />
                {house.neighborhood} — {house.city}
              </a>
              {mapEmbedSrc && (
                <div className="mt-4 h-56 w-full overflow-hidden rounded-2xl sm:h-72">
                  <iframe
                    title={`Mapa de ${house.name}`}
                    src={mapEmbedSrc}
                    className="h-full w-full border-0"
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    allowFullScreen
                  />
                </div>
              )}
            </div>
            </RevealBlock>
          )}
        </div>
      </main>
      {showSpaceFooter && (
        <footer
          className="w-full flex flex-col md:flex-row items-center md:items-start justify-between py-8 px-6 gap-y-8 md:gap-y-0 md:gap-x-8"
          style={{
            backgroundColor: secondary || "#4f46e5",
            color: textColor || "#ffffff",
          }}
        >
          {(house?.logoUrl || house?.description) && (
            <div className="flex flex-col items-center md:items-start max-w-xl">
              {house?.logoUrl && (
                <img
                  src={house.logoUrl}
                  alt={`Logo ${house.name}`}
                  className="max-h-16 max-w-48 object-contain mb-2"
                />
              )}
              {house?.description && (
                <p className="text-center md:text-left text-base">{house.description}</p>
              )}
            </div>
          )}
          {footerSocials.length > 0 && (
            <div className="flex flex-col items-center md:items-start">
              <span className="text-lg font-semibold mb-4 md:mb-6">
                Siga nas redes sociais:
              </span>
              <div className="flex gap-8 justify-center md:justify-start">
                {footerSocials.map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={link.label}
                    aria-label={link.label}
                    className="hover:scale-110 transition-transform"
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
      <Dialog
        open={activePhoto !== null}
        onOpenChange={(open) => {
          if (!open) setActivePhoto(null);
        }}
      >
        <DialogContent className="left-0 top-0 flex h-screen w-screen max-w-none translate-x-0 translate-y-0 items-center justify-center border-0 bg-black p-4 text-white shadow-none sm:rounded-none">
          <DialogTitle className="sr-only">Fotos da casa</DialogTitle>
          <DialogDescription className="sr-only">
            Percorra as fotos da casa. Depois da ultima, a sequencia volta para a primeira.
          </DialogDescription>
          {activePhoto !== null && (
            <Carousel
              className="w-full max-w-5xl"
              opts={{ loop: gallery.length > 1, startIndex: activePhoto }}
            >
              <CarouselContent>
                {gallery.map((image) => (
                  <CarouselItem key={image.id} className="flex h-[80vh] items-center justify-center">
                    <img
                      src={image.imageUrl}
                      alt={image.description || house?.name || "Foto da casa"}
                      className="max-h-full w-full object-contain"
                    />
                  </CarouselItem>
                ))}
              </CarouselContent>
              {gallery.length > 1 && (
                <>
                  <CarouselPrevious className="left-3 border-white/30 bg-black/60 text-white hover:bg-black/80 hover:text-white" />
                  <CarouselNext className="right-3 border-white/30 bg-black/60 text-white hover:bg-black/80 hover:text-white" />
                </>
              )}
            </Carousel>
          )}
        </DialogContent>
      </Dialog>
      <Dialog
        open={choiceSlotId !== null}
        onOpenChange={(open) => {
          if (!open && !savingChoice) {
            setChoiceSlotId(null);
            setChoiceError(null);
          }
        }}
      >
        <DialogContent className="max-h-[85vh] overflow-y-auto">
          <DialogTitle>Escolher foto</DialogTitle>
          <DialogDescription>
            Escolha uma foto deste espaço para este lugar.
          </DialogDescription>
          {choiceError && (
            <p role="alert" className="text-sm text-red-600">
              {choiceError}
            </p>
          )}
          <div className="grid grid-cols-2 gap-2">
            {catalog.map((image) => {
              const selected = image.id === choiceSlotId;
              const onLink = orderedImages.some((visible) => visible.id === image.id);
              return (
                <button
                  key={image.id}
                  type="button"
                  disabled={photoEditLocked}
                  aria-pressed={selected}
                  onClick={() => {
                    if (choiceSlotId) {
                      void persistChoice(choiceSlotId, image);
                    }
                  }}
                  className={`relative overflow-hidden rounded-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-50 ${selected ? "ring-2 ring-black" : ""}`}
                >
                  <img
                    src={image.imageUrl}
                    alt={image.description || "Foto do espaço"}
                    className="h-28 w-full object-cover"
                  />
                  {onLink && (
                    <span className="absolute bottom-1 left-1 rounded bg-black/70 px-1.5 py-0.5 text-[10px] text-white">
                      No link
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
