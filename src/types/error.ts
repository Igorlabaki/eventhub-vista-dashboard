export interface ApiError {
  title: string;
  message: string;
}

export interface ApiErrorResponse {
  statusCode: number;
  body: ApiError;
}

export class HttpError extends Error {
  constructor(
    public statusCode: number,
    public title: string,
    message: string
  ) {
    super(message);
    this.name = 'HttpError';
  }
}

export class HttpTokenError extends HttpError {
  constructor(message: string) {
    super(401, 'TokenError', message);
  }
}

export class HttpInvalidCredentialsError extends HttpError {
  constructor(message: string) {
    super(401, 'InvalidCredentialsError', message);
  }
}

export class HttpBadRequestError extends HttpError {
  constructor(message: string) {
    super(400, 'BadRequestError', message);
  }
}

export class HttpConflictError extends HttpError {
  constructor(message: string) {
    super(409, 'ConflictError', message);
  }
}

export class HttpResourceNotFoundError extends HttpError {
  constructor(message: string) {
    super(404, 'ResourceNotFoundError', message);
  }
} 