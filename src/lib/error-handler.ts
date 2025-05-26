interface BackendError {
  title: string;
  message: string;
}

export interface BackendResponse<T> {
  success: boolean;
  message: string;
  data: T;
  count?: number;
  type?: string;
}

export function handleBackendError(error: unknown, defaultMessage: string): BackendError {
  if (
    typeof error === "object" &&
    error !== null &&
    "response" in error &&
    // @ts-expect-error: acessar propriedades dinâmicas do erro retornado pelo axios/backend
    error.response?.data?.message
  ) {
    // @ts-expect-error: acessar propriedades dinâmicas do erro retornado pelo axios/backend
    const title = error.response.data.title || "Erro";
    // @ts-expect-error: acessar propriedades dinâmicas do erro retornado pelo axios/backend
    const message = error.response.data.message;
    return { title, message };
  }

  return {
    title: "Erro",
    message: defaultMessage
  };
}

export function handleBackendSuccess<T>(response: BackendResponse<T>, defaultMessage: string): { title: string; message: string } {
  return {
    title: "Sucesso",
    message: response.message || defaultMessage
  };
} 