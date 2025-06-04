import * as React from "react";
import { cn } from "@/lib/utils";
import { FilterList } from "@/components/filterList";
import { EmptyState } from "@/components/EmptyState";
import { Pencil, Trash2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ContractListSkeleton } from "./contract-list-skeleton";
import { ConfirmDeleteDialog } from "@/components/ui/confirm-delete-dialog";
import { Contract } from "@/types/contract";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface ContractListProps {
  contracts: Contract[];
  onDeleteContract?: (contract: Contract) => void;
  searchPlaceholder?: string;
  emptyMessage?: string;
  className?: string;
  selectedContractIds?: string[];
  isLoading?: boolean;
  isDeleting?: boolean;
  onCreateClick: () => void;
  onEditClick: (contract: Contract) => void;
}

export function ContractList({
  contracts,
  onDeleteContract,
  searchPlaceholder = "Filtrar contratos...",
  emptyMessage = "Nenhum contrato encontrado",
  className,
  selectedContractIds = [],
  isLoading = false,
  isDeleting = false,
  onCreateClick,
  onEditClick,
}: ContractListProps) {
  const [contractToDelete, setContractToDelete] = React.useState<Contract | null>(null);

  if (isLoading) {
    return <ContractListSkeleton />;
  }

  return (
    <>
      <div className={cn("space-y-4", className)}>
        <FilterList
          items={contracts}
          filterBy={(contract, query) =>
            contract.name.toLowerCase().includes(query.toLowerCase())
          }
          placeholder={searchPlaceholder}
        >
          {(filteredContracts) =>
            filteredContracts?.length === 0 ? (
              <EmptyState
                title={emptyMessage}
                actionText="Novo Contrato"
                onAction={onCreateClick}
              />
            ) : (
              <Table className="bg-white rounded-md shadow-lg ">
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome do Contrato</TableHead>
                    <TableHead className="w-[100px] text-center">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredContracts.map((contract) => (
                    <TableRow
                      key={contract.id}
                      className={cn(
                        "hover:bg-gray-50",
                        selectedContractIds.includes(contract.id) && "bg-violet-100"
                      )}
                    >
                      <TableCell
                        className="font-medium cursor-pointer"
                        onClick={() => onEditClick(contract)}
                      >
                        {contract.name}
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onEditClick(contract);
                            }}
                            className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setContractToDelete(contract);
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
        open={!!contractToDelete}
        onOpenChange={(open) => !open && setContractToDelete(null)}
        onConfirm={async () => {
          if (contractToDelete && onDeleteContract) {
            await onDeleteContract(contractToDelete);
          }
        }}
        entityName={contractToDelete?.name || ""}
        entityType="contrato"
        isPending={isDeleting}
      />
    </>
  );
} 