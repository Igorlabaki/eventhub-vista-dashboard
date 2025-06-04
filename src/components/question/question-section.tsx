import { Question } from "@/types/question";
import { QuestionList } from "./question-list";
import { QuestionListSkeleton } from "./question-list-skeleton";
import { QuestionForm } from "./question-form";
import { useQuestionStore } from "@/store/questionStore";
import { showSuccessToast } from "@/components/ui/success-toast";
import { useToast } from "@/hooks/use-toast";
import { handleBackendSuccess, handleBackendError } from "@/lib/error-handler";
import { AnimatedFormSwitcher } from "@/components/ui/animated-form-switcher";

interface QuestionSectionProps {
  questions: Question[];
  venueId: string;
  isLoading: boolean;
  isCreating: boolean;
  selectedQuestion: Question | null | undefined;
  setSelectedQuestion: (question: Question | null | undefined) => void;
  onCreateClick: () => void;
  onCancelCreate: () => void;
}

export function QuestionSection({
  questions,
  venueId,
  isLoading,
  isCreating,
  selectedQuestion,
  setSelectedQuestion,
  onCreateClick,
  onCancelCreate,
}: QuestionSectionProps) {
  const { createQuestion, updateQuestion } = useQuestionStore();
  const { toast } = useToast();

  const handleSubmit = async (data: { question: string; response: string }) => {
    try {
      let response;
      if (selectedQuestion) {
        response = await updateQuestion({
          questionId: selectedQuestion.id,
          venueId,
          data: {
            question: data.question,
            response: data.response,
          },
        });
        const { title, message } = handleBackendSuccess(response, "Pergunta atualizada com sucesso!");
        showSuccessToast({
          title,
          description: message
        });
      } else {
        response = await createQuestion({
          question: data.question,
          response: data.response,
          venueId,
        });
        const { title, message } = handleBackendSuccess(response, "Pergunta criada com sucesso!");
        showSuccessToast({
          title,
          description: message
        });
      }
      setSelectedQuestion(undefined);
      onCancelCreate();
    } catch (error: unknown) {
      const { title, message } = handleBackendError(error, "Erro ao salvar pergunta. Tente novamente mais tarde.");
      toast({
        title,
        description: message,
        variant: "destructive",
      });
    }
  };

  const showForm = isCreating || !!selectedQuestion;

  return (
    <div className="animate-fade-in">
      {isLoading ? (
        <QuestionListSkeleton />
      ) : (
        <AnimatedFormSwitcher
          showForm={showForm}
          list={
            <QuestionList
              questions={questions || []}
              onCreateClick={onCreateClick}
              onEditClick={setSelectedQuestion}
            />
          }
          form={
            <QuestionForm
              questionItem={selectedQuestion}
              venueId={venueId}
              onSubmit={handleSubmit}
              onCancel={() => {
                setSelectedQuestion(undefined);
                onCancelCreate();
              }}
            />
          }
        />
      )}
    </div>
  );
} 