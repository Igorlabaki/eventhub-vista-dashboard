import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { showSuccessToast } from "@/components/ui/success-toast";
import { useState } from "react";
import { useQuestionStore } from "@/store/questionStore";
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
import { Question } from "@/types/question";

const formSchema = z.object({
  question: z.string().min(1, "Pergunta é obrigatória"),
  response: z.string().min(1, "Resposta é obrigatória"),
});

type QuestionFormValues = z.infer<typeof formSchema>;

interface QuestionFormProps {
  questionItem?: Question | null;
  venueId: string;
  onSubmit: (data: { question: string; response: string }) => Promise<void>;
  onCancel: () => void;
}

export function QuestionForm({ questionItem, venueId, onSubmit, onCancel }: QuestionFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { deleteQuestion } = useQuestionStore();
  const { toast } = useToast();

  const form = useForm<QuestionFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      question: questionItem?.question ?? "",
      response: questionItem?.response ?? "",
    },
  });

  React.useEffect(() => {
    form.reset({
      question: questionItem?.question ?? "",
      response: questionItem?.response ?? "",
    });
  }, [questionItem, form]);

  const handleDelete = async () => {
    if (!questionItem) return;
    setIsDeleting(true);
    try {
      const response = await deleteQuestion(questionItem.id);
      const { title, message } = handleBackendSuccess(response, "Pergunta excluída com sucesso!");
      showSuccessToast({
        title,
        description: message
      });
      onCancel();
    } catch (error: unknown) {
      const { title, message } = handleBackendError(error, "Erro ao excluir pergunta. Tente novamente mais tarde.");
      toast({
        title,
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSubmit = async (values: QuestionFormValues) => {
    setIsSubmitting(true);
    try {
      await onSubmit({
        question: values.question,
        response: values.response,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <FormLayout
      form={form}
      title={questionItem ? 'Editar Pergunta' : 'Nova Pergunta'}
      onSubmit={handleSubmit}
      onCancel={onCancel}
      isSubmitting={isSubmitting}
      isEditing={!!questionItem}
      onDelete={handleDelete}
      entityName={questionItem?.question}
      entityType="pergunta"
      isDeleting={isDeleting}
    >
      <FormField
        control={form.control}
        name="question"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Pergunta</FormLabel>
            <FormControl>
              <Input
                placeholder="Digite a pergunta"
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
        name="response"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Resposta</FormLabel>
            <FormControl>
              <Textarea
                placeholder="Digite a resposta"
                required
                className="mt-1 min-h-[120px]"
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