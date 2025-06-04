import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { QuestionSection } from "@/components/question/question-section";
import { useQuestionStore } from "@/store/questionStore";
import { useVenueStore } from "@/store/venueStore";
import { Question } from "@/types/question";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function VenueWebsiteFaq() {
  const { selectedVenue: venue } = useVenueStore();
  const { questions, isLoading, fetchQuestions } = useQuestionStore();
  const [isCreating, setIsCreating] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null | undefined>(undefined);

  const handleCreateClick = () => {
    setIsCreating(true);
    setSelectedQuestion(null);
  };

  const handleCancelCreate = () => {
    setIsCreating(false);
    setSelectedQuestion(null);
  };

  useEffect(() => {
    if (venue.id) {
      fetchQuestions({ venueId: venue.id });
    }
  }, [venue.id, fetchQuestions]);

  return (
    <DashboardLayout title="FAQ do Site" subtitle="Gerencie as perguntas frequentes do seu site">
      <div className="space-y-6">
        {/* Botão topo direito (web) */}
        {!isCreating && !selectedQuestion && (
          <div className="flex items-center justify-end">
            <Button
              className="bg-violet-500 hover:bg-violet-600 text-white font-semibold px-3 py-2 rounded-lg shadow mx-2 md:mx-0 hidden md:block md:w-auto text-sm hover:scale-105 active:scale-95 transition-all duration-200"
              onClick={handleCreateClick}
            >
              Nova Pergunta
            </Button>
          </div>
        )}

        {/* Botão flutuante mobile */}
        {!isCreating && !selectedQuestion && (
          <button
            className="fixed bottom-6 right-6 z-50 md:hidden bg-violet-500 hover:bg-violet-600 text-white rounded-full shadow-lg p-4 flex items-center justify-center transition-all duration-200"
            onClick={handleCreateClick}
            aria-label="Nova Pergunta"
          >
            <Plus className="w-7 h-7" />
          </button>
        )}

        <QuestionSection
          questions={questions}
          venueId={venue.id || ""}
          isLoading={isLoading}
          isCreating={isCreating}
          selectedQuestion={selectedQuestion}
          setSelectedQuestion={setSelectedQuestion}
          onCreateClick={handleCreateClick}
          onCancelCreate={handleCancelCreate}
        />
      </div>
    </DashboardLayout>
  );
} 