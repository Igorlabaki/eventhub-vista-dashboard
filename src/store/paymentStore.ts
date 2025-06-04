import { create } from 'zustand';
import { 
  Payment, 
  CreatePaymentDTO, 
  UpdatePaymentDTO,
  ListPaymentParams
} from '@/types/payment';
import { paymentService, CreatePaymentWithFileDTO } from '@/services/payment.service';
import { BackendResponse } from '@/lib/error-handler';

interface PaymentStore {
  payments: Payment[];
  currentPayment: Payment | null;
  isLoading: boolean;
  error: string | null;
  setPayments: (payments: Payment[]) => void;
  setCurrentPayment: (payment: Payment | null) => void;
  fetchPayments: (params: ListPaymentParams) => Promise<void>;
  fetchPaymentById: (paymentId: string) => Promise<void>;
  createPayment: (data: CreatePaymentWithFileDTO) => Promise<BackendResponse<Payment>>;
  updatePayment: (data: UpdatePaymentDTO & { file?: File }) => Promise<BackendResponse<Payment>>;
  deletePayment: (id: string) => Promise<BackendResponse<void>>;
  addPayment: (payment: Payment) => void;
  updatePaymentInStore: (payment: Payment) => void;
  removePayment: (id: string) => void;
  clearError: () => void;
}

interface ApiError {
  response?: {
    data?: {
      message?: string;
    };
  };
}

export const usePaymentStore = create<PaymentStore>((set, get) => ({
  payments: [],
  currentPayment: null,
  isLoading: false,
  error: null,
  setPayments: (payments) => set({ payments }),
  setCurrentPayment: (payment) => set({ currentPayment: payment }),
  
  fetchPayments: async (params) => {
    set({ isLoading: true, error: null });
    try {
      const response = await paymentService.listPayments(params);
      set({ payments: response.data.paymentList });
    } catch (err: unknown) {
      const error = err as ApiError;
      set({ 
        error: error?.response?.data?.message || "Não foi possível carregar os pagamentos.",
        payments: [] 
      });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchPaymentById: async (paymentId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await paymentService.getPaymentById(paymentId);
      set({ currentPayment: response.data });
    } catch (err: unknown) {
      const error = err as ApiError;
      set({ 
        error: error?.response?.data?.message || "Não foi possível carregar o pagamento.",
        currentPayment: null 
      });
    } finally {
      set({ isLoading: false });
    }
  },

  createPayment: async (data: CreatePaymentWithFileDTO) => {
    set({ isLoading: true, error: null });
    try {
      const response = await paymentService.createPayment(data);
      set((state) => ({
        payments: [...state.payments, response.data],
        isLoading: false
      }));
      return {
        success: true,
        message: "Pagamento criado com sucesso",
        data: response.data
      };
    } catch (err: unknown) {
      const error = err as ApiError;
      set({ 
        error: error?.response?.data?.message || "Não foi possível criar o pagamento.",
        isLoading: false 
      });
      throw err;
    }
  },

  updatePayment: async (data: UpdatePaymentDTO & { file?: File }) => {
    set({ isLoading: true, error: null });
    try {
      const response = await paymentService.updatePayment(data);
      set((state) => ({
        payments: state.payments.map((p) => p.id === response.data.id ? response.data : p),
        currentPayment: state.currentPayment && state.currentPayment.id === response.data.id ? response.data : state.currentPayment,
        isLoading: false
      }));
      return {
        success: true,
        message: "Pagamento atualizado com sucesso",
        data: response.data
      };
    } catch (err: unknown) {
      const error = err as ApiError;
      set({ 
        error: error?.response?.data?.message || "Não foi possível atualizar o pagamento.",
        isLoading: false 
      });
      throw err;
    }
  },

  deletePayment: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      await paymentService.deletePayment(id);
      set((state) => ({
        payments: state.payments.filter((p) => p.id !== id),
        currentPayment: state.currentPayment && state.currentPayment.id === id ? null : state.currentPayment,
        isLoading: false
      }));
      return {
        success: true,
        message: "Pagamento excluído com sucesso",
        data: undefined
      };
    } catch (err: unknown) {
      const error = err as ApiError;
      set({ 
        error: error?.response?.data?.message || "Não foi possível excluir o pagamento.",
        isLoading: false 
      });
      throw err;
    }
  },

  addPayment: (payment: Payment) => set((state) => ({ payments: [...state.payments, payment] })),
  
  updatePaymentInStore: (payment: Payment) => set((state) => ({
    payments: state.payments.map((p) => p.id === payment.id ? payment : p),
    currentPayment: state.currentPayment && state.currentPayment.id === payment.id ? payment : state.currentPayment,
  })),
  
  removePayment: (id: string) => set((state) => ({
    payments: state.payments.filter((p) => p.id !== id),
    currentPayment: state.currentPayment && state.currentPayment.id === id ? null : state.currentPayment,
  })),
  
  clearError: () => set({ error: null }),
})); 