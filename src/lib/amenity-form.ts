import * as z from "zod";
import { isAmenityVideoUrl } from "./amenity-video";

export const AMENITY_VIDEO_URL_MESSAGE = "Use um link do YouTube.";

export const amenityFormSchema = z.object({
  name: z.string().trim().min(1, "Informe o nome da característica").max(120, "Nome deve ter no máximo 120 caracteres"),
  position: z.string().optional(),
  description: z.string().trim().max(500, "Descrição deve ter no máximo 500 caracteres"),
  videoUrl: z.string().trim().refine((value) => value === "" || isAmenityVideoUrl(value), AMENITY_VIDEO_URL_MESSAGE),
});

export type AmenityFormValues = z.infer<typeof amenityFormSchema>;

export type AmenityImageChoice = {
  file?: File;
  removeImage: boolean;
};

export type AmenityFormSubmit = {
  name: string;
  position?: number;
  description: string | null;
  videoUrl: string;
  file?: File;
  removeImage: boolean;
};

export function amenityFormSubmit(
  values: AmenityFormValues,
  image: AmenityImageChoice,
  position?: number,
): AmenityFormSubmit {
  const description = values.description.trim();
  return {
    name: values.name.trim(),
    position,
    description: description ? description : null,
    videoUrl: values.videoUrl.trim(),
    file: image.file,
    removeImage: image.file ? false : image.removeImage,
  };
}

export function amenityFormData(payload: Record<string, unknown>, file?: File) {
  const formData = new FormData();
  formData.append("payload", JSON.stringify(payload));
  if (file) formData.append("file", file, file.name);
  return formData;
}
