import { api } from "@/lib/axios";
import {
  Expense,
  CreateExpenseParams,
  UpdateExpenseParams,
  ListExpensesParams,
  ExpenseResponse,
  ExpenseAnalysisParams,
  ExpenseAnalysisResponse,
} from "@/types/expense";

export const expenseService = {
  async create(params: CreateExpenseParams): Promise<ExpenseResponse> {
    const response = await api.post("/expense/create", params);
    return response.data;
  },

  async list(params: ListExpensesParams): Promise<Expense[]> {
    const { venueId, name } = params;
    const response = await api.get(`/expense/list/${venueId}${name ? `/${name}` : ""}`);
    return response.data;
  },

  async update(params: UpdateExpenseParams): Promise<ExpenseResponse> {
    const response = await api.put("/expense/update", params);
    return response.data;
  },

  async delete(expenseId: string): Promise<void> {
    await api.delete(`/expense/delete/${expenseId}`);
  },

  async analysis(params: ExpenseAnalysisParams): Promise<ExpenseAnalysisResponse> {
    const { venueId, year } = params;
    const url = `/expense/analysis?venueId=${venueId}&year=${year}`;
    const response = await api.get(url);
    return response.data;
  },
}; 