import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { useProposalStore } from "@/store/proposalStore";
import { ArrowRight, Calendar, Check, CircleCheck, Clock, GripVertical, HelpCircle, House, Info, MapPin, Users } from "lucide-react";
import { FaFacebook, FaGlobe, FaInstagram, FaTiktok, FaWhatsapp } from "react-icons/fa";
import NotFound from "./NotFound";
import { Proposal } from "@/types/proposal";
import { eventDurationHours } from "@/lib/event-duration";
import { wallClockDateIso, wallClockTime } from "@/lib/wall-clock-datetime";
import { chosenHoursLabel, publicHourlyRate, quotedServiceAmount, quotedServiceDetail, sortProposalServicesByPricing } from "@/lib/service-price-label";
import { courtesyDetail } from "@/lib/service-courtesy";
import {
  proposalService,
  ProposalPresentation,
  PublicProposalServicesUpdate,
  PublicServiceChoice,
} from "@/services/proposal.service";
import { imageOrderAfterSave, moveImageBefore, sameImageOrder } from "@/lib/reorder-proposal-images";
import { replaceProposalImage } from "@/lib/choose-proposal-image";
import { resolveTourVideo } from "@/lib/tour-video";
import { EVENTHUB_TAB_TITLE, venueTabTitle } from "@/lib/venue-tab-title";
import { PublicServiceDetailDialog } from "@/components/proposal/forms/PublicServiceDetail";
import { hasAmenityDetail, stepIndex } from "@/lib/amenity-video";
import { RecalculateProposalDialog } from "@/components/proposal/RecalculateProposalDialog";
import { UpdateProposalServicesDialog } from "@/components/proposal/UpdateProposalServicesDialog";
import { discountBreakdown } from "@/lib/proposal-discount";
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

function applyPublicServices(
  current: Proposal,
  data: PublicProposalServicesUpdate,
  serviceHours: { serviceId: string; hours: number }[] = [],
): Proposal {
  const previous = new Map((current.proposalServices || []).map((line) => [line.serviceId, line]));
  const hoursById = new Map(serviceHours.map((entry) => [entry.serviceId, entry.hours]));
  const proposalServices = data.proposalServices.map((line) => {
    const existing = previous.get(line.serviceId);
    const hours = hoursById.get(line.serviceId);
    const storedUnitPrice = typeof existing?.unitPrice === "number" ? existing.unitPrice : null;
    const hourFields = typeof hours === "number"
      ? {
          pricingType: "PER_HOUR" as const,
          quantity: hours,
          ...(storedUnitPrice != null
            ? { unitPrice: storedUnitPrice }
            : hours > 0 ? { unitPrice: (line.amount + (line.courtesyAmount ?? 0)) / hours } : {}),
        }
      : {};
    const courtesyFields = typeof line.courtesyQuantity === "number"
      ? { courtesyQuantity: line.courtesyQuantity }
      : {};
    const serviceFields = {
      name: line.service.name,
      rpaRequired: line.service.rpaRequired,
      rpaMinPeople: line.service.rpaMinPeople ?? undefined,
    };
    if (existing?.service) {
      return {
        ...existing,
        ...hourFields,
        ...courtesyFields,
        id: line.id,
        amount: line.amount,
        service: { ...existing.service, ...serviceFields },
      };
    }
    const now = new Date();
    return {
      id: line.id,
      proposalId: current.id,
      serviceId: line.serviceId,
      amount: line.amount,
      ...hourFields,
      ...courtesyFields,
      joinedAt: now,
      service: {
        id: line.serviceId,
        name: line.service.name,
        price: 0,
        venueId: current.venueId,
        createdAt: now,
        updatedAt: now,
        ...serviceFields,
      },
    };
  });
  return {
    ...current,
    totalAmount: data.totalAmount,
    discountPercent: data.discountPercent,
    discountAmount: data.discountAmount,
    proposalServices,
  };
}

