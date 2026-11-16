/**
 * Seletor da biblioteca do espaco.
 * Uso: <PhotoPicker venueId={id} mode="single" value={photos} onChange={setPhotos} canUpload={canEditPhotos} />
 * "Enviar nova" sobe a foto e ja a deixa selecionada. Sem canUpload o botao nao aparece.
 */
import { FormEvent, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { venuePhotoService } from "@/services/venue-photo.service";
import { VenuePhoto, venuePhotoFilesTooLarge, toggleVenuePhoto } from "@/types/venue-photo";

export type PickedVenuePhoto = { id: string; url: string; description?: string | null };

type PhotoPickerProps = {
    venueId: string;
    mode: "single" | "multiple";
    max?: number;
    value: PickedVenuePhoto[];
    onChange: (photos: PickedVenuePhoto[]) => void;
    canUpload: boolean;
    triggerLabel?: string;
};

export function PhotoPicker({
    venueId,
    mode,
    max = mode === "single" ? 1 : 20,
    value,
    onChange,
    canUpload,
    triggerLabel = "Escolher foto",
}: PhotoPickerProps) {
    const [open, setOpen] = useState(false);
    const [photos, setPhotos] = useState<VenuePhoto[]>([]);
    const [draft, setDraft] = useState<PickedVenuePhoto[]>(value);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!open) return;
        setDraft(value);
        void venuePhotoService.list(venueId).then((response) => setPhotos(response.data)).catch(() => {
            setError("Nao foi possivel carregar a biblioteca.");
        });
    }, [open, venueId]);

    const choose = (photo: VenuePhoto) => {
        setDraft(toggleVenuePhoto(draft, photo, mode, max) as PickedVenuePhoto[]);
    };

    const upload = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const input = event.currentTarget.elements.namedItem("files");
        const files = input instanceof HTMLInputElement && input.files ? Array.from(input.files) : [];
        if (venuePhotoFilesTooLarge(files).length > 0) {
            setError("Cada foto pode ter no maximo 5 MB.");
            return;
        }
        const response = await venuePhotoService.upload(venueId, files);
        setPhotos((current) => [...response.data, ...current]);
        const next = response.data.reduce(
            (selected, photo) => toggleVenuePhoto(selected, photo, mode, max) as PickedVenuePhoto[],
            draft,
        );
        setDraft(next);
        event.currentTarget.reset();
    };

    return (
        <>
            <Button type="button" variant="outline" onClick={() => setOpen(true)}>{triggerLabel}</Button>
            {value.length > 0 && (
                <div className="mt-2 flex gap-2">
                    {value.map((photo) => (
                        <img key={photo.id} src={photo.url} alt={photo.description ?? ""} className="h-16 w-16 rounded object-cover" />
                    ))}
                </div>
            )}
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="max-w-3xl">
                    <DialogHeader>
                        <DialogTitle>Fotos do espaco</DialogTitle>
                    </DialogHeader>
                    {canUpload && (
                        <form className="flex flex-wrap items-center gap-2" onSubmit={upload}>
                            <Input name="files" type="file" accept="image/*" multiple={mode === "multiple"} required className="max-w-sm" />
                            <Button type="submit">Enviar nova</Button>
                        </form>
                    )}
                    {error && <p className="text-sm text-red-600">{error}</p>}
                    <div className="grid max-h-80 grid-cols-3 gap-2 overflow-auto">
                        {photos.map((photo) => {
                            const selected = draft.some((item) => item.id === photo.id);
                            return (
                                <button
                                    key={photo.id}
                                    type="button"
                                    className={selected ? "rounded ring-2 ring-primary" : "rounded"}
                                    onClick={() => choose(photo)}
                                >
                                    <img src={photo.url} alt={photo.description ?? "Foto"} className="h-24 w-full rounded object-cover" />
                                </button>
                            );
                        })}
                    </div>
                    <DialogFooter>
                        <Button type="button" onClick={() => { onChange(draft); setOpen(false); }}>Usar selecao</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
