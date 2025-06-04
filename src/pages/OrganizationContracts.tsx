import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { DashboardLayout } from "@/components/DashboardLayout";
import { FileText, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription,
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { ContractForm } from "@/components/contract/contracts/contract-form";
import { AttachmentForm } from "@/components/contract/attachments/attachment-form";

import { Contract } from "@/types/contract";
import { Attachment } from "@/types/attachment";
import { v4 as uuidv4 } from "uuid";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { ContractHeader } from "@/components/contract/contract-header";
import { ClauseSection } from "@/components/contract/clauses/clause-section";
import { Clause } from "@/types/clause";
import { showSuccessToast } from "@/components/ui/success-toast";
import { useToast } from "@/hooks/use-toast";
import { AttachmentsSection } from "@/components/contract/attachments/attachments-section";
import { useGetVenuesList } from "@/hooks/venue/queries/list";
import { useClauseStore } from "@/store/clauseStore";
import ContractSection from "@/components/contract/contracts/contract-section";
import { useContractStore } from "@/store/contractStore";
import { Venue } from "@/components/ui/venue-list";
import { handleBackendSuccess, handleBackendError } from "@/lib/error-handler";

type ContractClausePayload = { text: string; title: string; position: number };
type ContractPayload = {
  name: string;
  title: string;
  venues: Venue[];
  clauses: ContractClausePayload[];
  // outros campos se necessário
};

export default function OrganizationContracts() {
  const { id: organizationId } = useParams<{ id: string }>();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("clausulas");
  const { clauses, isLoading: isLoadingClauses, fetchClauses } = useClauseStore();
  const [selectedAttachment, setSelectedAttachment] = useState<Attachment | null | undefined>(undefined);
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreatingClause, setIsCreatingClause] = useState(false);
  const [selectedClause, setSelectedClause] = useState<Clause | null | undefined>(undefined);
  const { data: venues = [] } = useGetVenuesList(organizationId || "");
  const [isCreatingContract, setIsCreatingContract] = useState(false);

  const { contracts, isLoading: isLoadingContracts, fetchContracts, createContract, updateContract, deleteContract } = useContractStore();

  useEffect(() => {
    if (organizationId) {
      fetchClauses(organizationId);
      fetchContracts({ organizationId });
    }
  }, [organizationId, fetchClauses, fetchContracts]);


  const handleCreateClause = () => {
    setIsCreatingClause(true);
  };

  const handleCreateAttachment = () => {
    setSelectedAttachment(null);
  };

  const handleCreateContract = () => {
    setSelectedContract(null);
    setIsCreatingContract(true);
  };

  const handleContractFormSubmit = async (data: ContractPayload) => {
    try {
      let response;
      if (selectedContract && selectedContract.id) {
        // Atualizar contrato existente
        response = await updateContract({
          contractId: selectedContract.id,
          name: data.name,
          title: data.title,
          venueIds: data.venues.map(v => v.id),
          clauses: data.clauses,
        });
      } else {
        // Criar novo contrato
        response = await createContract({
          name: data.name,
          title: data.title,
          organizationId: organizationId || "",
          venueIds: data.venues.map(v => v.id),
          clauses: data.clauses,
        });
        // Buscar lista completa após criar
        await fetchContracts({ organizationId });
      }
      const { title, message } = handleBackendSuccess(response, selectedContract ? "Contrato atualizado com sucesso!" : "Contrato criado com sucesso!");
      showSuccessToast({ title, description: message });
      setIsCreatingContract(false);
      setSelectedContract(null);
    } catch (error: unknown) {
      const { title, message } = handleBackendError(error, "Erro ao salvar contrato. Tente novamente mais tarde.");
      toast({ title, description: message, variant: "destructive" });
    }
  };

  const handleContractClick = (contract: Contract) => {
    setIsCreatingContract(true);
    // Mapear venues para objetos completos
    const fullVenues = venues.filter(v => contract.venues.some(cv => cv.id === v.id));
    setSelectedContract({
      ...contract,
      venues: fullVenues,
      clauses: contract.clauses, // Usar as cláusulas do contrato selecionado
    });
  };

  const handleDeleteContract = async (contract: Contract) => {
    try {
      const response = await deleteContract(contract.id);
      const { title, message } = handleBackendSuccess(response, "Contrato deletado com sucesso!");
      showSuccessToast({ title, description: message });
    } catch (error: unknown) {
      const { title, message } = handleBackendError(error, "Erro ao deletar contrato. Tente novamente mais tarde.");
      toast({ title, description: message, variant: "destructive" });
    }
  };

  return (
    <DashboardLayout>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <ContractHeader
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onActionClick={
            activeTab === "clausulas"
              ? handleCreateClause
              : activeTab === "anexos"
              ? handleCreateAttachment
              : handleCreateContract
          }
          isFormOpen={
            (activeTab === "clausulas" && (isCreatingClause || selectedClause !== undefined)) ||
            (activeTab === "anexos" && selectedAttachment !== undefined) ||
            (activeTab === "contratos" && (isCreatingContract || selectedContract !== undefined))
          }
        />

        {activeTab === "anexos" && (
          <AttachmentsSection
            organizationId={organizationId || ""}
            venues={venues}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            selectedAttachment={selectedAttachment}
            setSelectedAttachment={setSelectedAttachment}
          />
        )}

        <TabsContent value="clausulas">
          <ClauseSection
            clauses={clauses}
            organizationId={organizationId || ""}
            isLoading={isLoadingClauses}
            isCreating={isCreatingClause}
            selectedClause={selectedClause}
            setSelectedClause={setSelectedClause}
            onCreateClick={handleCreateClause}
            onCancelCreate={() => setIsCreatingClause(false)}
          />
        </TabsContent>

        <TabsContent value="contratos" className="mt-6">
          <ContractSection
            contracts={contracts}
            organizationId={organizationId || ""}
            isLoading={isLoadingContracts}
            isCreating={isCreatingContract}
            selectedContract={selectedContract}
            setSelectedContract={setSelectedContract}
            onCreateClick={handleCreateContract}
            onCancelCreate={() => setIsCreatingContract(false)}
            onSubmit={handleContractFormSubmit}
            clauses={clauses}
            venues={venues}
            onEditClick={handleContractClick}
            onDeleteContract={handleDeleteContract}
          />
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
}
