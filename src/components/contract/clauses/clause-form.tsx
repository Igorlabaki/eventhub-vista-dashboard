import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { showSuccessToast } from "@/components/ui/success-toast";
import { useState, useRef } from "react";
import { useClauseStore } from "@/store/clauseStore";
import { useToast } from "@/hooks/use-toast";
import { handleBackendSuccess, handleBackendError } from "@/lib/error-handler";
import { FormLayout } from "@/components/ui/form-layout";
import { DynamicFieldSelector } from "@/components/ui/dynamic-field-selector";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Clause } from "@/types/clause";

const formSchema = z.object({
  title: z.string().min(1, "Título é obrigatório"),
  text: z.string().min(1, "Texto é obrigatório"),
});

type ClauseFormValues = z.infer<typeof formSchema>;

interface ClauseFormProps {
  clause?: Clause | null;
  onSubmit: (data: ClauseFormValues) => Promise<void>;
  onCancel: () => void;
}

export function ClauseForm({ clause, onSubmit, onCancel }: ClauseFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const contentRef = useRef<HTMLTextAreaElement>(null);
  const { deleteClause } = useClauseStore();
  const { toast } = useToast();

  const form = useForm<ClauseFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: clause?.title ?? "",
      text: clause?.text ?? "",
    },
  });

  React.useEffect(() => {
    form.reset({
      title: clause?.title ?? "",
      text: clause?.text ?? "",
    });
  }, [clause, form]);

  const handleDelete = async () => {
    if (!clause) return;
    setIsDeleting(true);
    try {
      const response = await deleteClause(clause.id);
      const { title, message } = handleBackendSuccess(response, "Cláusula excluída com sucesso!");
      showSuccessToast({
        title,
        description: message
      });
      onCancel();
    } catch (error: unknown) {
      const { title, message } = handleBackendError(error, "Erro ao excluir cláusula. Tente novamente mais tarde.");
      toast({
        title,
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSubmit = async (values: ClauseFormValues) => {
    setIsSubmitting(true);
    try {
      await onSubmit(values);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Inserção de campo dinâmico
  const handleInsertDynamicField = (field: string, display: string) => {
    const textarea = contentRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const currentContent = form.getValues().text;
    const newContent =
      currentContent.substring(0, start) +
      `[${display}]` +
      currentContent.substring(end);
    form.setValue("text", newContent);
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + display.length + 2, start + display.length + 2);
    }, 0);
  };

  return (
    <FormLayout
      form={form}
      title={clause ? 'Editar Cláusula' : 'Nova Cláusula'}
      onSubmit={handleSubmit}
      onCancel={onCancel}
      isSubmitting={isSubmitting}
      isEditing={!!clause}
      onDelete={handleDelete}
      entityName={clause?.title}
      entityType="cláusula"
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
                placeholder="Digite o título da cláusula"
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
                placeholder="Digite o texto da cláusula"
                required
                className="mt-1"
                rows={10}
                ref={contentRef}
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <div className="bg-gray-100 p-3 rounded-md">
        <h4 className="text-sm font-medium mb-2">
          Inserir campos dinâmicos
        </h4>
        <DynamicFieldSelector
          onSelectField={(field, display) => {
            handleInsertDynamicField(field, display);
            return false;
          }}
        />
      </div>
    </FormLayout>
  );
}
