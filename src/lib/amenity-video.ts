import { youtubeVideoId } from "./tour-video";

export type AmenityDetail = {
  description?: string | null;
  imageUrl?: string | null;
  videoUrl?: string | null;
};

export function isAmenityVideoUrl(value: string): boolean {
  return youtubeVideoId(value.trim()) !== null;
}

export function amenityVideoEmbedUrl(value: string | null | undefined): string | null {
  const id = value ? youtubeVideoId(value.trim()) : null;
  return id ? `https://www.youtube.com/embed/${id}?rel=0` : null;
}

export function hasAmenityDetail(amenity: AmenityDetail): boolean {
  return Boolean(amenity.description?.trim() || amenity.imageUrl?.trim() || amenityVideoEmbedUrl(amenity.videoUrl));
}

export function stepIndex(index: number | null, delta: number, total: number): number | null {
  if (index === null || total <= 0) return index;
  return (((index + delta) % total) + total) % total;
}
