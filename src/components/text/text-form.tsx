import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { showSuccessToast } from "@/components/ui/success-toast";
import { useState } from "react";
import { useTextStore } from "@/store/textStore";
import { useToast } from "@/hooks/use-toast";
import { handleBackendSuccess, handleBackendError } from "@/lib/error-handler";
import { FormLayout } from "@/components/ui/form-layout";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Text } from "@/types/text";

const formSchema = z.object({
  area: z.string().min(1, "Área é obrigatória"),
  title: z.string().optional(),
  position: z.string().min(1, "Posição é obrigatória"),
  text: z.string().min(1, "Texto é obrigatório"),
});

type TextFormValues = z.infer<typeof formSchema>;

interface TextFormProps {
  text?: Text | null;
  venueId: string;
  onSubmit: (data: { area: string; title?: string; position: number; text: string }) => Promise<void>;
  onCancel: () => void;
}

export function TextForm({ text, venueId, onSubmit, onCancel }: TextFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { deleteText } = useTextStore();
  const { toast } = useToast();

  const form = useForm<TextFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      area: text?.area ?? "",
      title: text?.title ?? "",
      position: text?.position.toString() ?? "0",
      text: text?.text ?? "",
    },
  });

  React.useEffect(() => {
    form.reset({
      area: text?.area ?? "",
      title: text?.title ?? "",
      position: text?.position.toString() ?? "0",
      text: text?.text ?? "",
    });
  }, [text, form]);

  const handleDelete = async () => {
    if (!text) return;
    setIsDeleting(true);
    try {
      const response = await deleteText(text.id);
      const { title, message } = handleBackendSuccess(response, "Texto excluído com sucesso!");
      showSuccessToast({
        title,
        description: message
      });
      onCancel();
    } catch (error: unknown) {
      const { title, message } = handleBackendError(error, "Erro ao excluir texto. Tente novamente mais tarde.");
      toast({
        title,
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSubmit = async (values: TextFormValues) => {
    setIsSubmitting(true);
    try {
      await onSubmit({
        area: values.area,
        title: values.title,
        position: parseInt(values.position),
        text: values.text,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <FormLayout
      form={form}
      title={text ? 'Editar Texto' : 'Novo Texto'}
      onSubmit={handleSubmit}
      onCancel={onCancel}
      isSubmitting={isSubmitting}
      isEditing={!!text}
      onDelete={handleDelete}
      entityName={text?.title || text?.area}
      entityType="texto"
      isDeleting={isDeleting}
    >
      <FormField
        control={form.control}
        name="area"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Área</FormLabel>
            <FormControl>
              <Input
                placeholder="Digite a área do texto"
                required
                className="mt-1"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="title"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Título (opcional)</FormLabel>
            <FormControl>
              <Input
                placeholder="Digite o título do texto"
                className="mt-1"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="position"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Posição</FormLabel>
            <FormControl>
              <Input
                type="number"
                placeholder="Digite a posição do texto"
                required
                className="mt-1"
                {...field}
              />
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
            <FormLabel>Texto</FormLabel>
            <FormControl>
              <Textarea
                placeholder="Digite o texto"
                required
                className="mt-1 min-h-[200px]"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </FormLayout>
  );
} 