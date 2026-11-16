export const VENUE_PHOTO_MAX_BYTES = 5 * 1024 * 1024;

export type VenuePhoto = {
    id: string;
    venueId: string;
    url: string;
    storageKey: string;
    width: number | null;
    height: number | null;
    sizeBytes: number | null;
    description: string | null;
    createdAt: string;
    updatedAt: string;
};

export type VenuePhotoUsage = { id: string; name: string };

export type VenuePhotoUsages = {
    siteImages: VenuePhotoUsage[];
    services: VenuePhotoUsage[];
    amenities: VenuePhotoUsage[];
    emailConfigs: VenuePhotoUsage[];
};

export function venuePhotoFilesTooLarge(files: { size: number }[]) {
    return files.filter((file) => file.size > VENUE_PHOTO_MAX_BYTES);
}

export function toggleVenuePhoto(
    current: { id: string }[],
    photo: { id: string },
    mode: "single" | "multiple",
    max = 1,
) {
    if (mode === "single") return [photo];
    if (current.some((item) => item.id === photo.id)) {
        return current.filter((item) => item.id !== photo.id);
    }
    if (current.length >= max) return current;
    return [...current, photo];
}

export const VENUE_PHOTO_IN_USE_MESSAGE = "Esta foto esta em uso e nao foi excluida.";

export function venuePhotoUsageLines(usages: VenuePhotoUsages) {
    return [
        ...usages.siteImages.map((item) => `Site: ${item.name}`),
        ...usages.services.map((item) => `Servico: ${item.name}`),
        ...usages.amenities.map((item) => `Caracteristica: ${item.name}`),
        ...usages.emailConfigs.map((item) => `E-mail: ${item.name}`),
    ];
}
