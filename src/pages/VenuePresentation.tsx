import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowRight, Calendar, Check, CircleCheck, ClipboardList, Clock, HelpCircle, House, Info, MapPin } from "lucide-react";
import { FaFacebook, FaGlobe, FaInstagram, FaTiktok, FaWhatsapp } from "react-icons/fa";
import { ProposalTourVideo } from "@/components/proposal/ProposalTourVideo";
import { PublicServiceDetailDialog } from "@/components/proposal/forms/PublicServiceDetail";
import { HouseSocialLinks, type HouseSocialLink } from "@/components/venue/HouseSocialLinks";
import { hasAmenityDetail, stepIndex } from "@/lib/amenity-video";
import { resolveTourVideo } from "@/lib/tour-video";
import { EVENTHUB_TAB_TITLE, venueTabTitle } from "@/lib/venue-tab-title";
import {
  venuePresentationView,
  type VenuePresentation,
  type VenuePresentationService,
} from "@/lib/venue-presentation";
import { formatCurrency } from "@/lib/utils";
import { venueService } from "@/services/venue.service";

const sectionTitleClass = "text-[20px] font-bold tracking-[-0.035em]";
const sectionLeadClass = "mt-1 text-[15px] font-normal leading-[1.6] opacity-70";

export default function VenuePresentation() {
  const { id } = useParams();
  const [house, setHouse] = useState<VenuePresentation | null>(null);
  const [loading, setLoading] = useState(true);
  const [amenityIndex, setAmenityIndex] = useState<number | null>(null);
  const [serviceDetail, setServiceDetail] = useState<VenuePresentationService | null>(null);

  useEffect(() => {
    if (!id) return;
    let active = true;
    setHouse(null);
    setLoading(true);
    setAmenityIndex(null);
    setServiceDetail(null);
    venueService
      .getVenuePresentation(id)
      .then((data) => {
        if (active) setHouse(data);
      })
      .catch(() => {
        if (active) setHouse(null);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [id]);

  const tourVideo = house ? resolveTourVideo(house.tourVideoUrl) : null;
  const view = house
    ? venuePresentationView({
        hasVideo: Boolean(tourVideo),
        images: house.images,
        amenityCount: house.amenities.length,
        serviceCount: house.services.length,
        amount: house.pricing.amount,
        minimumPrice: house.pricing.minimumPrice,
        whatsapp: house.whatsappNumber,
        neighborhood: house.neighborhood,
        city: house.city,
        street: house.street,
        streetNumber: house.streetNumber,
        state: house.state,
        model: house.pricing.model,
        name: house.name,
        slogan: house.slogan,
        description: house.description,
        maxGuest: house.maxGuest,
        hasOvernightStay: house.hasOvernightStay,
        checkIn: house.checkIn,
        checkOut: house.checkOut,
        minimumNights: house.minimumNights,
        openingHour: house.openingHour,
        closingHour: house.closingHour,
      })
    : null;

  useEffect(() => {
    document.title = house?.name && view ? venueTabTitle(house.name, view.slogan) : EVENTHUB_TAB_TITLE;
    return () => {
      document.title = EVENTHUB_TAB_TITLE;
    };
  }, [house?.name, view?.slogan]);

  if (loading || !house || !view) {
    return (
      <div className="min-h-screen bg-[#111315]" aria-busy={loading}>
        {!loading && (
          <p className="px-6 py-16 text-center text-[15px] text-[#f7f7f5]">
            Não foi possível carregar a apresentação deste espaço.
          </p>
        )}
      </div>
    );
  }

  const detailedAmenities = house.amenities.filter(hasAmenityDetail);
  const amenityDetail = amenityIndex === null ? null : detailedAmenities[amenityIndex];
  const pageBackground = house.proposalPrimaryColor || "#111315";
  const pageText = house.proposalTextColor || "#f7f7f5";
  const cardText = house.proposalTextColor || "#181818";
  const cardStyle = { backgroundColor: house.proposalSecondaryColor || "#ffffff", color: cardText };
  const whatsapp = house.whatsappNumber?.replace(/\D/g, "") ?? "";
  const pageLink = typeof window === "undefined" ? "" : window.location.href;
  const visitMessage = [
    house.name
      ? `Olá! Recebi a apresentação da ${house.name} e gostaria de agendar uma visita para conhecer o espaço.`
      : "Olá! Recebi a apresentação e gostaria de agendar uma visita para conhecer o espaço.",
    "",
    "Segue o link:",
    pageLink,
  ].join("\n");
  const mapHref = view.mapQuery
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(view.mapQuery)}`
    : undefined;
  const mapEmbedSrc = view.mapQuery
    ? `https://maps.google.com/maps?q=${encodeURIComponent(view.mapQuery)}&hl=pt-BR&z=15&output=embed`
    : undefined;
  const houseSocials: HouseSocialLink[] = [
    whatsapp ? { href: `https://wa.me/${whatsapp}`, label: "WhatsApp" } : null,
    house.instagramUrl ? { href: house.instagramUrl, label: "Instagram" } : null,
    house.facebookUrl ? { href: house.facebookUrl, label: "Facebook" } : null,
    house.tiktokUrl ? { href: house.tiktokUrl, label: "TikTok" } : null,
    house.url ? { href: house.url, label: "Site" } : null,
  ].filter((item): item is HouseSocialLink => item !== null);
  const footerSocials = [
    whatsapp ? { href: `https://wa.me/${whatsapp}`, label: "WhatsApp", icon: FaWhatsapp } : null,
    house.facebookUrl ? { href: house.facebookUrl, label: "Facebook", icon: FaFacebook } : null,
    house.tiktokUrl ? { href: house.tiktokUrl, label: "TikTok", icon: FaTiktok } : null,
    house.instagramUrl ? { href: house.instagramUrl, label: "Instagram", icon: FaInstagram } : null,
    house.url ? { href: house.url, label: "Site", icon: FaGlobe } : null,
  ].filter((item) => item !== null);

  const photoFrame = (image: { imageUrl: string; description: string | null }, className: string) => (
    <img src={image.imageUrl} alt={image.description || house.name} className={className} />
  );

  return (
    <div
      className="flex min-h-screen flex-col font-['Manrope',sans-serif] text-[15px] font-normal leading-[1.6]"
      style={{ color: pageText, backgroundColor: pageBackground }}
    >
      <main className="flex flex-1 flex-col items-center justify-start px-3 py-10">
        <div className="flex w-full max-w-3xl flex-col gap-5">
          <header className="flex flex-col items-center text-center">
            {house.logoUrl ? (
              <img src={house.logoUrl} alt={`Logo ${house.name}`} className="mb-4 max-h-24 max-w-64 object-contain" />
            ) : (
              <div className="mb-4 flex items-center justify-center">
                <Calendar className="h-8 w-8 text-eventhub-primary" style={house.proposalTextColor ? { color: house.proposalTextColor } : undefined} />
                <span className="ml-2 text-3xl font-bold text-eventhub-primary" style={house.proposalTextColor ? { color: house.proposalTextColor } : undefined}>
                  EventHub
                </span>
              </div>
            )}
            {view.slogan ? (
              <p className="mb-6 max-w-2xl whitespace-pre-line text-center text-[15px] leading-[1.6]">
                {view.slogan}
              </p>
            ) : null}
            {tourVideo ? (
              <ProposalTourVideo video={tourVideo} className="mb-6 aspect-video w-full overflow-hidden rounded-2xl" />
            ) : view.heroPhoto ? (
              <div className="mb-6 w-full overflow-hidden rounded-2xl">
                {photoFrame(view.heroPhoto, "h-72 w-full object-cover")}
              </div>
            ) : null}
          </header>

          <section className="rounded-xl px-5 py-6 shadow-lg" style={cardStyle}>
            <p className="text-[11px] font-medium uppercase tracking-[0.16em] opacity-60">A casa</p>
            <h2 className={`${sectionTitleClass} mt-2`}>{house.name}</h2>
            {view.houseCard.description ? (
              <p className="mt-3 whitespace-pre-line text-[15px] leading-[1.6]">{view.houseCard.description}</p>
            ) : null}
            <div className="my-5 border-t border-current/15" />
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div>
                <p className="flex items-center gap-2 text-[13px] opacity-70">
                  <House className="h-4 w-4 shrink-0" aria-hidden="true" />
                  Capacidade do espaço
                </p>
                <p className="mt-1 text-[18px] font-bold tracking-[-0.03em]">{view.houseCard.capacityLabel}</p>
              </div>
              {view.houseCard.schedule ? (
                <div>
                  <p className="flex items-center gap-2 text-[13px] opacity-70">
                    <Clock className="h-4 w-4 shrink-0" aria-hidden="true" />
                    {view.houseCard.schedule.label}
                  </p>
                  <p className="mt-1 text-[18px] font-bold tracking-[-0.03em]">{view.houseCard.schedule.value}</p>
                </div>
              ) : null}
            </div>
            {view.houseCard.minimumNightsLabel ? (
              <>
                <div className="my-5 border-t border-current/15" />
                <p className="flex items-center gap-2 text-[14px]">
                  <Info className="h-4 w-4 shrink-0" aria-hidden="true" />
                  {view.houseCard.minimumNightsLabel}
                </p>
              </>
            ) : null}
            {(view.houseCard.placeLabel || houseSocials.length > 0) && (
              <>
                <div className="my-5 border-t border-current/15" />
                <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3">
                  {view.houseCard.placeLabel ? (
                    <p className="flex min-w-0 items-center gap-2 text-[14px]">
                      <MapPin className="h-4 w-4 shrink-0" aria-hidden="true" />
                      {view.houseCard.placeLabel}
                    </p>
                  ) : null}
                  <HouseSocialLinks
                    links={houseSocials}
                    surfaceColor={house.proposalSecondaryColor || "#ffffff"}
                  />
                </div>
              </>
            )}
          </section>

          {view.soloPhoto ? (
            <div className="w-full overflow-hidden rounded-2xl">
              {photoFrame(view.soloPhoto, "h-72 w-full object-cover")}
            </div>
          ) : null}

          {house.amenities.length > 0 && (
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
                          className="relative inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full before:absolute before:-inset-2.5 before:content-[''] hover:bg-white/10"
                          aria-label={`Ver detalhes de ${amenity.name}`}
                          onClick={() => setAmenityIndex(detailedAmenities.indexOf(amenity))}
                        >
                          <HelpCircle className="h-4 w-4" aria-hidden="true" />
                        </button>
                      )}
                    </span>
                  </li>
                ))}
              </ul>
              {whatsapp && (
                <div className="mt-5 flex flex-col gap-4 border-t border-current/15 pt-5 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-bold tracking-[-0.03em]">Quer conhecer pessoalmente?</p>
                    <p className={sectionLeadClass}>
                      {`Agende uma visita e descubra tudo o que a ${house.name} oferece.`}
                    </p>
                  </div>
                  <a
                    href={`https://wa.me/${whatsapp}?text=${encodeURIComponent(visitMessage)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex shrink-0 items-center justify-center gap-2 self-start rounded-full border border-black/10 bg-white px-4 py-2 text-[14px] font-medium text-black hover:bg-neutral-100 sm:self-center"
                  >
                    <Calendar className="h-4 w-4" aria-hidden="true" />
                    Agendar uma visita
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </a>
                </div>
              )}
            </section>
          )}

          {house.services.length > 0 && (
            <section className="rounded-xl px-5 py-6 shadow-lg" style={cardStyle}>
              <h2 className={sectionTitleClass}>Serviços disponíveis</h2>
              <p className={sectionLeadClass}>Serviços que o espaço oferece para o seu evento.</p>
              <ul className="mt-4 space-y-2">
                {house.services.map((service) => {
                  const detailImage = service.imageUrl?.trim() || "";
                  const detailText = service.description?.trim() || "";
                  return (
                    <li key={service.id} className="flex items-start gap-3">
                      <CircleCheck className="mt-1 h-4 w-4 shrink-0" aria-hidden="true" />
                      <span className="flex min-w-0 items-center gap-1">
                        <span>{service.name}</span>
                        {(detailImage || detailText) && (
                          <button
                            type="button"
                            className="relative inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full before:absolute before:-inset-2.5 before:content-[''] hover:bg-white/10"
                            aria-label={`Ver detalhes de ${service.name}`}
                            onClick={() => setServiceDetail(service)}
                          >
                            <HelpCircle className="h-4 w-4" aria-hidden="true" />
                          </button>
                        )}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </section>
          )}

          {view.grid.length > 0 && (
            <section>
              <div className="grid grid-cols-2 gap-3">
                {view.grid.map((image, index) => {
                  const spansFullRow = view.grid.length % 2 === 1 && index === view.grid.length - 1;
                  return (
                    <div key={image.id} className={`overflow-hidden rounded-xl${spansFullRow ? " col-span-2" : ""}`}>
                      {photoFrame(image, "h-40 w-full object-cover")}
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {view.showInvestment && (
            <section className="rounded-xl px-5 py-6 shadow-lg" style={cardStyle}>
              <h2 className={sectionTitleClass}>Seu investimento</h2>
              <p className={sectionLeadClass}>
                {`Confira como funciona o investimento para realizar seu evento na ${house.name}.`}
              </p>
              <div className="mt-4 space-y-2">
                {view.priceLabel && view.amount !== null && (
                  <div className="flex items-baseline justify-between gap-4">
                    <span>{view.priceLabel}</span>
                    <span className="text-base font-medium tabular-nums">{formatCurrency(view.amount)}</span>
                  </div>
                )}
                {view.minimumPrice !== null && (
                  <div className="flex items-baseline justify-between gap-4">
                    <span>Preço mínimo</span>
                    <span className="text-base font-medium tabular-nums">{formatCurrency(view.minimumPrice)}</span>
                  </div>
                )}
              </div>
              <p className="mt-4 text-xs">* Valores sujeitos a alteração até a confirmação da reserva.</p>
              <div className="mx-auto mt-6 flex w-fit flex-col items-stretch gap-3">
                <Link
                  to={`/espaco/${house.name}/formulario`}
                  className="inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-[15px] font-bold hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
                  style={{ backgroundColor: cardText, color: cardStyle.backgroundColor }}
                >
                  <ClipboardList className="h-[18px] w-[18px]" aria-hidden="true" />
                  Fazer orçamento
                </Link>
                {whatsapp && (
                  <a
                    href={`https://wa.me/${whatsapp}?text=${encodeURIComponent(`Olá, gostaria de saber mais sobre a ${house.name}.`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-[#1FA855] px-6 py-3 text-[15px] font-bold text-white hover:bg-[#188a46]"
                  >
                    <FaWhatsapp size={18} />
                    Conversar com nossa equipe
                  </a>
                )}
              </div>
            </section>
          )}

          {view.mapQuery && (
            <div className="flex w-full flex-col items-center text-center">
              {view.mapLabel && (
                <a
                  className="flex items-center justify-center gap-1 hover:underline"
                  href={mapHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Abrir a localização no Google Maps"
                >
                  <MapPin className="h-4 w-4" />
                  {view.mapLabel}
                </a>
              )}
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
          )}
        </div>
      </main>
      {(house.logoUrl || footerSocials.length > 0) && (
        <footer
          className="flex w-full flex-col items-center justify-between gap-y-8 px-6 py-8 md:flex-row md:items-start"
          style={{ backgroundColor: house.proposalSecondaryColor || "#4f46e5", color: house.proposalTextColor || "#ffffff" }}
        >
          {house.logoUrl && (
            <img src={house.logoUrl} alt={`Logo ${house.name}`} className="max-h-16 max-w-48 object-contain" />
          )}
          {footerSocials.length > 0 && (
            <div className="flex flex-col items-center md:items-start">
              <span className="mb-4 text-lg font-semibold md:mb-6">Siga nas redes sociais:</span>
              <div className="flex justify-center gap-8 md:justify-start">
                {footerSocials.map((link) => (
                  <a key={link.label} href={link.href} target="_blank" rel="noopener noreferrer" title={link.label} aria-label={link.label} style={{ color: "inherit" }}>
                    <link.icon size={26} />
                  </a>
                ))}
              </div>
            </div>
          )}
        </footer>
      )}
      <PublicServiceDetailDialog
        open={amenityDetail !== null}
        onOpenChange={(open) => {
          if (!open) setAmenityIndex(null);
        }}
        name={amenityDetail?.name ?? ""}
        description={amenityDetail?.description}
        images={amenityDetail?.images}
        imageUrl={amenityDetail?.imageUrl}
        videoUrl={amenityDetail?.videoUrl}
        surfaceStyle={cardStyle}
        onPrevious={
          detailedAmenities.length > 1
            ? () => setAmenityIndex((index) => stepIndex(index, -1, detailedAmenities.length))
            : undefined
        }
        onNext={
          detailedAmenities.length > 1
            ? () => setAmenityIndex((index) => stepIndex(index, 1, detailedAmenities.length))
            : undefined
        }
      />
      <PublicServiceDetailDialog
        open={serviceDetail !== null}
        onOpenChange={(open) => {
          if (!open) setServiceDetail(null);
        }}
        name={serviceDetail?.name ?? ""}
        description={serviceDetail?.description}
        imageUrl={serviceDetail?.imageUrl}
        surfaceStyle={cardStyle}
      />
    </div>
  );
}
