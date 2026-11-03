import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { FormLayout } from "@/components/ui/form-layout";
import { Input } from "@/components/ui/input";
import { VenueAmenity } from "@/types/venue-amenity";

const formSchema = z.object({
    name: z.string().trim().min(1, "Informe o nome da característica").max(120, "Nome deve ter no máximo 120 caracteres"),
    position: z.string().optional(),
});

type VenueAmenityFormValues = z.infer<typeof formSchema>;

interface VenueAmenityFormProps {
    amenity?: VenueAmenity | null;
    onSubmit: (data: { name: string; position?: number }) => Promise<void>;
    onCancel: () => void;
}

export function VenueAmenityForm({ amenity, onSubmit, onCancel }: VenueAmenityFormProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const form = useForm<VenueAmenityFormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: amenity?.name ?? "",
            position: amenity ? String(amenity.position) : "",
        },
    });

    useEffect(() => {
        form.reset({
            name: amenity?.name ?? "",
            position: amenity ? String(amenity.position) : "",
        });
    }, [amenity, form]);

    const handleSubmit = async (values: VenueAmenityFormValues) => {
        setIsSubmitting(true);
        try {
            const position = values.position === "" || values.position === undefined
                ? undefined
                : Number(values.position);
            if (position !== undefined && (!Number.isInteger(position) || position < 0)) {
                form.setError("position", { message: "Posição deve ser um número inteiro maior ou igual a zero" });
                return;
            }
            await onSubmit({
                name: values.name.trim(),
                position,
            });
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
