import { AxiosError } from 'axios';
import { ApiErrorResponse, HttpError, HttpTokenError, HttpInvalidCredentialsError, HttpBadRequestError, HttpConflictError, HttpResourceNotFoundError } from '@/types/error';

export class ErrorHandlerService {
  static handle(error: unknown): HttpError {
    if (error instanceof HttpError) {
      return error;
    }

    if (error instanceof AxiosError) {
      const apiError = error.response?.data as ApiErrorResponse;
      
      if (!apiError) {
        return new HttpError(500, 'ServerError', 'Erro interno do servidor');
      }

      switch (apiError.statusCode) {
        case 401:
          if (apiError.body.title === 'TokenError') {
            return new HttpTokenError(apiError.body.message);
          }
          return new HttpInvalidCredentialsError(apiError.body.message);
        case 400:
          return new HttpBadRequestError(apiError.body.message);
        case 409:
          return new HttpConflictError(apiError.body.message);
        case 404:
          return new HttpResourceNotFoundError(apiError.body.message);
        default:
          return new HttpError(apiError.statusCode, apiError.body.title, apiError.body.message);
      }
    }

    return new HttpError(500, 'UnknownError', 'Erro desconhecido');
  }
} 