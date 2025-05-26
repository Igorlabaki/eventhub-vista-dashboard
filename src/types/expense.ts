export enum ExpenseType {
  WEEKLY = "WEEKLY",
  ANNUAL = "ANNUAL",
  MONTHLY = "MONTHLY",
  BIWEEKLY = "BIWEEKLY",
  SPORADIC = "SPORADIC"
}

export enum ExpenseCategory {
  TAX = "TAX",
  INVESTMENT = "INVESTMENT",
  MAINTENANCE = "MAINTENANCE",
  ADVERTISING = "ADVERTISING"
}

export interface Expense {
  id: string;
  name: string;
  description?: string;
  amount: number;
  paymentDate?: string; // ISO string
  type: ExpenseType;
  category: ExpenseCategory;
  recurring: boolean;
  createdAt: string;
  updatedAt: string;
  venueId: string;
}

export interface CreateExpenseParams {
  name: string;
  description?: string;
  amount: number;
  paymentDate?: string;
  type: ExpenseType;
  category: ExpenseCategory;
  recurring: boolean;
  venueId: string;
}

export interface UpdateExpenseParams {
  expenseId: string;
  data: Partial<CreateExpenseParams>;
}

export interface ListExpensesParams {
  venueId: string;
  name?: string;
}

export interface ExpenseResponse {
  success: boolean;
  message: string;
  data: Expense;
  count: number;
  type: string;
}

export interface ExpenseListResponse {
  success: boolean;
  message: string;
  data: {
    expenseList: Expense[];
  };
  count: number;
  type: string;
}

export interface ExpenseCreateResponse {
  success: boolean;
  message: string;
  data: Expense;
  count: number;
  type: string;
}

export interface ExpenseDeleteResponse {
  success: boolean;
  message: string;
  data: Expense;
  count: number;
  type: string;
}

export interface ExpenseUpdateResponse {
  success: boolean;
  message: string;
  data: Expense;
  count: number;
  type: string;
}

export type ExpenseRecurring = {
  name: string;
  monthly: number;
  annual: number;
};

export type ExpenseEsporadic = {
  name: string;
  total: number;
};

export interface ExpenseAnalysis {
  total: {
    monthly: number;
    annual: number;
    esporadic: number;
  };
  recurring: ExpenseRecurring[];
  esporadic: ExpenseEsporadic[];
}

export interface ExpenseAnalysisParams {
  venueId?: string;
  year?: string | number;
}

export interface ExpenseAnalysisResponse {
  success: boolean;
  message: string;
  data: ExpenseAnalysis;
  count: number;
  type: string;
} 