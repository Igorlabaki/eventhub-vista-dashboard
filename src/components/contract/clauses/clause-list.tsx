import * as React from "react"
import { cn } from "@/lib/utils"
import { FilterList } from "@/components/filterList"
import { EmptyState } from "@/components/EmptyState"
import { Pencil, Trash2 } from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { ClauseListSkeleton } from "./clause-list-skeleton"
import { ConfirmDeleteDialog } from "@/components/ui/confirm-delete-dialog"
import { Clause } from "@/types/clause"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { useClauseStore } from "@/store/clauseStore"
import { showSuccessToast } from "@/components/ui/success-toast"
import { useToast } from "@/hooks/use-toast"
import { handleBackendSuccess, handleBackendError } from "@/lib/error-handler"
import { useUserVenuePermissionStore } from "@/store/userVenuePermissionStore"

interface ClauseListProps {
  clauses: Clause[]
  onDeleteClause?: (clause: Clause) => void
  searchPlaceholder?: string
  emptyMessage?: string
  className?: string
  selectedClauseIds?: string[]
  isLoading?: boolean
  isDeleting?: boolean
  onCreateClick: () => void
  onEditClick: (clause: Clause) => void
  hasEditPermission: boolean
}

export function ClauseList({
  clauses,
  onDeleteClause,
  searchPlaceholder = "Filtrar cláusulas...",
  emptyMessage = "Nenhuma cláusula encontrada",
  className,
  selectedClauseIds = [],
  isLoading = false,
  isDeleting = false,
  onCreateClick,
  onEditClick,
  hasEditPermission
}: ClauseListProps) {
  const [clauseToDelete, setClauseToDelete] = React.useState<Clause | null>(null);
  const { deleteClause } = useClauseStore();
  const { toast } = useToast();
  const { currentUserVenuePermission } = useUserVenuePermissionStore();
  const handleDelete = async (clauseId: string) => {
    try {
      const response = await deleteClause(clauseId);
      const { title, message } = handleBackendSuccess(response, "Cláusula excluída com sucesso!");
      showSuccessToast({
        title,
        description: message
      });
      setClauseToDelete(null);
    } catch (error: unknown) {
      const { title, message } = handleBackendError(error, "Erro ao excluir cláusula. Tente novamente mais tarde.");
      toast({
        title,
        description: message,
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return <ClauseListSkeleton />;
  }

  return (
    <>
      <div className={cn("space-y-4", className)}>
        <FilterList
          items={clauses}
          filterBy={(clause, query) =>
            clause.title.toLowerCase().includes(query.toLowerCase()) ||
            clause.text.toLowerCase().includes(query.toLowerCase()) 
          }
          placeholder={searchPlaceholder}
        >
          {(filteredClauses) =>
            filteredClauses?.length === 0 ? (
              <EmptyState
                hasEditPermission={hasEditPermission}
                title={emptyMessage}
                actionText="Nova Cláusula"
                onAction={onCreateClick}
              />
            ) : (
              <Table className="bg-white rounded-md shadow-lg ">
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome da Cláusula</TableHead>
                    {hasEditPermission && (
                      <TableHead className="w-[100px] text-center">Ações</TableHead>
                    )}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredClauses.map((clause) => (
                    <TableRow 
                      key={clause.id}
                      onClick={() => hasEditPermission && onEditClick(clause)}
                      className={cn(
                        "hover:bg-gray-50",
                        selectedClauseIds.includes(clause.id) && "bg-violet-100"
                      )}
                    >
                      <TableCell 
                        className="font-medium cursor-pointer"
                        
                      >
                        {clause.title}
                      </TableCell>
                      {hasEditPermission && (
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onEditClick(clause);
                            }}
                            className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setClauseToDelete(clause);
                            }}
                            className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )
          }
        </FilterList>
      </div>

      <ConfirmDeleteDialog
        open={!!clauseToDelete}
        onOpenChange={(open) => !open && setClauseToDelete(null)}
        onConfirm={async () => {
          if (clauseToDelete) {
            await handleDelete(clauseToDelete.id);
          }
        }}
        entityName={clauseToDelete?.title || ""}
        entityType="cláusula"
        isPending={isDeleting}
      />
    </>
  )
}
