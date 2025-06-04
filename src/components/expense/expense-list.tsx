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
import { ExpenseListSkeleton } from "@/components/expense/expense-list-skeleton"
import { ConfirmDeleteDialog } from "@/components/ui/confirm-delete-dialog"
import { Expense } from "@/types/expense"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { useExpenseStore } from "@/store/expenseStore"
import { showSuccessToast } from "@/components/ui/success-toast"
import { useToast } from "@/hooks/use-toast"
import { handleBackendSuccess, handleBackendError } from "@/lib/error-handler"
import { formatCurrency } from "@/lib/utils"

interface ExpenseListProps {
  expenses: Expense[]
  onDeleteExpense?: (expense: Expense) => void
  searchPlaceholder?: string
  emptyMessage?: string
  className?: string
  selectedExpenseIds?: string[]
  isLoading?: boolean
  isDeleting?: boolean
  onCreateClick: () => void
  onEditClick: (expense: Expense) => void
  venueId: string
}

export function ExpenseList({
  expenses,
  onDeleteExpense,
  searchPlaceholder = "Filtrar despesas...",
  emptyMessage = "Nenhuma despesa encontrada",
  className,
  selectedExpenseIds = [],
  isLoading = false,
  isDeleting = false,
  onCreateClick,
  onEditClick,
  venueId
}: ExpenseListProps) {
  const [expenseToDelete, setExpenseToDelete] = React.useState<Expense | null>(null);
  const { deleteExpense } = useExpenseStore();
  const { toast } = useToast();

  const handleDelete = async (expenseId: string) => {
    try {
      const response = await deleteExpense(expenseId, venueId);
      const { title, message } = handleBackendSuccess(response, "Despesa excluída com sucesso!");
      showSuccessToast({
        title,
        description: message
      });
      setExpenseToDelete(null);
    } catch (error: unknown) {
      const { title, message } = handleBackendError(error, "Erro ao excluir despesa. Tente novamente mais tarde.");
      toast({
        title,
        description: message,
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return <ExpenseListSkeleton />;
  }

  return (
    <>
      <div className={cn("space-y-4", className)}>
        <FilterList
          items={expenses}
          filterBy={(expense, query) =>
            expense.name.toLowerCase().includes(query.toLowerCase()) ||
            expense.description?.toLowerCase().includes(query.toLowerCase()) ||
            expense.category.toLowerCase().includes(query.toLowerCase())
          }
          placeholder={searchPlaceholder}
        >
          {(filteredExpenses) =>
            filteredExpenses?.length === 0 ? (
              <EmptyState
                title={emptyMessage}
                actionText="Nova Despesa"
                onAction={onCreateClick}
              />
            ) : (
              <Table className="bg-white rounded-md shadow-lg">
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead className="w-[100px] text-center">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredExpenses.map((expense) => (
                    <TableRow 
                      key={expense.id}
                      className={cn(
                        "hover:bg-gray-50",
                        selectedExpenseIds.includes(expense.id) && "bg-violet-100"
                      )}
                    >
                      <TableCell 
                        className="font-medium cursor-pointer"
                        onClick={() => onEditClick(expense)}
                      >
                        {expense.name}
                      </TableCell>
                      <TableCell>{formatCurrency(expense.amount)}</TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onEditClick(expense);
                            }}
                            className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setExpenseToDelete(expense);
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
        open={!!expenseToDelete}
        onOpenChange={(open) => !open && setExpenseToDelete(null)}
        onConfirm={async () => {
          if (expenseToDelete) {
            await handleDelete(expenseToDelete.id);
          }
        }}
        entityName={expenseToDelete?.name || ""}
        entityType="despesa"
        isPending={isDeleting}
      />
    </>
  )
} 