import * as React from "react";
import { cn } from "@/lib/utils";
import { FilterList } from "@/components/filterList";
import { EmptyState } from "@/components/EmptyState";
import { Pencil, Trash2, Plus } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { QuestionListSkeleton } from "@/components/question/question-list-skeleton";
import { ConfirmDeleteDialog } from "@/components/ui/confirm-delete-dialog";
import { Question } from "@/types/question";
import { useQuestionStore } from "@/store/questionStore";
import { showSuccessToast } from "@/components/ui/success-toast";
import { useToast } from "@/hooks/use-toast";
import { handleBackendSuccess, handleBackendError } from "@/lib/error-handler";

interface QuestionListProps {
  questions: Question[];
  onDeleteQuestion?: (question: Question) => void;
  searchPlaceholder?: string;
  emptyMessage?: string;
  className?: string;
  selectedQuestionIds?: string[];
  isLoading?: boolean;
  isDeleting?: boolean;
  onCreateClick: () => void;
  onEditClick: (question: Question) => void;
}

export function QuestionList({
  questions,
  onDeleteQuestion,
  searchPlaceholder = "Filtrar perguntas...",
  emptyMessage = "Nenhuma pergunta encontrada",
  className,
  selectedQuestionIds = [],
  isLoading = false,
  isDeleting = false,
  onCreateClick,
  onEditClick
}: QuestionListProps) {
  const [questionToDelete, setQuestionToDelete] = React.useState<Question | null>(null);
  const { deleteQuestion } = useQuestionStore();
  const { toast } = useToast();

  const handleDelete = async (questionId: string) => {
    try {
      const response = await deleteQuestion(questionId);
      const { title, message } = handleBackendSuccess(response, "Pergunta excluída com sucesso!");
      showSuccessToast({
        title,
        description: message
      });
      setQuestionToDelete(null);
    } catch (error: unknown) {
      const { title, message } = handleBackendError(error, "Erro ao excluir pergunta. Tente novamente mais tarde.");
      toast({
        title,
        description: message,
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return <QuestionListSkeleton />;
  }

  return (
    <>
      {/* Botão web no topo direito */}
      <div className="hidden md:flex justify-end mb-4">
        <button
          onClick={onCreateClick}
          className="flex items-center gap-2 bg-[#8854D0] text-white font-medium px-5 py-2 rounded-lg shadow hover:bg-[#6c3fc9] transition-colors"
        >
          <Plus className="h-5 w-5" />
          Nova Pergunta
        </button>
      </div>

      <div className={cn("space-y-4", className)}>
        <FilterList
          items={questions}
          filterBy={(question, query) =>
            question.question.toLowerCase().includes(query.toLowerCase())
          }
          placeholder={searchPlaceholder}
        >
          {(filteredQuestions) =>
            filteredQuestions?.length === 0 ? (
              <EmptyState
                title={emptyMessage}
                actionText="Nova Pergunta"
                onAction={onCreateClick}
              />
            ) : (
              <Table className="bg-white rounded-md shadow-lg ">
                <TableHeader>
                  <TableRow>
                    <TableHead>Pergunta</TableHead>
                    <TableHead className="w-[100px] text-center">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredQuestions.map((question) => (
                    <TableRow 
                      key={question.id}
                      className={cn(
                        "hover:bg-gray-50",
                        selectedQuestionIds.includes(question.id) && "bg-violet-100"
                      )}
                    >
                      <TableCell 
                        className="font-medium cursor-pointer"
                        onClick={() => onEditClick(question)}
                      >
                        {question.question}
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onEditClick(question);
                            }}
                            className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setQuestionToDelete(question);
                            }}
                            className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )
          }
        </FilterList>
      </div>
      <ConfirmDeleteDialog
        open={!!questionToDelete}
        onOpenChange={(open) => !open && setQuestionToDelete(null)}
        onConfirm={async () => {
          if (questionToDelete) {
            await handleDelete(questionToDelete.id);
          }
        }}
        entityName={questionToDelete?.question || ""}
        entityType="pergunta"
        isPending={isDeleting}
      />
    </>
  );
} 