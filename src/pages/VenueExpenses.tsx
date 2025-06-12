import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { ExpenseHeader } from "@/components/expense/expense-header";
import { ExpenseForm } from "@/components/expense/expense-form";
import { ExpenseList } from "@/components/expense/expense-list";
import { Expense, CreateExpenseParams, ExpenseType, ExpenseCategory, CreateExpenseDTO, UpdateExpenseDTO } from "@/types/expense";
import { useExpenseStore } from "@/store/expenseStore";
import { showSuccessToast } from "@/components/ui/success-toast";
import { useToast } from "@/hooks/use-toast";
import { handleBackendSuccess, handleBackendError } from "@/lib/error-handler";
import { AnimatedFormSwitcher } from "@/components/ui/animated-form-switcher";
import { ExpenseListSkeleton } from "@/components/expense/expense-list-skeleton";
import { useVenueStore } from "@/store/venueStore";
import { parseCurrencyStringToNumber } from "@/utils/currency";
import { ExpenseFormValues } from "@/components/expense/expense-form";

// Tipo correto para payload do backend
type ExpensePayload = {
  name: string;
  description?: string;
  amount: number;
  paymentDate?: string;
  type: ExpenseType;
  category: ExpenseCategory;
  recurring: boolean;
  venueId: string;
};

export default function VenueExpenses() {
  const { id: venueId } = useParams<{ id: string }>();
  const { selectedVenue } = useVenueStore();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("recorrentes");
  const { expenses, isLoading, fetchExpenses, createExpense, updateExpense } = useExpenseStore();
  const [isCreatingExpense, setIsCreatingExpense] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);

  useEffect(() => {
    if (selectedVenue.id) {
      fetchExpenses(selectedVenue.id);
    }
  }, [selectedVenue.id, fetchExpenses]);

  const handleCreateExpense = () => {
    setIsCreatingExpense(true);
  };

  // Função que recebe os dados do form, converte amount e chama o backend
  const handleExpenseFormSubmit = async (values: ExpenseFormValues) => {
    try {
      let response;
      const payload: CreateExpenseDTO = {
        ...values,
      };
      if (selectedExpense) {
        response = await updateExpense(selectedExpense.id, payload as UpdateExpenseDTO);
        const { title, message } = handleBackendSuccess(response, "Despesa atualizada com sucesso!");
        showSuccessToast({
          title,
          description: message
        });
      } else {
        response = await createExpense(payload);
        const { title, message } = handleBackendSuccess(response, "Despesa criada com sucesso!");
        showSuccessToast({
          title,
          description: message
        });
      }
      setSelectedExpense(null);
      setIsCreatingExpense(false);
    } catch (error: unknown) {
      const { title, message } = handleBackendError(error, "Erro ao salvar despesa. Tente novamente mais tarde.");
      toast({
        title,
        description: message,
        variant: "destructive",
      });
    }
  };

  const handleExpenseClick = (expense: Expense) => {
    setSelectedExpense(expense);
  };

  const filteredExpenses = expenses.filter(expense => {
    if (activeTab === "recorrentes") {
      return expense.recurring;
    } else {
      return !expense.recurring;
    }
  });

  const showForm = isCreatingExpense || !!selectedExpense;

  return (
    <DashboardLayout>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <ExpenseHeader
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onActionClick={handleCreateExpense}
          isFormOpen={showForm}
        />

        <div className="animate-fade-in">
          {isLoading ? (
            <ExpenseListSkeleton />
          ) : (
            <AnimatedFormSwitcher
              showForm={showForm}
              list={
                <ExpenseList
                  expenses={filteredExpenses}
                  onCreateClick={handleCreateExpense}
                  onEditClick={handleExpenseClick}
                  venueId={venueId || ""}
                />
              }
              form={
                <ExpenseForm
                  expense={selectedExpense}
                  onSubmit={handleExpenseFormSubmit}
                  onCancel={() => {
                    setSelectedExpense(null);
                    setIsCreatingExpense(false);
                  }}
                  venueId={venueId || ""}
                />
              }
            />
          )}
        </div>
      </Tabs>
    </DashboardLayout>
  );
} 