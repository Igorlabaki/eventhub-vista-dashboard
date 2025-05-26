import { AxiosError, AxiosResponse } from 'axios';

interface ErrorResponse {
  message: string;
}

export type ApiError = AxiosError<ErrorResponse>; 