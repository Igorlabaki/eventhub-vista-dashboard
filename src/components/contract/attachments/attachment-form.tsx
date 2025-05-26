import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Attachment } from "@/types/attachment";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FormLayout } from "@/components/ui/form-layout";
import { useAttachmentStore } from "@/store/attachmentStore";
import { showSuccessToast } from "@/components/ui/success-toast";

const formSchema = z.object({
  title: z.string().min(1, "Título é obrigatório"),
  text: z.string().min(1, "Conteúdo é obrigatório"),
  venueId: z.string().optional(),
});

type AttachmentFormValues = z.infer<typeof formSchema>;

interface VenueOption {
  id: string;
  name: string;
}

interface AttachmentFormProps {
  onCancel: () => void;
  initialData?: Partial<Attachment>;
  isEditing?: boolean;
  venues: VenueOption[];
  organizationId: string;
}

export function AttachmentForm({
  initialData,
  isEditing = false,
  venues,
  onCancel,
  organizationId,
}: AttachmentFormProps) {
  const form = useForm<AttachmentFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: initialData?.title ?? "",
      text: initialData?.text ?? "",
      venueId: initialData?.venueId ?? "",
    },
  });

  const { createAttachment, updateAttachment, deleteAttachment, isLoading } = useAttachmentStore();

  React.useEffect(() => {
    form.reset({
      title: initialData?.title ?? "",
      text: initialData?.text ?? "",
      venueId: initialData?.venueId ?? "",
    });
  }, [initialData, form]);

  const handleSubmit = async (values: AttachmentFormValues) => {
    try {
      if (initialData?.id) {
        await updateAttachment({
          attachmentId: initialData.id,
          data: {
            text: values.text,
            title: values.title,
            venueId: values.venueId,
          },
        });
        showSuccessToast({
          title: "Anexo atualizado",
          description: "O anexo foi atualizado com sucesso.",
        });
      } else {
        await createAttachment({
          text: values.text,
          title: values.title,
          organizationId,
          venueId: values.venueId || undefined,
        });
        showSuccessToast({
          title: "Anexo criado",
          description: "O anexo foi criado com sucesso.",
        });
      }
      onCancel();
    } catch (error) {
      // O erro já é tratado na store
    }
  };

  const handleDelete = async () => {
    if (!initialData?.id) return;
    try {
      await deleteAttachment(initialData.id);
      showSuccessToast({
        title: "Anexo excluído",
        description: "O anexo foi excluído com sucesso.",
      });
      onCancel();
    } catch (error) {
      // O erro já é tratado na store
    }
  };

  return (
    <FormLayout
      form={form}
      title={isEditing ? "Editar Anexo" : "Novo Anexo"}
      onSubmit={handleSubmit}
      onCancel={onCancel}
      isSubmitting={isLoading}
      isEditing={isEditing}
      onDelete={isEditing ? handleDelete : undefined}
      entityName={initialData?.title}
      entityType="anexo"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Título</FormLabel>
              <FormControl>
                <Input placeholder="Título do anexo" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="venueId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Espaço</FormLabel>
              <FormControl>
                <select
                  className="input w-full border rounded p-2"
                  {...field}
                >
                  <option value="">Selecione um espaço</option>
                  {venues.map((venue) => (
                    <option key={venue.id} value={venue.id}>
                      {venue.name}
                    </option>
                  ))}
                </select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      <FormField
        control={form.control}
        name="text"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Texto</FormLabel>
            <FormControl>
              <Textarea
                placeholder="Digite o conteúdo do anexo"
                className="min-h-[calc(100vh-300px)] resize-none"
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
