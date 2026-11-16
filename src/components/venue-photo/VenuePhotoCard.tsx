import { Trash2 } from "lucide-react";
import { VenuePhoto } from "@/types/venue-photo";

type VenuePhotoCardProps = {
    photo: VenuePhoto;
    canEdit: boolean;
    deleting?: boolean;
    onDelete?: (photo: VenuePhoto) => void;
};

export function VenuePhotoCard({ photo, canEdit, deleting = false, onDelete }: VenuePhotoCardProps) {
    return (
        <article className="group relative overflow-hidden rounded-md border">
            <img src={photo.url} alt="Foto do espaco" className="h-36 w-full object-cover" />
            {canEdit && (
                <button
                    type="button"
                    className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-md bg-red-100 text-red-600 opacity-0 transition-opacity hover:bg-red-200 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400 group-hover:opacity-100 disabled:pointer-events-none"
                    aria-label="Excluir foto"
                    disabled={deleting}
                    onClick={() => onDelete?.(photo)}
                >
                    <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
            )}
        </article>
    );
}
