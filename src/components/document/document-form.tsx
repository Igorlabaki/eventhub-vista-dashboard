import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { FormLayout } from "@/components/ui/form-layout";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Document, DocumentType } from "@/types/document";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CreateDocumentDTO, UpdateDocumentDTO } from "@/types/document";

interface DocumentFormProps {
  document?: Document | null;
  proposalId: string;
  onSubmit: (data: CreateDocumentDTO) => Promise<void>;
  onUpdate: (data: UpdateDocumentDTO) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onCancel: () => void;
}

type DocumentFormValues = {
  title: string;
  fileType: DocumentType;
  file?: File | null;
};

export function DocumentForm({ document, proposalId, onSubmit, onUpdate, onDelete, onCancel }: DocumentFormProps) {
  const isEditing = !!document;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [preview, setPreview] = useState<string | null>(document?.imageUrl || null);

  const formSchema = z.object({
    title: z.string().min(1, "Título é obrigatório"),
    fileType: z.nativeEnum(DocumentType, {
      required_error: "Tipo de arquivo é obrigatório",
    }),
    file: z.any().optional(),
  });

  const form = useForm<DocumentFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: document?.title || '',
      fileType: document?.fileType || undefined,
      file: null,
    },
  });

  React.useEffect(() => {
    form.reset({
      title: document?.title || '',
      fileType: document?.fileType || undefined,
      file: null,
    });
    setPreview(document?.imageUrl || null);
  }, [document, form]);

  const handleDelete = async () => {
    if (!document) return;
    setIsDeleting(true);
    try {
      await onDelete(document.id);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>, onChange: (file: File | null) => void) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      const url = URL.createObjectURL(file);
      setPreview(url);
      onChange(file);
    } else {
      setPreview(document?.imageUrl || null);
      onChange(null);
    }
  };

  const handleSubmit = async (values: DocumentFormValues) => {
    setIsSubmitting(true);
    try {
      if (document) {
        await onUpdate({
          documentId: document.id,
          title: values.title,
          fileType: values.fileType,
          file: values.file,
        });
      } else {
        await onSubmit({
          title: values.title,
          proposalId,
          fileType: values.fileType,
          file: values.file,
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <FormLayout
      form={form}
      title={document ? 'Editar Documento' : 'Novo Documento'}
      onSubmit={handleSubmit}
      onCancel={onCancel}
      isSubmitting={isSubmitting}
      isEditing={!!document}
      onDelete={handleDelete}
      entityName={document?.title || ""}
      entityType="documento"
      isDeleting={isDeleting}
    >
      <FormField
        control={form.control}
        name="title"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Título</FormLabel>
            <FormControl>
              <Input
                type="text"
                placeholder="Digite o título do documento"
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
        name="fileType"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Tipo de Arquivo</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo de arquivo" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value={DocumentType.PDF}>PDF</SelectItem>
                <SelectItem value={DocumentType.IMAGE}>Imagem</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="file"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Arquivo</FormLabel>
            <FormControl>
              <Input
                type="file"
                accept={form.watch("fileType") === DocumentType.PDF ? "application/pdf" : "image/*"}
                onChange={(e) => {
                  const file = e.target.files?.[0] || null;
                  setPreview(file ? URL.createObjectURL(file) : document?.imageUrl || null);
                  field.onChange(file);
                }}
                required={!isEditing}
              />
            </FormControl>
            {preview && (
              <div className="mt-2">
                {form.watch("fileType") === DocumentType.IMAGE ? (
                  <img
                    src={preview}
                    alt="Preview"
                    className="max-h-40 rounded border shadow"
                    style={{ cursor: 'pointer' }}
                    onClick={() => window.open(preview, '_blank')}
                  />
                ) : (
                  <a
                    href={preview}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    Visualizar PDF
                  </a>
                )}
              </div>
            )}
            <FormMessage />
          </FormItem>
        )}
      />
    </FormLayout>
  );
} 