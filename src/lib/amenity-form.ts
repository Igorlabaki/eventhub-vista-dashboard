import * as z from "zod";
import { isAmenityVideoUrl } from "./amenity-video";
import { AmenityImageRef, VenueAmenityImage } from "@/types/venue-amenity";

export const AMENITY_VIDEO_URL_MESSAGE = "Use um link do YouTube.";
export const AMENITY_MAX_PHOTOS = 3;

export const amenityFormSchema = z.object({
  name: z.string().trim().min(1, "Informe o nome da característica").max(120, "Nome deve ter no máximo 120 caracteres"),
  position: z.string().optional(),
  description: z.string().trim().max(500, "Descrição deve ter no máximo 500 caracteres"),
  videoUrl: z.string().trim().refine((value) => value === "" || isAmenityVideoUrl(value), AMENITY_VIDEO_URL_MESSAGE),
});

export type AmenityFormValues = z.infer<typeof amenityFormSchema>;

export type AmenityPhoto =
  | { kind: "existing"; id: string; url: string }
  | { kind: "new"; key: string; file: File; previewUrl: string };

export type AmenityFormSubmit = {
  name: string;
  position?: number;
  description: string | null;
  videoUrl: string;
  photos: AmenityPhoto[];
};

let newPhotoSeq = 0;

export function initialPhotos(amenity?: { images?: VenueAmenityImage[] } | null): AmenityPhoto[] {
  return [...(amenity?.images ?? [])]
    .sort((a, b) => a.position - b.position)
    .map((image) => ({ kind: "existing", id: image.id, url: image.imageUrl }));
}

export function addPhotos(
  list: AmenityPhoto[],
  files: File[],
  preview: (file: File) => string = (file) => URL.createObjectURL(file),
): { list: AmenityPhoto[]; skipped: File[] } {
  const room = Math.max(0, AMENITY_MAX_PHOTOS - list.length);
  const added: AmenityPhoto[] = files.slice(0, room).map((file) => {
    newPhotoSeq += 1;
    return { kind: "new", key: `new-${newPhotoSeq}`, file, previewUrl: preview(file) };
  });
  return { list: [...list, ...added], skipped: files.slice(room) };
}

export function movePhoto(list: AmenityPhoto[], index: number, delta: number): AmenityPhoto[] {
  const target = index + delta;
  if (index < 0 || index >= list.length || target < 0 || target >= list.length) return list;
  const next = [...list];
  [next[index], next[target]] = [next[target], next[index]];
  return next;
}

export function removePhoto(list: AmenityPhoto[], index: number): AmenityPhoto[] {
  return list.filter((_, current) => current !== index);
}

export function photoKey(photo: AmenityPhoto) {
  return photo.kind === "existing" ? photo.id : photo.key;
}

export function photoUrl(photo: AmenityPhoto) {
  return photo.kind === "existing" ? photo.url : photo.previewUrl;
}

export function revokePhotoPreviews(list: AmenityPhoto[], revoke: (url: string) => void = (url) => URL.revokeObjectURL(url)) {
  for (const photo of list) {
    if (photo.kind === "new") revoke(photo.previewUrl);
  }
}

export function amenityPhotoPayload(list: AmenityPhoto[]): { images: AmenityImageRef[]; files: File[] } {
  const files: File[] = [];
  const images = list.map((photo): AmenityImageRef => {
    if (photo.kind === "existing") return { id: photo.id };
    files.push(photo.file);
    return { newIndex: files.length - 1 };
  });
  return { images, files };
}

export function amenityFormSubmit(
  values: AmenityFormValues,
  photos: AmenityPhoto[],
  position?: number,
): AmenityFormSubmit {
  const description = values.description.trim();
  return {
    name: values.name.trim(),
    position,
    description: description ? description : null,
    videoUrl: values.videoUrl.trim(),
    photos,
  };
}

export function amenityFormData(payload: Record<string, unknown>, files: File[] = []) {
  const formData = new FormData();
  formData.append("payload", JSON.stringify(payload));
  for (const file of files) formData.append("files", file, file.name);
  return formData;
}
