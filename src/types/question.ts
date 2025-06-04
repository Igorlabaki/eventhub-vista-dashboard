export interface Question {
  id: string;
  question: string;
  response: string;
  createdAt: Date;
  updatedAt: Date;
  venueId: string;
}

export interface CreateQuestionDTO {
  venueId: string;
  question: string;
  response: string;
}

export interface UpdateQuestionDTO {
  venueId: string;
  questionId: string;
  data: {
    question: string;
    response: string;
  };
}

export interface ListQuestionParams {
  venueId: string;
  question?: string;
}

export interface QuestionByIdResponse {
  success: true;
  message: string;
  data: Question;
  count: number;
  type: string;
}

export interface QuestionListResponse {
  success: true;
  message: string;
  data: {
    questionList: Question[];
  };
  count: number;
  type: string;
}

export interface QuestionCreateResponse {
  success: true;
  message: string;
  data: Question;
  count: number;
  type: string;
}

export interface QuestionDeleteResponse {
  success: true;
  message: string;
  data: Question;
  count: number;
  type: string;
}

export interface QuestionUpdateResponse {
  success: true;
  message: string;
  data: Question;
  count: number;
  type: string;
} 