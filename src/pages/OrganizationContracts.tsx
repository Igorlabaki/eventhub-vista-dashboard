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
import { ClauseDialog } from "@/components/contract/clauses/clause-dialog";
import { Clause } from "@/types/clause";
import { showSuccessToast } from "@/components/ui/success-toast";
import { useToast } from "@/hooks/use-toast";
import { AttachmentsSection } from "@/components/contract/attachments/attachments-section";
import { useGetVenuesList } from "@/hooks/venue/queries/list";
import { useClauseStore } from "@/store/clauseStore";

// Mock de anexos
const mockContracts: Contract[] = [];

export default function OrganizationContracts() {
  const { id: organizationId } = useParams<{ id: string }>();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("clausulas");
  const { clauses, isLoading: isLoadingClauses, fetchClauses } = useClauseStore();
  const [contracts, setContracts] = useState<Contract[]>(mockContracts);
  const [isAttachmentDialogOpen, setIsAttachmentDialogOpen] = useState(false);
  const [isContractDialogOpen, setIsContractDialogOpen] = useState(false);
  const [selectedAttachment, setSelectedAttachment] = useState<Attachment | null | undefined>(undefined);
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreatingClause, setIsCreatingClause] = useState(false);
  const [selectedClause, setSelectedClause] = useState<Clause | null | undefined>(undefined);
  const { data: venues = [] } = useGetVenuesList(organizationId || "");

  useEffect(() => {
    if (organizationId) {
      fetchClauses(organizationId);
    }
  }, [organizationId, fetchClauses]);

  const handleAttachmentClick = (attachment: Attachment) => {
    setSelectedAttachment(attachment);
  };

  const handleContractClick = (contract: Contract) => {
    setSelectedContract(contract);
    setIsContractDialogOpen(true);
  };

  const handleCreateClause = () => {
    setIsCreatingClause(true);
  };

  const handleCreateAttachment = () => {
    setSelectedAttachment(null);
  };

  const handleCreateContract = () => {
    setSelectedContract(null);
    setIsContractDialogOpen(true);
  };

  const handleContractFormSubmit = (data: Partial<Contract>) => {
    if (selectedContract) {
      return;
    } else {
      // Criando novo contrato
     
    }
    setIsContractDialogOpen(false);
  };

  const handleAttachmentFormSubmit = (data: Partial<Attachment>) => {
    // ... lógica de submit ...
    setSelectedAttachment(undefined);
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
            (activeTab === "contratos" && selectedContract !== undefined)
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
          <div className="animate-fade-in transition-all duration-300">
            {contracts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                <FileText className="h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-600 mb-2">Nenhum contrato encontrado</h3>
                <p className="text-sm text-gray-500">
                  Os contratos da organização serão exibidos aqui.
                </p>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {contracts.map(contract => (
                  <div
                    key={contract.id}
                    className="p-4 border rounded-lg cursor-pointer hover:shadow-md"
                    onClick={() => handleContractClick(contract)}
                  >
                    <h3 className="font-medium">{contract.name}</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      {contract.name || "Sem descrição"}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
      {/* Diálogo para criação/edição de contratos */}
      <Dialog open={isContractDialogOpen} onOpenChange={setIsContractDialogOpen}>
        <DialogContent className="max-w-2xl" onClick={(e) => e.stopPropagation()}>
          <DialogHeader>
            <DialogTitle>
              {selectedContract ? "Editar Contrato" : "Novo Contrato"}
            </DialogTitle>
            <DialogDescription>
              Complete o formulário abaixo para {selectedContract ? "editar o" : "criar um novo"} contrato.
            </DialogDescription>
          </DialogHeader>
          <ContractForm
            onSubmit={handleContractFormSubmit}
            initialData={selectedContract || {}}
            isEditing={!!selectedContract}
            clauses={clauses}
            venues={venues}
          />
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
