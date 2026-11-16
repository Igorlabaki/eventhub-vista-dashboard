import type { CSSProperties } from "react";

const BRAND_SURFACE_FALLBACK = "#111315";
const BRAND_SURFACE_TEXT_FALLBACK = "#f7f7f5";
const BRAND_INNER_FALLBACK = "#ffffff";
const BRAND_INNER_TEXT_FALLBACK = "#181818";

export interface VenueCardBrand {
  card: CSSProperties;
  inner: CSSProperties;
}

/** Mesmo papel e fallback das paginas publicas: primaria no fundo, secundaria nos blocos internos, cor de texto na fonte. */
export function venueCardBrand({
  primaryColor,
  secondaryColor,
  textColor,
}: {
  primaryColor?: string | null;
  secondaryColor?: string | null;
  textColor?: string | null;
}): VenueCardBrand | null {
  if (!primaryColor && !secondaryColor && !textColor) return null;
  const inner = secondaryColor || BRAND_INNER_FALLBACK;
  return {
    card: {
      backgroundColor: primaryColor || BRAND_SURFACE_FALLBACK,
      color: textColor || BRAND_SURFACE_TEXT_FALLBACK,
      borderLeftColor: inner,
    },
    inner: {
      backgroundColor: inner,
      color: textColor || BRAND_INNER_TEXT_FALLBACK,
    },
  };
}
