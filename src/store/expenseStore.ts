import { create } from "zustand";
import {
  Expense,
  ExpenseType,
  ExpenseCategory,
  ExpenseListResponse,
  ExpenseCreateResponse,
  ExpenseUpdateResponse,
  ExpenseDeleteResponse,
  ExpenseAnalysisParams,
  ExpenseAnalysisResponse,
  ExpenseAnalysis,
} from "@/types/expense";
import { expenseService } from "@/services/expenseService";

interface ExpenseStore {
  expenses: Expense[];
  isLoading: boolean;
  error: string | null;
  expenseAnalysis: ExpenseAnalysis | null;
  setExpenses: (expenses: Expense[]) => void;
  fetchExpenses: (venueId: string, name?: string) => Promise<void>;
  createExpense: (expense: Omit<Expense, "id">) => Promise<ExpenseCreateResponse>;
  updateExpense: (expenseId: string, data: Partial<Expense>) => Promise<ExpenseUpdateResponse>;
  deleteExpense: (expenseId: string, venueId: string) => Promise<ExpenseDeleteResponse>;
  fetchExpenseAnalysis: (params: ExpenseAnalysisParams) => Promise<void>;
  clearError: () => void;
}

interface ApiError {
  response?: {
    data?: {
      message?: string;
    };
  };
}

export const useExpenseStore = create<ExpenseStore>((set, get) => ({
  expenses: [],
  isLoading: false,
  error: null,
  expenseAnalysis: null,
  setExpenses: (expenses) => set({ expenses }),
  clearError: () => set({ error: null }),

  fetchExpenses: async (venueId: string, name?: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await expenseService.list({ venueId, name });
      const listResponse = response as unknown as ExpenseListResponse;
      set({ expenses: listResponse.data.expenseList, isLoading: false });
    } catch (err: unknown) {
      const error = err as ApiError;
      set({
        error: error?.response?.data?.message || "Erro ao carregar despesas.",
        expenses: [],
        isLoading: false
      });
    }
  },

  createExpense: async (expense) => {
    set({ isLoading: true, error: null });
    try {
      const response = await expenseService.create(expense);
      const createResponse = response as ExpenseCreateResponse;
      await get().fetchExpenses(expense.venueId);
      set({ isLoading: false });
      return createResponse;
    } catch (err: unknown) {
      const error = err as ApiError;
      set({
        error: error?.response?.data?.message || "Erro ao criar despesa.",
        isLoading: false
      });
      throw err;
    }
  },

  updateExpense: async (expenseId, data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await expenseService.update({ expenseId, data });
      const updateResponse = response as ExpenseUpdateResponse;
      await get().fetchExpenses(data.venueId || "");
      set({ isLoading: false });
      return updateResponse;
    } catch (err: unknown) {
      const error = err as ApiError;
      set({
        error: error?.response?.data?.message || "Erro ao atualizar despesa.",
        isLoading: false
      });
      throw err;
    }
  },

  deleteExpense: async (expenseId, venueId) => {
    set({ isLoading: true, error: null });
    try {
      await expenseService.delete(expenseId);
      await get().fetchExpenses(venueId);
      set({ isLoading: false });
      // Retorna um objeto ExpenseDeleteResponse manualmente
      return {
        success: true,
        message: 'Despesa deletada com sucesso',
        data: {} as Expense,
        count: 0,
        type: ''
      };
    } catch (err: unknown) {
      const error = err as ApiError;
      set({
        error: error?.response?.data?.message || "Erro ao deletar despesa.",
        isLoading: false
      });
      throw err;
    }
  },

  fetchExpenseAnalysis: async (params: ExpenseAnalysisParams) => {
    set({ isLoading: true, error: null });
    try {
      const response = await expenseService.analysis(params);
      set({ expenseAnalysis: response.data, isLoading: false });
    } catch (err: unknown) {
      const error = err as ApiError;
      set({
        error: error?.response?.data?.message || "Erro ao carregar análise de despesas.",
        isLoading: false
      });
    }
  },
})); 