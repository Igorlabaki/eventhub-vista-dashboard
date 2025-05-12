
import { useState } from "react";
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
import { ClauseForm } from "@/components/clause-form";
import { ContractForm } from "@/components/contract-form";
import { AttachmentForm } from "@/components/attachment-form";
import { ClauseList } from "@/components/ui/clause-list";
import { Clause, Contract, Attachment } from "@/types/contract";
import { v4 as uuidv4 } from "uuid";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

// Mock data para demonstração
const mockClauses: Clause[] = [
  {
    id: "1",
    title: "O LOCADOR",
    content: "{{owner.completeName}}, RG {{owner.rg}}, CPF {{owner.cpf}}, Brasileiro, residente e domiciliado na {{owner.street}} {{owner.streetNumber}}, {{owner.city}}/{{owner.state}}, CEP {{owner.cep}}",
    tags: ["proprietário", "identificação"],
    createdAt: new Date()
  },
  {
    id: "2",
    title: "O (A) LOCATÁRIO(A) (PJ)",
    content: "{{client.name}}, CNPJ {{client.cnpj}}, com sede {{client.street}} {{client.streetNumber}}",
    tags: ["cliente", "identificação", "pessoa jurídica"],
    createdAt: new Date()
  },
  {
    id: "3",
    title: "IMÓVEL LOCADO (AR756)",
    content: "Locação por temporada do pavimento térreo do imóvel, nomeado ({{venue.name}}), localizada na ({{venue.address}})",
    tags: ["imóvel", "localização"],
    createdAt: new Date()
  },
  {
    id: "4",
    title: "MÓVEIS E UTENSÍLIOS",
    content: "O imóvel possui os móveis e utensílios elencados no Anexo I deste contrato.",
    tags: ["móveis", "utensílios", "inventário"],
    createdAt: new Date()
  },
  {
    id: "5",
    title: "DOS TERMOS DE USO DO ESPAÇO",
    content: "O espaço poderá ser utilizado no dia {{proposal.startDate}} das {{proposal.checkIn}} até o dia {{proposal.endDate}} às {{proposal.checkOut}}.",
    tags: ["termos", "uso", "horários"],
    createdAt: new Date()
  }
];

// Mock de anexos
const mockAttachments: Attachment[] = [
  {
    id: "1",
    title: "ANEXO I - MOBILIÁRIO",
    content: "Lista de mobiliário disponível na locação...",
    venueIds: ["2"],
    createdAt: new Date(),
    organizationId: "1"
  },
  {
    id: "2",
    title: "ANEXO II - TERMOS DE UTILIZAÇÃO DO ESPAÇO",
    content: "Regras para utilização do espaço...",
    venueIds: ["2"],
    createdAt: new Date(),
    organizationId: "1"
  }
];

const mockContracts: Contract[] = [];

const mockVenues = [
  { id: "1", name: "Guacá House" },
  { id: "2", name: "AR756" },
];

