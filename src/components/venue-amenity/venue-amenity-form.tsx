import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { FormLayout } from "@/components/ui/form-layout";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AmenityFormSubmit, AmenityFormValues, amenityFormSchema, amenityFormSubmit } from "@/lib/amenity-form";
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
    const [file, setFile] = useState<File | undefined>();
    const [removeImage, setRemoveImage] = useState(false);
    const form = useForm<AmenityFormValues>({
        resolver: zodResolver(amenityFormSchema),
        defaultValues: defaultValues(amenity),
    });

    useEffect(() => {
        form.reset(defaultValues(amenity));
        setFile(undefined);
        setRemoveImage(false);
    }, [amenity, form]);

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
            await onSubmit(amenityFormSubmit(values, { file, removeImage }, position));
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
                <Label>Foto</Label>
                {amenity?.imageUrl && !removeImage && !file && (
                    <img src={amenity.imageUrl} alt="" className="mt-2 h-24 w-40 rounded object-cover" />
                )}
                <Input
                    type="file"
                    accept="image/*"
                    className="mt-1"
                    onChange={(event) => {
                        setFile(event.target.files?.[0]);
                        setRemoveImage(false);
                    }}
                />
                {amenity?.imageUrl && (
                    <button
                        type="button"
                        className="mt-2 text-sm text-gray-600 underline"
                        onClick={() => {
                            setRemoveImage((current) => !current);
                            setFile(undefined);
                        }}
                    >
                        {removeImage ? "Manter a foto atual" : "Remover foto"}
                    </button>
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
