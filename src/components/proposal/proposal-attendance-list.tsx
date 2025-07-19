import { useState } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { PersonType } from "@/types/person";

import { useParams } from "react-router-dom";
import { PersonSection } from "../person/person-section";

interface ProposalAttendanceListProps {
  hasEditPermission: boolean;
  hasConfirmPermission: boolean;
}

export function ProposalAttendanceList({ hasEditPermission, hasConfirmPermission }: ProposalAttendanceListProps) {
  const { id: proposalId } = useParams();
  const [activeTab, setActiveTab] = useState<PersonType>(PersonType.GUEST);
  const [isCreating, setIsCreating] = useState(false);
  const [selectedPerson, setSelectedPerson] = useState(null);

  const handleTabChange = (tab: PersonType) => {
    setActiveTab(tab);
    setIsCreating(false);
    setSelectedPerson(null);
  };

  const handleCreateClick = () => {
    setIsCreating(true);
    setSelectedPerson(null);
  };

  const handleCancelCreate = () => {
    setIsCreating(false);
    setSelectedPerson(null);
  };

  if (!proposalId) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="mb-6 w-full">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <Tabs value={activeTab} onValueChange={(value) => handleTabChange(value as PersonType)}>
            <TabsList className="bg-white/80 shadow-sm rounded-lg flex gap-1">
              <TabsTrigger
                value={PersonType.GUEST}
                className={
                  `px-4 py-2 text-sm font-semibold transition-all duration-200
                  ${activeTab === PersonType.GUEST
                    ? "scale-105 bg-violet-100 text-violet-700 shadow border-b-4 border-violet-500"
                    : "border-b-4 border-transparent"}`
                }
              >
                CONVIDADOS
              </TabsTrigger>
              <TabsTrigger
                value={PersonType.WORKER}
                className={
                  `px-4 py-2 text-sm font-semibold transition-all duration-200
                  ${activeTab === PersonType.WORKER
                    ? "scale-105 bg-violet-100 text-violet-700 shadow border-b-4 border-violet-500"
                    : "border-b-4 border-transparent"}`
                }
              >
                COLABORADORES
              </TabsTrigger>
            </TabsList>
          </Tabs>
          {!isCreating && !selectedPerson && hasEditPermission && (
            <Button
              className="
                bg-eventhub-primary hover:bg-indigo-600 text-white md:my-0
                font-semibold px-3 py-2 rounded-lg shadow mx-2 md:mx-0 hidden md:flex
                md:w-auto text-sm hover:scale-105 active:scale-95 transition-all duration-200"
              onClick={handleCreateClick}
            >
                 <Plus className="w-7 h-7" />
              {activeTab === PersonType.GUEST ? "Novo Convidado" : "Novo Colaborador"}
            </Button>
          )}
        </div>
        {/* Botão flutuante mobile */}
        {!isCreating && !selectedPerson && hasEditPermission && (
          <button
            className="fixed bottom-6 right-6 z-50 md:hidden bg-eventhub-primary hover:bg-indigo-6000 text-white rounded-full shadow-lg p-4 flex items-center justify-center transition-all duration-200"
            onClick={handleCreateClick}
            aria-label={activeTab === PersonType.GUEST ? "Novo Convidado" : "Novo Colaborador"}
          >
            <Plus className="w-7 h-7" />
          </button>
        )}
      </div>

      <PersonSection
        type={activeTab}
        isCreating={isCreating}
        selectedPerson={selectedPerson}
        setSelectedPerson={setSelectedPerson}
        onCreateClick={handleCreateClick}
        onCancelCreate={handleCancelCreate}
        proposalId={proposalId}
      />
    </div>
  );
} 