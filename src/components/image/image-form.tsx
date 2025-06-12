import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Input } from "@/components/ui/input";
import { showSuccessToast } from "@/components/ui/success-toast";
import { useState } from "react";
import { useImageStore } from "@/store/imageStore";
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
import { CreateImageDTO, Image } from "@/types/image";
import { min } from "date-fns";

const MAX_FILE_SIZE_MB = 2.5;

const formSchema = z.object({
  file: z.any().refine((file) => file instanceof File && file.size > 0, {
    message: "O arquivo é obrigatório.",
  }),
  tag: z.string().min(1, "A tag é obrigatória."),
  venueId: z.string().optional(),
  position: z.string().min(1, "A posição é obrigatória."),
  description: z.string().optional(),
  responsiveMode: z.string().optional(),
  imageUrl: z.string().optional(),
});

type ImageFormValues = z.infer<typeof formSchema>;

interface ImageFormProps {
  imageItem?: Image | null;
  venueId: string;
  onSubmit: (data: CreateImageDTO) => Promise<void>;
  onCancel: () => void;
}

export function ImageForm({ imageItem, venueId, onSubmit, onCancel }: ImageFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [preview, setPreview] = useState<string | null>(imageItem?.imageUrl || null);
  const { deleteImage } = useImageStore();
  const { toast } = useToast();

  const form = useForm<ImageFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      file: null,
      tag: imageItem?.tag ?? "",
      venueId: venueId,
      position: imageItem?.position?.toString() ?? "",
      description: imageItem?.description ?? "",
      responsiveMode: imageItem?.responsiveMode ?? "",
      imageUrl: imageItem?.imageUrl ?? "",
    },
  });

  React.useEffect(() => {
    form.reset({
      file: null,
      tag: imageItem?.tag ?? "",
      venueId: venueId,
      position: imageItem?.position?.toString() ?? "",
      description: imageItem?.description ?? "",
      responsiveMode: imageItem?.responsiveMode ?? "",
    });
    setPreview(imageItem?.imageUrl || null);
  }, [imageItem, form, venueId]);

  const handleDelete = async () => {
    if (!imageItem) return;
    setIsDeleting(true);
    try {
      const response = await deleteImage(imageItem.id);
      const { title, message } = handleBackendSuccess(response, "Imagem excluída com sucesso!");
      showSuccessToast({
        title,
        description: message
      });
      onCancel();
    } catch (error: unknown) {
      const { title, message } = handleBackendError(error, "Erro ao excluir imagem. Tente novamente mais tarde.");
      toast({
        title,
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  // Preview dinâmico
  const file = form.watch("file");

  React.useEffect(() => {
    if (file && file instanceof File) {
      const url = URL.createObjectURL(file);
      setPreview(url);
      return () => URL.revokeObjectURL(url);
    } else if (imageItem?.imageUrl) {
      setPreview(imageItem.imageUrl);
    } else {
      setPreview(null);
    }
  }, [file, imageItem]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, onChange: (file: File | null) => void) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      const fileSizeInMB = file.size / (1024 * 1024);
      if (fileSizeInMB > MAX_FILE_SIZE_MB) {
        toast({
          title: "Imagem muito grande",
          description: `A imagem deve ter no máximo ${MAX_FILE_SIZE_MB}MB.`,
          variant: "destructive",
        });
        onChange(null);
        setPreview(null);
        return;
      }
      onChange(file);
    } else {
      onChange(null);
      setPreview(imageItem?.imageUrl || null);
    }
  };

  const handleSubmit = async (values: ImageFormValues) => {
    setIsSubmitting(true);
    try {
      await onSubmit({
        file: values.file,
        tag: values.tag,
        venueId,
        imageUrl: values.imageUrl,
        position: values.position,
        description: values.description,
        responsiveMode: values.responsiveMode,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <FormLayout
      form={form}
      title={imageItem ? 'Editar Imagem' : 'Nova Imagem'}
      onSubmit={handleSubmit}
      onCancel={onCancel}
      isSubmitting={isSubmitting}
      isEditing={!!imageItem}
      onDelete={handleDelete}
      entityName={imageItem?.description}
      entityType="imagem"
      isDeleting={isDeleting}
    >
      {/* Preview da imagem */}
      {preview && (
        <div className="flex justify-center mb-4">
          <img
            src={preview}
            alt="Preview"
            className="max-h-40 rounded shadow border"
            style={{ objectFit: "contain" }}
            onError={e => (e.currentTarget.style.display = "none")}
          />
        </div>
      )}
      <FormField
        control={form.control}
        name="file"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Upload de Imagem</FormLabel>
            <FormControl>
              <Input
                type="file"
                accept="image/*"
                required
                onChange={e => handleFileChange(e, field.onChange)}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="tag"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Tag</FormLabel>
            <FormControl>
              <Input
                placeholder="Tag da imagem"
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
        name="responsiveMode"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Modo Responsivo</FormLabel>
            <FormControl>
              <Input
                placeholder="Ex: desktop, mobile, etc"
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
        name="description"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Descrição</FormLabel>
            <FormControl>
              <Input
                placeholder="Descrição da imagem"
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
                placeholder="Posição da imagem"
                className="mt-1"
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