function hourlyRatesForChoices(
  choices: PublicServiceChoice[],
  lines: Proposal["proposalServices"] | undefined,
  eventHours: number,
) {
  return Object.fromEntries(choices.flatMap((choice) => {
    const line = (lines || []).find((item) => item.serviceId === choice.id);
    const rate = publicHourlyRate({
      hourly: choice.hourly,
      amount: choice.amount,
      hours: choice.hours,
      eventHours,
      unitPrice: line?.unitPrice,
      catalogPrice: line?.service?.price,
    });
    return typeof rate === "number" ? [[choice.id, rate]] : [];
  }));
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
const MEDIA_READY_WAIT_MS = 8000;

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

function preloadFileVideo(url: string) {
  const video = document.createElement("video");
  video.preload = "auto";
  video.muted = true;
  video.playsInline = true;
  video.setAttribute("aria-hidden", "true");
  video.style.position = "absolute";
  video.style.width = "0";
  video.style.height = "0";
  video.style.opacity = "0";
  video.style.pointerEvents = "none";
  let settled = false;
  const finish = () => {
    if (settled) return;
    settled = true;
    video.removeAttribute("src");
    video.load();
    video.remove();
  };
  const promise = new Promise<void>((resolve) => {
    const done = () => {
      finish();
      resolve();
    };
    video.addEventListener("canplay", done, { once: true });
    video.addEventListener("error", done, { once: true });
    document.body.appendChild(video);
    video.src = url;
  });
  return { promise, cancel: finish };
}

function preloadManrope() {
  if (typeof document === "undefined" || !document.fonts?.load) return Promise.resolve();
  return Promise.all(
    [400, 500, 700, 800].map((weight) =>
      document.fonts.load(`${weight} 16px Manrope`).catch(() => undefined)
    )
  ).then(() => undefined);
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

function presentationShowsFooter(house: ProposalPresentation | null) {
  if (!house) return false;
  const hasSocial = Boolean(
    house.whatsappNumber || house.facebookUrl || house.tiktokUrl || house.instagramUrl || house.url
  );
  return Boolean(house.logoUrl || hasSocial);
}

function presentationHasMapEmbed(house: ProposalPresentation | null) {
  if (!house) return false;
  return Boolean(
    [house.street, house.streetNumber, house.neighborhood, house.city, house.state].filter(Boolean).join(", ")
  );
}

type PublicProposalSkeletonShape = {
  hero: "video" | "photo" | "none";
  coverAfterProposal: boolean;
  galleryAfterProposal: number;
  galleryAfterServices: number;
  amenities: boolean;
  services: boolean;
  mapEmbed: boolean;
  mapLine: boolean;
  footer: boolean;
};

const GENERIC_PROPOSAL_SKELETON: PublicProposalSkeletonShape = {
  hero: "photo",
  coverAfterProposal: false,
  galleryAfterProposal: 2,
  galleryAfterServices: 0,
  amenities: true,
  services: true,
  mapEmbed: true,
  mapLine: false,
  footer: true,
};

function skeletonShape(
  house: ProposalPresentation | null,
  serviceCount: number,
  shaped: boolean
): PublicProposalSkeletonShape {
  if (!shaped) return GENERIC_PROPOSAL_SKELETON;
  if (!house) {
    return {
      hero: "none",
      coverAfterProposal: false,
      galleryAfterProposal: 0,
      galleryAfterServices: 0,
      amenities: false,
      services: serviceCount > 0,
      mapEmbed: false,
      mapLine: false,
      footer: false,
    };
  }
  const tour = resolveTourVideo(house.tourVideoUrl);
  const hasCover = house.images.length > 0;
  const galleryCount = Math.max(0, house.images.length - 1);
  return {
    hero: tour ? "video" : hasCover ? "photo" : "none",
    coverAfterProposal: Boolean(tour && hasCover),
    galleryAfterProposal: !tour ? galleryCount : 0,
    galleryAfterServices: tour ? galleryCount : 0,
    amenities: house.amenities.length > 0,
    services: serviceCount > 0,
    mapEmbed: presentationHasMapEmbed(house),
    mapLine: !presentationHasMapEmbed(house),
    footer: presentationShowsFooter(house),
  };
}

function SkeletonGallery({ count, tone }: { count: number; tone: string }) {
  if (count <= 0) return null;
  return (
    <div className="grid grid-cols-2 gap-3" aria-hidden>
      {Array.from({ length: count }, (_, index) => {
        const spansFullRow = count % 2 === 1 && index === count - 1;
        return (
          <div
            key={index}
            className={`h-40 motion-safe:animate-pulse rounded-xl ${tone}${spansFullRow ? " col-span-2" : ""}`}
          />
        );
      })}
    </div>
  );
}

function SkeletonTextCard({
  style,
  lines,
  tone,
  shellClassName = "",
}: {
  style?: React.CSSProperties;
  lines: number;
  tone: string;
  shellClassName?: string;
}) {
  return (
    <section className={`rounded-xl px-5 py-6 shadow-lg ${shellClassName}`} style={style} aria-hidden>
      <Bone tone={tone} className="h-5 w-48 max-w-full" />
      <Bone tone={tone} className="mt-2 h-4 w-full max-w-lg" />
      <div className="mt-4 space-y-2">
        {Array.from({ length: lines }, (_, index) => (
          <Bone key={index} tone={tone} className="h-4 w-full max-w-sm" />
        ))}
      </div>
    </section>
  );
}

function PublicProposalPageSkeleton({
  presentation,
  shaped,
  serviceCount,
}: {
  presentation: ProposalPresentation | null;
  shaped: boolean;
  serviceCount: number;
}) {
  const colorsKnown = presentation != null;
  const background = colorsKnown
    ? presentation.proposalPrimaryColor || PUBLIC_LOADING_BACKGROUND
    : PUBLIC_LOADING_BACKGROUND;
  const color = colorsKnown ? presentation.proposalTextColor || PUBLIC_LOADING_TEXT : PUBLIC_LOADING_TEXT;
  const cardBackground = colorsKnown ? presentation.proposalSecondaryColor || "#ffffff" : null;
  const cardText = colorsKnown ? presentation.proposalTextColor || "#181818" : color;
  const cardStyle = cardBackground ? { backgroundColor: cardBackground, color: cardText } : undefined;
  const cardShell = cardBackground ? "" : "bg-white/10";
  const footerBackground = colorsKnown ? presentation.proposalSecondaryColor || "#4f46e5" : "#4f46e5";
  const footerText = colorsKnown ? presentation.proposalTextColor || "#ffffff" : "#ffffff";
  const pageTone = boneTone(background);
  const cardTone = cardBackground ? boneTone(cardBackground) : pageTone;
  const footerTone = boneTone(footerBackground);
  const shape = skeletonShape(presentation, serviceCount, shaped);

  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      className="flex min-h-screen flex-col font-['Manrope',sans-serif]"
      style={{ backgroundColor: background, color }}
    >
      <span className="sr-only">Carregando</span>
      <main className="flex flex-1 flex-col items-center justify-start px-3 py-10">
        <div className="flex w-full max-w-3xl flex-col gap-5">
          <header className="flex flex-col items-center">
            <Bone tone={pageTone} className="mb-4 h-16 w-48 max-w-full" />
            {presentation?.description?.trim() ? (
              <div className="mb-6 flex w-full max-w-2xl flex-col items-center gap-2" aria-hidden>
                <Bone tone={pageTone} className="h-4 w-full" />
                <Bone tone={pageTone} className="h-4 w-4/5" />
              </div>
            ) : null}
            {shape.hero === "video" && (
              <div className={`mb-6 aspect-video w-full motion-safe:animate-pulse rounded-2xl ${pageTone}`} />
            )}
            {shape.hero === "photo" && (
              <div className={`mb-6 h-72 w-full motion-safe:animate-pulse rounded-2xl ${pageTone}`} />
            )}
          </header>
          <section className={`rounded-xl px-5 py-6 shadow-lg ${cardShell}`} style={cardStyle} aria-hidden>
            <Bone tone={cardTone} className="h-3 w-40" />
            <Bone tone={cardTone} className="mt-3 h-6 w-64 max-w-full" />
            <Bone tone={cardTone} className="mt-2 h-4 w-full max-w-md" />
            <div className="my-5 border-t border-current/15" />
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              {Array.from({ length: 4 }, (_, index) => (
                <div key={index}>
                  <Bone tone={cardTone} className="h-3 w-28" />
                  <Bone tone={cardTone} className="mt-2 h-5 w-40 max-w-full" />
                </div>
              ))}
            </div>
          </section>
          {shape.coverAfterProposal && (
            <div className={`h-72 w-full motion-safe:animate-pulse rounded-2xl ${pageTone}`} />
          )}
          <SkeletonGallery count={shape.galleryAfterProposal} tone={pageTone} />
          {shape.amenities && (
            <SkeletonTextCard style={cardStyle} lines={4} tone={cardTone} shellClassName={cardShell} />
          )}
          {shape.services && (
            <SkeletonTextCard style={cardStyle} lines={3} tone={cardTone} shellClassName={cardShell} />
          )}
          <SkeletonGallery count={shape.galleryAfterServices} tone={pageTone} />
          <SkeletonTextCard style={cardStyle} lines={4} tone={cardTone} shellClassName={cardShell} />
          {(shape.mapEmbed || shape.mapLine) && (
            <div className="flex w-full flex-col items-center" aria-hidden>
              <Bone tone={pageTone} className="h-4 w-40" />
              {shape.mapEmbed && (
                <div className={`mt-4 h-56 w-full motion-safe:animate-pulse rounded-2xl sm:h-72 ${pageTone}`} />
              )}
            </div>
          )}
        </div>
      </main>
      {shape.footer && (
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
  const [servicesOpen, setServicesOpen] = useState(false);
  const [serviceDetail, setServiceDetail] = useState<{
    name: string;
    imageUrl: string | null;
    description: string | null;
  } | null>(null);
  const [serviceDetailOpen, setServiceDetailOpen] = useState(false);
  const [amenityIndex, setAmenityIndex] = useState<number | null>(null);
  const [amenityDetailOpen, setAmenityDetailOpen] = useState(false);
  const [serviceChoices, setServiceChoices] = useState<PublicServiceChoice[] | null>(null);
  const [serviceChoicesFailed, setServiceChoicesFailed] = useState(false);
  const [readyForId, setReadyForId] = useState<string | null>(null);
  const [trackedId, setTrackedId] = useState(id);
  const dragMoved = useRef(false);

  if (id !== trackedId) {
    setTrackedId(id);
    setPresentation(null);
    setPresentationLoading(Boolean(id));
    setReadyForId(null);
    setServiceChoices(null);
    setServiceChoicesFailed(false);
    setServicesOpen(false);
    setServiceDetail(null);
    setServiceDetailOpen(false);
    setAmenityIndex(null);
    setAmenityDetailOpen(false);
  }

  useEffect(() => {
    setCoverSettled(false);
    if (id) {
      fetchProposalById(id);
    }
  }, [id, fetchProposalById]);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    proposalService.listPublicProposalServices(id)
      .then((response) => {
        if (!cancelled) setServiceChoices(response.data.services);
      })
      .catch(() => {
        if (!cancelled) setServiceChoicesFailed(true);
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  useEffect(() => {
    if (!id) {
      setPresentationLoading(false);
      return;
    }
    let active = true;
    setPresentation(null);
    setPresentationLoading(true);
    proposalService
      .getProposalPresentation(id)
      .then((response) => {
        if (active) setPresentation(response.data);
      })
      .catch(() => {
        if (active) setPresentation(null);
      })
      .finally(() => {
        if (active) setPresentationLoading(false);
      });
    return () => {
      active = false;
    };
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

  useEffect(() => {
    if (!id || presentationLoading || readyForId === id) return;
    let cancelled = false;
    const timeout = window.setTimeout(() => {
      if (!cancelled) setReadyForId(id);
    }, MEDIA_READY_WAIT_MS);

    const jobs: Promise<unknown>[] = [preloadManrope()];
    const urls = new Set<string>();
    if (presentation?.logoUrl) urls.add(presentation.logoUrl);
    for (const image of presentation?.images ?? []) {
      if (image.imageUrl) urls.add(image.imageUrl);
    }
    urls.forEach((url) => jobs.push(preloadImage(url)));
    const tour = resolveTourVideo(presentation?.tourVideoUrl);
    const videoPreload = tour?.kind === "file" ? preloadFileVideo(tour.src) : null;
    if (videoPreload) jobs.push(videoPreload.promise);

    void Promise.all(jobs).finally(() => {
      if (!cancelled) setReadyForId(id);
    });

    return () => {
      cancelled = true;
      window.clearTimeout(timeout);
      videoPreload?.cancel();
    };
  }, [id, presentationLoading, presentation, readyForId]);

  const proposalMatchesRoute = currentProposal?.id === id;
  const dataSettled = !isLoading && !presentationLoading && proposalMatchesRoute;
  const pageReady = dataSettled && readyForId === id;

  if (!isLoading && !presentationLoading && (error || !currentProposal)) return <NotFound />;
  if (!pageReady) {
    return (
      <PublicProposalPageSkeleton
        presentation={presentation}
        shaped={Boolean(presentation) || dataSettled}
        serviceCount={proposalMatchesRoute ? (currentProposal?.proposalServices.length ?? 0) : 0}
      />
    );
  }
  if (!currentProposal) return <NotFound />;

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

  const serviceList = sortProposalServicesByPricing(proposalServices || []);
  const discount = discountBreakdown(currentProposal);
  const durationHours = Math.round(
    (new Date(endDate).getTime() - new Date(startDate).getTime()) /
      (1000 * 60 * 60)
  );
  const house = presentation;
  const detailedAmenities = house?.amenities.filter(hasAmenityDetail) ?? [];
  const amenityDetail = amenityIndex === null ? null : detailedAmenities[amenityIndex] ?? null;
  const canStepAmenities = detailedAmenities.length > 1;
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
    house && (house.logoUrl || footerSocials.length > 0)
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
            {house?.description?.trim() ? (
              <p className="mb-6 max-w-2xl whitespace-pre-line text-center text-[15px] font-normal leading-[1.6] motion-safe:animate-logo-in">
                {house.description.trim()}
              </p>
            ) : null}
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
                    <span className="flex min-w-0 items-center gap-1">
                      <span>{amenity.name}</span>
                      {hasAmenityDetail(amenity) && (
                        <button
                          type="button"
                          className="relative inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full before:absolute before:-inset-2.5 before:content-[''] hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
                          aria-label={`Ver detalhes de ${amenity.name}`}
                          onClick={() => {
                            setAmenityIndex(detailedAmenities.indexOf(amenity));
                            setAmenityDetailOpen(true);
                          }}
                        >
                          <HelpCircle className="h-4 w-4" aria-hidden="true" />
                        </button>
                      )}
                    </span>
                  </li>
                ))}
              </ul>
              <PublicServiceDetailDialog
                open={amenityDetailOpen}
                onOpenChange={setAmenityDetailOpen}
                name={amenityDetail?.name ?? ""}
                description={amenityDetail?.description}
                images={amenityDetail?.images}
                imageUrl={amenityDetail?.imageUrl}
                videoUrl={amenityDetail?.videoUrl}
                surfaceStyle={cardStyle}
                onPrevious={
                  canStepAmenities
                    ? () => setAmenityIndex((index) => stepIndex(index, -1, detailedAmenities.length))
                    : undefined
                }
                onNext={
                  canStepAmenities
                    ? () => setAmenityIndex((index) => stepIndex(index, 1, detailedAmenities.length))
                    : undefined
                }
              />
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

          {(serviceList.length > 0 || (serviceChoices?.length ?? 0) > 0) && (
            <RevealBlock>
            <section className="rounded-xl px-5 py-6 shadow-lg" style={cardStyle}>
              <div className="flex items-start justify-between gap-4">
                <h2 className={sectionTitleClass}>Sua experiência inclui</h2>
                <button
                  type="button"
                  onClick={() => setServicesOpen(true)}
                  className={`inline-flex shrink-0 items-center justify-center rounded-full border border-current/40 px-4 py-1.5 text-[14px] font-medium hover:bg-white/10 ${actionButtonMotion}`}
                >
                  Alterar serviços
                </button>
              </div>
              <UpdateProposalServicesDialog
                open={servicesOpen}
                onOpenChange={setServicesOpen}
                proposalId={currentProposal.id}
                approved={Boolean(currentProposal.approved)}
                paid={Boolean(currentProposal.paid)}
                choices={serviceChoices ?? []}
                hourlyRates={hourlyRatesForChoices(
                  serviceChoices ?? [],
                  proposalServices,
                  eventDurationHours(new Date(startDate), new Date(endDate)),
                )}
                eventHours={eventDurationHours(new Date(startDate), new Date(endDate))}
                loadFailed={serviceChoicesFailed}
                discountPercent={currentProposal.discountPercent}
                onSaved={(data, serviceHours) => {
                  const hoursById = new Map(serviceHours.map((entry) => [entry.serviceId, entry.hours]));
                  setCurrentProposal(applyPublicServices(currentProposal, data, serviceHours));
                  setServiceChoices((current) => current?.map((choice) => {
                    const saved = data.proposalServices.find((line) => line.serviceId === choice.id);
                    const hours = hoursById.get(choice.id);
                    if (!saved) return { ...choice, selected: false };
                    return {
                      ...choice,
                      selected: true,
                      amount: saved.amount,
                      courtesyQuantity: saved.courtesyQuantity ?? choice.courtesyQuantity,
                      courtesyAmount: saved.courtesyAmount ?? choice.courtesyAmount,
                      ...(typeof hours === "number" ? { hours } : {}),
                    };
                  }) ?? current);
                }}
              />
              <p className={sectionLeadClass}>
                Serviços para que você aproveite cada momento com mais tranquilidade.
              </p>
              <ul className="mt-4 space-y-2">
                {serviceList.map((service) => {
                  const name = service.service?.name || "Serviço";
                  const detailImage = service.service?.imageUrl?.trim() || "";
                  const detailText = service.service?.description?.trim() || "";
                  const minPeople = service.service?.rpaRequired ? service.service.rpaMinPeople : undefined;
                  const requiredText = !minPeople
                    ? ""
                    : minPeople === 1
                      ? "Obrigatório a partir de 1 pessoa."
                      : `Obrigatório a partir de ${minPeople} pessoas.`;
                  const hoursText = chosenHoursLabel(
                    service.pricingType ?? service.service?.pricingType,
                    service.quantity,
                  );
                  return (
                    <li key={service.id} className="flex items-start gap-3">
                      <CircleCheck className="mt-1 h-4 w-4 shrink-0" aria-hidden="true" />
                      <span className="min-w-0">
                        <span className="flex items-center gap-1">
                          <span>{name}</span>
                          {(detailImage || detailText) && (
                            <button
                              type="button"
                              className="relative inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full before:absolute before:-inset-2.5 before:content-[''] hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
                              aria-label={`Ver detalhes de ${name}`}
                              onClick={() => {
                                setServiceDetail({
                                  name,
                                  imageUrl: detailImage || null,
                                  description: detailText || null,
                                });
                                setServiceDetailOpen(true);
                              }}
                            >
                              <HelpCircle className="h-4 w-4" aria-hidden="true" />
                            </button>
                          )}
                        </span>
                        {(requiredText || hoursText) && (
                          <span className="mt-1 block text-xs opacity-70">
                            {[requiredText, hoursText].filter(Boolean).join(" ")}
                          </span>
                        )}
                      </span>
                    </li>
                  );
                })}
              </ul>
              <PublicServiceDetailDialog
                open={serviceDetailOpen}
                onOpenChange={setServiceDetailOpen}
                name={serviceDetail?.name ?? ""}
                description={serviceDetail?.description}
                imageUrl={serviceDetail?.imageUrl}
                surfaceStyle={cardStyle}
              />
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
                className={`hidden shrink-0 items-center justify-center rounded-full border border-current/40 px-4 py-1.5 text-[14px] font-medium hover:bg-white/10 sm:inline-flex ${actionButtonMotion}`}
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
              discountPercent={currentProposal.discountPercent}
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
              {serviceList.map((service) => {
                const detail = quotedServiceDetail(service);
                const courtesy = courtesyDetail({
                  ...service,
                  pricingType: service.pricingType ?? service.service?.pricingType,
                });
                return (
                  <div className="flex items-baseline justify-between gap-4" key={service.id}>
                    <span>
                      {service.service?.name || "Serviço"}
                      {detail ? <span className="mt-0.5 block text-xs font-normal opacity-70">{detail}</span> : null}
                      {courtesy ? <span className="mt-0.5 block text-xs font-normal opacity-70">{courtesy}</span> : null}
                    </span>
                    <span className="text-base font-medium tabular-nums">{formatCurrency(quotedServiceAmount(service))}</span>
                  </div>
                );
              })}
            </div>
            <div className="mt-5 border-t border-current/15 pt-5">
              {discount && (
                <div className="mb-4 space-y-2">
                  <div className="flex items-baseline justify-between gap-4">
                    <span>Subtotal</span>
                    <span className="text-base font-medium tabular-nums">{formatCurrency(discount.subtotal)}</span>
                  </div>
                  <div className="flex items-baseline justify-between gap-4">
                    <span>{discount.label}</span>
                    <span className="text-base font-medium tabular-nums">- {formatCurrency(discount.amount)}</span>
                  </div>
                </div>
              )}
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
            <div className="mb-4 text-center sm:hidden">
              <button
                type="button"
                onClick={() => setRecalculateOpen(true)}
                className={`inline-flex items-center justify-center rounded-full border border-current/40 px-6 py-3 text-[15px] font-medium hover:bg-white/10 ${actionButtonMotion}`}
              >
                Alterar orçamento
              </button>
            </div>
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
          {house?.logoUrl && (
            <div className="flex flex-col items-center md:items-start max-w-xl">
              <img
                src={house.logoUrl}
                alt={`Logo ${house.name}`}
                className="max-h-16 max-w-48 object-contain"
              />
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
