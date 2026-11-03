import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { FormLayout } from "@/components/ui/form-layout";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { VenueRule } from "@/types/venue-rule";

const formSchema = z.object({
    title: z.string().trim().max(120, "Título deve ter no máximo 120 caracteres"),
    text: z.string().trim().min(1, "Informe o texto da regra").max(5000, "Texto deve ter no máximo 5000 caracteres"),
    position: z.string().optional(),
});

type VenueRuleFormValues = z.infer<typeof formSchema>;

interface VenueRuleFormProps {
    rule?: VenueRule | null;
    onSubmit: (data: { title: string | null; text: string; position?: number }) => Promise<void>;
    onCancel: () => void;
}

export function VenueRuleForm({ rule, onSubmit, onCancel }: VenueRuleFormProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const form = useForm<VenueRuleFormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            title: rule?.title ?? "",
            text: rule?.text ?? "",
            position: rule ? String(rule.position) : "",
        },
    });

    useEffect(() => {
        form.reset({
            title: rule?.title ?? "",
            text: rule?.text ?? "",
            position: rule ? String(rule.position) : "",
        });
    }, [rule, form]);

    const handleSubmit = async (values: VenueRuleFormValues) => {
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
                title: values.title.trim() ? values.title.trim() : null,
                text: values.text.trim(),
                position,
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <FormLayout
            title={rule ? "Editar regra" : "Nova regra"}
            form={form}
            onSubmit={handleSubmit}
            onCancel={onCancel}
            isSubmitting={isSubmitting}
            isEditing={!!rule}
            submitLabel={rule ? "Salvar regra" : "Cadastrar regra"}
        >
            <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Título</FormLabel>
                        <FormControl>
                            <Input placeholder="Opcional" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />
            <FormField
                control={form.control}
                name="text"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Regra</FormLabel>
                        <FormControl>
                            <Textarea placeholder="Descreva a regra do espaço" rows={5} {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />
            {rule && (
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
