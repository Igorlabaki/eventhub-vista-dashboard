import { Contract } from "@/types/contract";
import { ContractList } from "./contract-list";
import { ContractListSkeleton } from "./contract-list-skeleton";
import { AnimatedFormSwitcher } from "@/components/ui/animated-form-switcher";
import { ContractForm } from "./contract-form";
import { Clause } from "@/types/clause";
import { Venue } from "@/components/ui/venue-list";
import { PageHeader } from "@/components/PageHeader";
import { useUserOrganizationPermissionStore } from "@/store/userOrganizationPermissionStore";

type ContractClausePayload = { text: string; title: string; position: number };
type ContractPayload = {
  name: string;
  title: string;
  venues: Venue[];
  clauses: ContractClausePayload[];
  // outros campos se necessário
};

interface ContractSectionProps {
  contracts: Contract[];
  organizationId: string;
  isLoading: boolean;
  isCreating: boolean;
  selectedContract: Contract | null | undefined;
  setSelectedContract: (contract: Contract | null | undefined) => void;
  onCreateClick: () => void;
  onCancelCreate: () => void;
  onSubmit: (data: ContractPayload) => void;
  clauses: Clause[];
  venues: Venue[];
  onEditClick?: (contract: Contract) => void;
  onDeleteContract?: (contract: Contract) => void;
}

export default function ContractSection({
  contracts,
  organizationId,
  isLoading,
  isCreating,
  selectedContract,
  setSelectedContract,
  onCreateClick,
  onCancelCreate,
  onSubmit,
  clauses,
  venues,
  onEditClick,
  onDeleteContract,
}: ContractSectionProps) {
  const showForm = isCreating || !!selectedContract;
  const { currentUserOrganizationPermission } = useUserOrganizationPermissionStore();
  
  const hasEditPermission = () => {
    if (!currentUserOrganizationPermission?.permissions) return false;
    return currentUserOrganizationPermission.permissions.includes(
      "EDIT_ORG_CONTRACTS"
    );
  };

  return (
    <div className="animate-fade-in">
      {hasEditPermission() && (
        <PageHeader onCreateClick={onCreateClick} isFormOpen={showForm}  createButtonText="Novo Contrato"/>
      )}
      {isLoading ? (
        <ContractListSkeleton />
      ) : (
        <AnimatedFormSwitcher
          showForm={showForm}
          list={
            <ContractList
              contracts={contracts || []}
              onCreateClick={onCreateClick}
              onEditClick={onEditClick || setSelectedContract}
              onDeleteContract={onDeleteContract}
            />
          }
          form={
            <ContractForm
              onSubmit={onSubmit}
              initialData={selectedContract || {}}
              isEditing={!!selectedContract}
              clauses={clauses}
              venues={venues}
              onCancel={() => {
                setSelectedContract(undefined);
                onCancelCreate();
              }}
              onDelete={id => {
                const contract = contracts.find(c => c.id === id);
                if (contract && onDeleteContract) onDeleteContract(contract);
              }}
            />
          }
        />
      )}
    </div>
  );
} 