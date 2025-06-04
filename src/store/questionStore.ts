import { create } from 'zustand';
import {
  Question,
  CreateQuestionDTO,
  UpdateQuestionDTO,
  ListQuestionParams
} from '@/types/question';
import { questionService } from '@/services/question.service';
import { BackendResponse } from '@/lib/error-handler';

interface QuestionStore {
  questions: Question[];
  currentQuestion: Question | null;
  isLoading: boolean;
  error: string | null;
  setQuestions: (questions: Question[]) => void;
  setCurrentQuestion: (question: Question | null) => void;
  fetchQuestions: (params: ListQuestionParams) => Promise<void>;
  createQuestion: (data: CreateQuestionDTO) => Promise<BackendResponse<Question>>;
  updateQuestion: (data: UpdateQuestionDTO) => Promise<BackendResponse<Question>>;
  deleteQuestion: (id: string) => Promise<BackendResponse<void>>;
  addQuestion: (question: Question) => void;
  updateQuestionInStore: (question: Question) => void;
  removeQuestion: (id: string) => void;
  clearError: () => void;
}

interface ApiError {
  response?: {
    data?: {
      message?: string;
    };
  };
}

export const useQuestionStore = create<QuestionStore>((set, get) => ({
  questions: [],
  currentQuestion: null,
  isLoading: false,
  error: null,
  setQuestions: (questions) => set({ questions }),
  setCurrentQuestion: (question) => set({ currentQuestion: question }),

  fetchQuestions: async (params) => {
    set({ isLoading: true, error: null });
    try {
      const response = await questionService.listQuestions(params);
      set({ questions: response.data.questionList });
    } catch (err: unknown) {
      const error = err as ApiError;
      set({
        error: error?.response?.data?.message || "Não foi possível carregar as perguntas.",
        questions: []
      });
    } finally {
      set({ isLoading: false });
    }
  },

  createQuestion: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await questionService.createQuestion(data);
      set((state) => ({
        questions: [...state.questions, response.data],
        isLoading: false
      }));
      return {
        success: true,
        message: "Pergunta criada com sucesso",
        data: response.data
      };
    } catch (err: unknown) {
      const error = err as ApiError;
      set({
        error: error?.response?.data?.message || "Não foi possível criar a pergunta.",
        isLoading: false
      });
      throw err;
    }
  },

  updateQuestion: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await questionService.updateQuestion(data);
      set((state) => ({
        questions: state.questions.map((q) => q.id === response.data.id ? response.data : q),
        currentQuestion: state.currentQuestion && state.currentQuestion.id === response.data.id ? response.data : state.currentQuestion,
        isLoading: false
      }));
      return {
        success: true,
        message: "Pergunta atualizada com sucesso",
        data: response.data
      };
    } catch (err: unknown) {
      const error = err as ApiError;
      set({
        error: error?.response?.data?.message || "Não foi possível atualizar a pergunta.",
        isLoading: false
      });
      throw err;
    }
  },

  deleteQuestion: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await questionService.deleteQuestion(id);
      set((state) => ({
        questions: state.questions.filter((q) => q.id !== id),
        currentQuestion: state.currentQuestion && state.currentQuestion.id === id ? null : state.currentQuestion,
        isLoading: false
      }));
      return {
        success: true,
        message: "Pergunta excluída com sucesso",
        data: undefined
      };
    } catch (err: unknown) {
      const error = err as ApiError;
      set({
        error: error?.response?.data?.message || "Não foi possível excluir a pergunta.",
        isLoading: false
      });
      throw err;
    }
  },

  addQuestion: (question) => set((state) => ({ questions: [...state.questions, question] })),

  updateQuestionInStore: (question) => set((state) => ({
    questions: state.questions.map((q) => q.id === question.id ? question : q),
    currentQuestion: state.currentQuestion && state.currentQuestion.id === question.id ? question : state.currentQuestion,
  })),

  removeQuestion: (id) => set((state) => ({
    questions: state.questions.filter((q) => q.id !== id),
    currentQuestion: state.currentQuestion && state.currentQuestion.id === id ? null : state.currentQuestion,
  })),

  clearError: () => set({ error: null }),
})); 