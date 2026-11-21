export type VenuePresentationImage = {
  id: string;
  imageUrl: string;
  description: string | null;
  position: number;
};

export type VenuePresentationAmenity = {
  name: string;
  position: number;
  description: string | null;
  images: string[];
  imageUrl: string | null;
  videoUrl: string | null;
};

export type VenuePresentationService = {
  id: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
};

export type VenuePresentationPricingModel =
  | "PER_PERSON"
  | "PER_DAY"
  | "PER_PERSON_DAY"
  | "PER_PERSON_HOUR"
  | "TIERED";

export type VenueHouseSchedule = {
  label: string;
  value: string;
};

export type VenueHouseCard = {
  description: string | null;
  capacityLabel: string;
  schedule: VenueHouseSchedule | null;
  minimumNightsLabel: string | null;
  placeLabel: string | null;
};

export type VenuePresentationCatalogImage = {
  id: string;
  imageUrl: string;
  description: string | null;
  position: number;
  isShowOnProposal: boolean;
};

export type VenuePresentation = {
  canReorder: boolean;
  catalog: VenuePresentationCatalogImage[];
  name: string;
  description: string | null;
  slogan: string | null;
  logoUrl: string | null;
  faviconUrl: string | null;
  proposalPrimaryColor: string | null;
  proposalSecondaryColor: string | null;
  proposalTextColor: string | null;
  url: string | null;
  links?: { kind: string; label: string; href: string }[];
  instagramUrl: string | null;
  facebookUrl: string | null;
  tiktokUrl: string | null;
  tourVideoUrl: string | null;
  whatsappNumber: string | null;
  neighborhood: string;
  city: string;
  state: string;
  street: string;
  streetNumber: string;
  maxGuest: number;
  hasOvernightStay: boolean;
  checkIn: string | null;
  checkOut: string | null;
  minimumNights: number | null;
  openingHour: string | null;
  closingHour: string | null;
  images: VenuePresentationImage[];
  amenities: VenuePresentationAmenity[];
  services: VenuePresentationService[];
  pricing: {
    model: VenuePresentationPricingModel;
    amount: number | null;
    minimumPrice: number | null;
  };
};

const PRICING_LABEL: Record<VenuePresentationPricingModel, string | null> = {
  PER_PERSON: "Por pessoa",
  PER_DAY: "Por dia",
  PER_PERSON_DAY: "Por pessoa/dia",
  PER_PERSON_HOUR: "Por pessoa/hora",
  TIERED: null,
};

export function pricingLabel(model: VenuePresentationPricingModel): string | null {
  return PRICING_LABEL[model];
}

function publicText(value: string | null | undefined): string | null {
  const text = value?.trim();
  return text ? text : null;
}

function hourLabel(value: string): string {
  const [hour, minute = "00"] = value.split(":");
  const hourNumber = Number(hour);
  if (!hour || Number.isNaN(hourNumber)) return value;
  return minute === "00" ? `${hourNumber}h` : `${hourNumber}h${minute}`;
}

function houseSchedule(input: {
  hasOvernightStay: boolean;
  checkIn: string | null;
  checkOut: string | null;
  openingHour: string | null;
  closingHour: string | null;
}): VenueHouseSchedule | null {
  if (input.hasOvernightStay) {
    const parts = [
      publicText(input.checkIn) ? `Check-in ${hourLabel(publicText(input.checkIn)!)}` : null,
      publicText(input.checkOut) ? `Check-out ${hourLabel(publicText(input.checkOut)!)}` : null,
    ].filter((part) => part !== null);
    return parts.length > 0 ? { label: "Estadia", value: parts.join(" · ") } : null;
  }
  const opening = publicText(input.openingHour);
  const closing = publicText(input.closingHour);
  if (opening && closing) {
    return { label: "Horário de funcionamento", value: `${hourLabel(opening)} às ${hourLabel(closing)}` };
  }
  if (opening) return { label: "Horário de funcionamento", value: hourLabel(opening) };
  if (closing) return { label: "Horário de funcionamento", value: `até ${hourLabel(closing)}` };
  return null;
}

function minimumNightsLabel(hasOvernightStay: boolean, nights: number | null): string | null {
  if (!hasOvernightStay || typeof nights !== "number" || nights <= 0) return null;
  return nights === 1 ? "Mínimo de 1 noite." : `Mínimo de ${nights} noites.`;
}

export function planVenuePhotos(hasVideo: boolean, images: VenuePresentationImage[]) {
  if (images.length === 0) {
    return { hero: "none" as const, heroPhoto: null, soloPhoto: null, grid: [] as VenuePresentationImage[] };
  }
  if (hasVideo) {
    return {
      hero: "video" as const,
      heroPhoto: null,
      soloPhoto: images[0],
      grid: images.slice(1),
    };
  }
  return {
    hero: "photo" as const,
    heroPhoto: images[0],
    soloPhoto: images[1] ?? null,
    grid: images.slice(2),
  };
}

export function venuePresentationView(input: {
  hasVideo: boolean;
  images: VenuePresentationImage[];
  amenityCount: number;
  serviceCount: number;
  amount: number | null;
  minimumPrice: number | null;
  whatsapp: string | null;
  neighborhood: string;
  city: string;
  street: string;
  streetNumber: string;
  state: string;
  model: VenuePresentationPricingModel;
  name: string;
  slogan: string | null;
  description: string | null;
  maxGuest: number;
  hasOvernightStay: boolean;
  checkIn: string | null;
  checkOut: string | null;
  minimumNights: number | null;
  openingHour: string | null;
  closingHour: string | null;
}) {
  const photos = planVenuePhotos(input.hasVideo, input.images);
  const minimum = typeof input.minimumPrice === "number" && input.minimumPrice > 0 ? input.minimumPrice : null;
  const amount = typeof input.amount === "number" ? input.amount : null;
  const label = amount === null ? null : pricingLabel(input.model);
  const whatsapp = input.whatsapp?.trim() ?? "";
  const showInvestment = amount !== null || minimum !== null || whatsapp.length > 0;
  const mapLabel = [input.neighborhood, input.city].filter(Boolean).join(" — ");
  const mapQuery = [input.street, input.streetNumber, input.neighborhood, input.city, input.state]
    .filter(Boolean)
    .join(", ");
  const blocks = ["logo"];
  if (photos.hero === "video") blocks.push("video");
  if (photos.hero === "photo") blocks.push("hero-photo");
  blocks.push("house");
  if (photos.soloPhoto) blocks.push("solo-photo");
  if (input.amenityCount > 0) blocks.push("amenities");
  if (input.serviceCount > 0) blocks.push("services");
  if (photos.grid.length > 0) blocks.push("grid");
  if (showInvestment) blocks.push("investment");
  if (mapQuery) blocks.push("map");
  blocks.push("footer");

  const placeLabel = mapLabel || null;
  const houseCard: VenueHouseCard = {
    description: publicText(input.description),
    capacityLabel: `Até ${input.maxGuest} pessoas`,
    schedule: houseSchedule(input),
    minimumNightsLabel: minimumNightsLabel(input.hasOvernightStay, input.minimumNights),
    placeLabel,
  };

  return {
    ...photos,
    blocks,
    priceLabel: label,
    amount,
    minimumPrice: minimum,
    showInvestment,
    mapLabel,
    mapQuery,
    slogan: publicText(input.slogan),
    houseCard,
  };
}
