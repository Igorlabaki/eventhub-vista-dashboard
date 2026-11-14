import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronLeft, ChevronRight, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { FormLayout } from "@/components/ui/form-layout";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    AMENITY_MAX_PHOTOS,
    AmenityFormSubmit,
    AmenityFormValues,
    AmenityPhoto,
    addPhotos,
    amenityFormSchema,
    amenityFormSubmit,
    initialPhotos,
    movePhoto,
    photoKey,
    photoUrl,
    removePhoto,
    revokePhotoPreviews,
} from "@/lib/amenity-form";
import { VenueAmenity } from "@/types/venue-amenity";

interface VenueAmenityFormProps {
    amenity?: VenueAmenity | null;
    onSubmit: (data: AmenityFormSubmit) => Promise<void>;
    onCancel: () => void;
}

function defaultValues(amenity?: VenueAmenity | null): AmenityFormValues {
    return {
        name: amenity?.name ?? "",
        position: amenity ? String(amenity.position) : "",
        description: amenity?.description ?? "",
        videoUrl: amenity?.videoUrl ?? "",
    };
}

export function VenueAmenityForm({ amenity, onSubmit, onCancel }: VenueAmenityFormProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [photos, setPhotos] = useState<AmenityPhoto[]>(() => initialPhotos(amenity));
    const [skippedPhotos, setSkippedPhotos] = useState(0);
    const photosRef = useRef(photos);
    photosRef.current = photos;
    const form = useForm<AmenityFormValues>({
        resolver: zodResolver(amenityFormSchema),
        defaultValues: defaultValues(amenity),
    });

    useEffect(() => {
        form.reset(defaultValues(amenity));
        setPhotos((current) => {
            revokePhotoPreviews(current);
            return initialPhotos(amenity);
        });
        setSkippedPhotos(0);
    }, [amenity, form]);

    useEffect(() => () => revokePhotoPreviews(photosRef.current), []);

    const handleRemovePhoto = (index: number) => {
        revokePhotoPreviews([photos[index]]);
        setPhotos(removePhoto(photos, index));
        setSkippedPhotos(0);
    };

    const handleSubmit = async (values: AmenityFormValues) => {
        setIsSubmitting(true);
        try {
            const position = values.position === "" || values.position === undefined
                ? undefined
                : Number(values.position);
            if (position !== undefined && (!Number.isInteger(position) || position < 0)) {
                form.setError("position", { message: "Posição deve ser um número inteiro maior ou igual a zero" });
                return;
            }
            await onSubmit(amenityFormSubmit(values, photos, position));
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <FormLayout
            title={amenity ? "Editar característica" : "Nova característica"}
            form={form}
            onSubmit={handleSubmit}
            onCancel={onCancel}
            isSubmitting={isSubmitting}
            isEditing={!!amenity}
            submitLabel={amenity ? "Salvar característica" : "Cadastrar característica"}
        >
            <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Nome</FormLabel>
                        <FormControl>
                            <Input placeholder="Ex.: Piscina aquecida" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />
            <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Descrição</FormLabel>
                        <FormControl>
                            <Textarea placeholder="Texto opcional sobre a característica" maxLength={500} {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />
            <div>
                <Label>Fotos</Label>
                <p className="mt-1 text-sm text-gray-500">
                    Até {AMENITY_MAX_PHOTOS} fotos. Use as setas para escolher a ordem em que aparecem na proposta.
                </p>
                {photos.length > 0 && (
                    <ul className="mt-2 grid max-w-md grid-cols-3 gap-2">
                        {photos.map((photo, index) => (
                            <li key={photoKey(photo)}>
                                <img
                                    src={photoUrl(photo)}
                                    alt={`Foto ${index + 1}`}
                                    className="aspect-square w-full rounded object-cover"
                                />
                                <div className="mt-1 flex justify-between">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="icon"
                                        className="h-8 w-8"
                                        aria-label="Mover foto para a esquerda"
                                        disabled={index === 0}
                                        onClick={() => setPhotos(movePhoto(photos, index, -1))}
                                    >
                                        <ChevronLeft className="h-4 w-4" aria-hidden="true" />
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="icon"
                                        className="h-8 w-8"
                                        aria-label="Remover foto"
                                        onClick={() => handleRemovePhoto(index)}
                                    >
                                        <Trash2 className="h-4 w-4" aria-hidden="true" />
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="icon"
                                        className="h-8 w-8"
                                        aria-label="Mover foto para a direita"
                                        disabled={index === photos.length - 1}
                                        onClick={() => setPhotos(movePhoto(photos, index, 1))}
                                    >
                                        <ChevronRight className="h-4 w-4" aria-hidden="true" />
                                    </Button>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
                {photos.length < AMENITY_MAX_PHOTOS && (
                    <Input
                        type="file"
                        accept="image/*"
                        multiple
                        className="mt-2"
                        onChange={(event) => {
                            const chosen = Array.from(event.target.files ?? []);
                            event.target.value = "";
                            const { list, skipped } = addPhotos(photos, chosen);
                            setPhotos(list);
                            setSkippedPhotos(skipped.length);
                        }}
                    />
                )}
                {skippedPhotos > 0 && (
                    <p className="mt-1 text-sm text-amber-700" role="status">
                        Só cabem {AMENITY_MAX_PHOTOS} fotos. {skippedPhotos === 1 ? "1 foto ficou" : `${skippedPhotos} fotos ficaram`} de fora.
                    </p>
                )}
            </div>
            <FormField
                control={form.control}
                name="videoUrl"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Link do vídeo no YouTube</FormLabel>
                        <FormControl>
                            <Input placeholder="https://www.youtube.com/watch?v=..." inputMode="url" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />
            {amenity && (
                <FormField
                    control={form.control}
                    name="position"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Posição</FormLabel>
                            <FormControl>
                                <Input type="number" min={0} step={1} {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            )}
        </FormLayout>
    );
}
