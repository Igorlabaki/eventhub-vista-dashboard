import { isAxiosError } from "axios";
import { FormEvent, useEffect, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { VenuePhotoCard } from "@/components/venue-photo/VenuePhotoCard";
import { useToast } from "@/hooks/use-toast";
import { venuePhotoService } from "@/services/venue-photo.service";
import { useUserVenuePermissionStore } from "@/store/userVenuePermissionStore";
import { useVenueStore } from "@/store/venueStore";
import { Permissions } from "@/types/permissions";
import { VenuePhoto, VenuePhotoUsages, VENUE_PHOTO_IN_USE_MESSAGE, venuePhotoFilesTooLarge } from "@/types/venue-photo";

function usagesFromError(error: unknown): VenuePhotoUsages | null {
    if (!isAxiosError(error)) return null;
    if (error.response?.status !== 409) return null;
    return (error.response.data?.data ?? null) as VenuePhotoUsages | null;
}

export default function VenuePhotos() {
    const { selectedVenue: venue } = useVenueStore();
    const { currentUserVenuePermission } = useUserVenuePermissionStore();
    const { toast } = useToast();
    const [photos, setPhotos] = useState<VenuePhoto[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const canEdit = currentUserVenuePermission?.permissions?.includes(Permissions.EDIT_VENUE_PHOTOS) ?? false;

    const load = async () => {
        if (!venue?.id) return;
        setLoading(true);
        setError(null);
        try {
            const response = await venuePhotoService.list(venue.id);
            setPhotos(response.data);
        } catch {
            setError("Nao foi possivel carregar as fotos.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        void load();
    }, [venue?.id]);

    const onUpload = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!venue?.id) return;
        const input = event.currentTarget.elements.namedItem("files");
        const files = input instanceof HTMLInputElement && input.files ? Array.from(input.files) : [];
        const tooLarge = venuePhotoFilesTooLarge(files);
        if (tooLarge.length > 0) {
            toast({ title: "Arquivo grande demais", description: "Cada foto pode ter no maximo 5 MB.", variant: "destructive" });
            return;
        }
        try {
            await venuePhotoService.upload(venue.id, files);
            event.currentTarget.reset();
            await load();
        } catch {
            toast({ title: "Falha no envio", description: "Nao foi possivel enviar as fotos.", variant: "destructive" });
        }
    };

    const onDelete = async (photo: VenuePhoto) => {
        if (deletingId) return;
        setDeletingId(photo.id);
        try {
            await venuePhotoService.remove(photo.id);
            setPhotos((current) => current.filter((item) => item.id !== photo.id));
        } catch (error) {
            if (usagesFromError(error)) {
                toast({ title: "Foto em uso", description: VENUE_PHOTO_IN_USE_MESSAGE, variant: "destructive" });
                return;
            }
            toast({ title: "Falha ao excluir", description: "A foto nao foi excluida.", variant: "destructive" });
        } finally {
            setDeletingId(null);
        }
    };

    return (
        <DashboardLayout title="Fotos" subtitle="Biblioteca de fotos deste espaco">
            {canEdit && (
                <form className="mb-6 flex flex-wrap items-center gap-3" onSubmit={onUpload}>
                    <Input name="files" type="file" accept="image/*" multiple required className="max-w-sm" />
                    <Button type="submit">Enviar fotos</Button>
                </form>
            )}
            {error && (
                <div className="mb-4 rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                    <p>{error}</p>
                    <button type="button" className="mt-2 underline" onClick={() => void load()}>Tentar de novo</button>
                </div>
            )}
            {loading ? <p className="text-sm text-muted-foreground">Carregando fotos...</p> : null}
            {!loading && photos.length === 0 ? <p className="text-sm text-muted-foreground">Nenhuma foto neste espaco.</p> : null}
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                {photos.map((photo) => (
                    <VenuePhotoCard
                        key={photo.id}
                        photo={photo}
                        canEdit={canEdit}
                        deleting={deletingId === photo.id}
                        onDelete={(item) => void onDelete(item)}
                    />
                ))}
            </div>
        </DashboardLayout>
    );
}
