import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { QuestionSection } from "@/components/question/question-section";
import { useQuestionStore } from "@/store/questionStore";
import { useOrganizationStore } from "@/store/organizationStore";
import { Question } from "@/types/question";
import { PageHeader } from "@/components/PageHeader";

export default function OrganizationWebsiteFaq() {
  const { currentOrganization: organization } = useOrganizationStore();
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
    if (organization?.id) {
      fetchQuestions({ organization: organization.id });
    }
  }, [organization?.id, fetchQuestions]);

  return (
    <DashboardLayout title="FAQ do Site" subtitle="Gerencie as perguntas frequentes do site da sua organização">
      <div className="space-y-6">
        <PageHeader
          onCreateClick={handleCreateClick}
          createButtonText="Nova Pergunta"
          isFormOpen={isCreating || !!selectedQuestion}
        />

        <QuestionSection
          questions={questions}
          organizationId={organization?.id}
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