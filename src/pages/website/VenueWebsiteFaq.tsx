import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { QuestionSection } from "@/components/question/question-section";
import { useQuestionStore } from "@/store/questionStore";
import { useVenueStore } from "@/store/venueStore";
import { Question } from "@/types/question";
import { PageHeader } from "@/components/PageHeader";
import { useUserVenuePermissionStore } from "@/store/userVenuePermissionStore";

export default function VenueWebsiteFaq() {
  const { selectedVenue: venue } = useVenueStore();
  const { currentUserVenuePermission } = useUserVenuePermissionStore();
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

  const hasEditPermission = () => {
    if (!currentUserVenuePermission || !currentUserVenuePermission.permissions) return false;
    return currentUserVenuePermission.permissions.includes(
      "EDIT_VENUE_SITE"
    );
  };

  return (
    <DashboardLayout title="FAQ do Site" subtitle="Gerencie as perguntas frequentes do seu site">
      <div className="space-y-6">
        {hasEditPermission() && (
          <PageHeader
            onCreateClick={handleCreateClick}
            createButtonText="Nova Pergunta"
            isFormOpen={isCreating || !!selectedQuestion}
          />
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