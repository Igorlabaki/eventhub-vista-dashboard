import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { showSuccessToast } from "@/components/ui/success-toast";
import { useState, useRef, useCallback } from "react";
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
import { DynamicFieldGroup, fieldGroups } from "@/types/contract";

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

// Função utilitária para transformar {{ id }} em [DISPLAY]
function transformDynamicFieldsToDisplay(text: string, fieldGroups: DynamicFieldGroup[]): string {
  if (!text) return "";
  // Regex para pegar todos os {{ ... }}
  return text.replace(/\{\{\s*([\w.]+)\s*\}\}/g, (match, id) => {
    for (const group of fieldGroups) {
      const field = group.fields.find(f => f.id === id);
      if (field) return `[${field.display}]`;
    }
    return match; // Se não encontrar, mantém o original
  });
}

// Função utilitária para transformar [DISPLAY] em {{ id }}
function transformDisplayToDynamicFields(text: string, fieldGroups: DynamicFieldGroup[]): string {
  if (!text) return "";
  // Regex para pegar todos os [DISPLAY]
  return text.replace(/\[([A-Z0-9_]+)\]/g, (match, display) => {
    for (const group of fieldGroups) {
      const field = group.fields.find(f => f.display === display);
      if (field) return `{{${field.id}}}`;
    }
    return match; // Se não encontrar, mantém o original
  });
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
      text: clause && clause.text
        ? transformDynamicFieldsToDisplay(clause.text, fieldGroups)
        : "",
    },
  });
 
  // Atualiza os valores do formulário quando a cláusula mudar
  React.useEffect(() => {
    if (clause) {
      form.reset({
        title: clause.title ?? "",
        text: clause.text
          ? transformDynamicFieldsToDisplay(clause.text, fieldGroups)
          : "",
      });
    }
  }, [clause]);

  // Ref callback para garantir que ambos refs funcionem
  const setContentRef = useCallback((el: HTMLTextAreaElement | null) => {
    contentRef.current = el;
    if (el) {
      form.register("text").ref(el);
    }
  }, [form]);
  
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
      // Converte os campos [DISPLAY] para {{id}} antes de enviar
      const convertedValues = {
        ...values,
        text: transformDisplayToDynamicFields(values.text, fieldGroups),
      };
      await onSubmit(convertedValues);
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
    form.setValue("text", newContent, { shouldDirty: true, shouldTouch: true });
    form.trigger("text");
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
                {...field}
                placeholder="Digite o texto da cláusula"
                required
                className="mt-1"
                rows={10}
                ref={el => {
                  field.ref(el);
                  contentRef.current = el;
                }}
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
          onSelectField={handleInsertDynamicField}
        />
      </div>
    </FormLayout>
  );
}
