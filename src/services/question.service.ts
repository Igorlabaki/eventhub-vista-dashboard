import { api } from '@/lib/axios';
import {
  CreateQuestionDTO,
  UpdateQuestionDTO,
  ListQuestionParams,
  QuestionListResponse,
  QuestionByIdResponse,
  QuestionUpdateResponse,
  QuestionCreateResponse,
  QuestionDeleteResponse
} from '@/types/question';

export const questionService = {
  createQuestion: async (data: CreateQuestionDTO) => {
    const response = await api.post<QuestionCreateResponse>('/question/create', data);
    return response.data;
  },

  getQuestionById: async (questionId: string) => {
    const response = await api.get<QuestionByIdResponse>(`/question/byId/${questionId}`);
    return response.data;
  },

  updateQuestion: async (data: UpdateQuestionDTO) => {
    const response = await api.put<QuestionUpdateResponse>('/question/update', data);
    return response.data;
  },

  listQuestions: async (params: ListQuestionParams) => {
    const queryParams = new URLSearchParams();
    if (params.venueId) queryParams.append('venueId', params.venueId);
    if (params.question) queryParams.append('question', params.question);

    const response = await api.get<QuestionListResponse>(`/question/list?${queryParams.toString()}`);
    return response.data;
  },

  deleteQuestion: async (questionId: string) => {
    const response = await api.delete<QuestionDeleteResponse>(`/question/delete/${questionId}`);
    return response.data;
  }
}; 