export default function OrganizationContracts() {
  const { id: organizationId } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState("clausulas");
  const [clauses, setClauses] = useState<Clause[]>(mockClauses);
  const [attachments, setAttachments] = useState<Attachment[]>(mockAttachments);
  const [contracts, setContracts] = useState<Contract[]>(mockContracts);
  const [isClauseDialogOpen, setIsClauseDialogOpen] = useState(false);
  const [isAttachmentDialogOpen, setIsAttachmentDialogOpen] = useState(false);
  const [isContractDialogOpen, setIsContractDialogOpen] = useState(false);
  const [selectedClause, setSelectedClause] = useState<Clause | null>(null);
  const [selectedAttachment, setSelectedAttachment] = useState<Attachment | null>(null);
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const handleClauseClick = (clause: Clause) => {
    setSelectedClause(clause);
    setIsClauseDialogOpen(true);
  };

  const handleAttachmentClick = (attachment: Attachment) => {
    setSelectedAttachment(attachment);
    setIsAttachmentDialogOpen(true);
  };

  const handleContractClick = (contract: Contract) => {
    setSelectedContract(contract);
    setIsContractDialogOpen(true);
  };

  const handleCreateClause = () => {
    setSelectedClause(null);
    setIsClauseDialogOpen(true);
  };

  const handleCreateAttachment = () => {
    setSelectedAttachment(null);
    setIsAttachmentDialogOpen(true);
  };

  const handleCreateContract = () => {
    setSelectedContract(null);
    setIsContractDialogOpen(true);
  };

  const handleClauseFormSubmit = (data: Partial<Clause>) => {
    if (selectedClause) {
      // Editando cláusula existente
      setClauses(prevClauses =>
        prevClauses.map(clause =>
          clause.id === selectedClause.id
            ? { ...clause, ...data }
            : clause
        )
      );
    } else {
      // Criando nova cláusula
      const newClause: Clause = {
        id: uuidv4(),
        title: data.title || "",
        content: data.content || "",
        tags: data.tags || [],
        createdAt: new Date()
      };
      setClauses(prevClauses => [...prevClauses, newClause]);
    }
    setIsClauseDialogOpen(false);
  };

  const handleAttachmentFormSubmit = (data: Partial<Attachment>) => {
    if (selectedAttachment) {
      // Editando anexo existente
      setAttachments(prevAttachments =>
        prevAttachments.map(attachment =>
          attachment.id === selectedAttachment.id
            ? { ...attachment, ...data }
            : attachment
        )
      );
    } else {
      // Criando novo anexo
      const newAttachment: Attachment = {
        id: uuidv4(),
        title: data.title || "",
        content: data.content || "",
        venueIds: data.venueIds || [],
        createdAt: new Date(),
        organizationId: organizationId
      };
      setAttachments(prevAttachments => [...prevAttachments, newAttachment]);
    }
    setIsAttachmentDialogOpen(false);
  };

  const handleContractFormSubmit = (data: Partial<Contract>) => {
    if (selectedContract) {
      // Editando contrato existente
      setContracts(prevContracts =>
        prevContracts.map(contract =>
          contract.id === selectedContract.id
            ? { ...contract, ...data }
            : contract
        )
      );
    } else {
      // Criando novo contrato
      const newContract: Contract = {
        id: uuidv4(),
        name: data.name || "",
        description: data.description,
        clauses: data.clauses || [],
        venueIds: data.venueIds || [],
        createdAt: new Date(),
        organizationId: organizationId || ""
      };
      setContracts(prevContracts => [...prevContracts, newContract]);
    }
    setIsContractDialogOpen(false);
  };

  // Filtrar anexos com base na busca
  const filteredAttachments = attachments.filter(attachment => 
    attachment.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Função para obter o nome da venue pelo ID
  const getVenueNameById = (venueId: string) => {
    const venue = mockVenues.find(v => v.id === venueId);
    return venue ? venue.name : "";
  };

  return (
    <DashboardLayout
      title="Contratos"
      subtitle="Gerencie as cláusulas, anexos e contratos da organização"
    >
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="flex justify-between items-center mb-6">
          <TabsList>
            <TabsTrigger value="clausulas">CLÁUSULAS</TabsTrigger>
            <TabsTrigger value="anexos">ANEXOS</TabsTrigger>
            <TabsTrigger value="contratos">CONTRATOS</TabsTrigger>
          </TabsList>
          <Button 
            onClick={
              activeTab === "clausulas" ? handleCreateClause : 
              activeTab === "anexos" ? handleCreateAttachment : 
              handleCreateContract
            }
          >
            <Plus className="mr-2 h-4 w-4" />
            {activeTab === "clausulas" ? "Nova Cláusula" : 
             activeTab === "anexos" ? "Novo Anexo" : 
             "Novo Contrato"}
          </Button>
        </div>

        {activeTab === "anexos" && (
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
            <Input
              placeholder="Filtrar..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        )}

        <TabsContent value="clausulas" className="mt-6">
          <ClauseList
            clauses={clauses}
            onClauseClick={handleClauseClick}
          />
        </TabsContent>

        <TabsContent value="anexos" className="mt-6">
          {filteredAttachments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-300">
              <FileText className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-600 mb-2">Nenhum anexo encontrado</h3>
              <p className="text-sm text-gray-500">
                Os anexos dos contratos serão exibidos aqui.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredAttachments.map(attachment => (
                <div 
                  key={attachment.id} 
                  className="p-4 border rounded-lg cursor-pointer hover:shadow-md"
                  onClick={() => handleAttachmentClick(attachment)}
                >
                  <div className="flex justify-between">
                    <h3 className="font-medium">{attachment.title}</h3>
                    {attachment.venueIds && attachment.venueIds.length > 0 && (
                      <span className="text-sm bg-gray-100 px-2 py-1 rounded">
                        {getVenueNameById(attachment.venueIds[0])}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="contratos" className="mt-6">
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
                    {contract.description || "Sem descrição"}
                  </p>
                  <div className="mt-2 text-sm text-gray-600">
                    <span>{contract.clauses.length} cláusulas</span>
                    <span className="mx-1">•</span>
                    <span>{new Date(contract.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Diálogo para criação/edição de cláusulas */}
      <Dialog open={isClauseDialogOpen} onOpenChange={setIsClauseDialogOpen}>
        <DialogContent className="max-w-2xl" onClick={(e) => e.stopPropagation()}>
          <DialogHeader>
            <DialogTitle>
              {selectedClause ? "Editar Cláusula" : "Nova Cláusula"}
            </DialogTitle>
            <DialogDescription>
              Complete o formulário abaixo para {selectedClause ? "editar a" : "criar uma nova"} cláusula.
            </DialogDescription>
          </DialogHeader>
          <ClauseForm
            onSubmit={handleClauseFormSubmit}
            initialData={selectedClause || {}}
            isEditing={!!selectedClause}
          />
        </DialogContent>
      </Dialog>

      {/* Diálogo para criação/edição de anexos */}
      <Dialog open={isAttachmentDialogOpen} onOpenChange={setIsAttachmentDialogOpen}>
        <DialogContent className="max-w-2xl" onClick={(e) => e.stopPropagation()}>
          <DialogHeader>
            <DialogTitle>
              {selectedAttachment ? "Editar Anexo" : "Novo Anexo"}
            </DialogTitle>
            <DialogDescription>
              Complete o formulário abaixo para {selectedAttachment ? "editar o" : "criar um novo"} anexo.
            </DialogDescription>
          </DialogHeader>
          <AttachmentForm
            onSubmit={handleAttachmentFormSubmit}
            initialData={selectedAttachment || {}}
            isEditing={!!selectedAttachment}
            venues={mockVenues}
          />
        </DialogContent>
      </Dialog>

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
            venues={mockVenues}
          />
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
