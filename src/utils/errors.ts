import { ERROR_MESSAGES, HTTP_STATUS } from './constants';

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(message: string, statusCode: number = HTTP_STATUS.INTERNAL_SERVER_ERROR, isOperational: boolean = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;

    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, HTTP_STATUS.BAD_REQUEST);
  }
}

export class PayloadTooLargeError extends AppError {
  constructor(message: string = ERROR_MESSAGES.HTML_TOO_LARGE) {
    super(message, HTTP_STATUS.PAYLOAD_TOO_LARGE);
  }
}

export class TimeoutError extends AppError {
  constructor(message: string = 'Request timeout') {
    super(message, HTTP_STATUS.REQUEST_TIMEOUT);
  }
}

export const createErrorResponse = (error: Error, includeStack: boolean = false) => {
  const isAppError = error instanceof AppError;
  
  return {
    error: isAppError ? error.message : 'Internal server error',
    message: isAppError ? error.message : ERROR_MESSAGES.SCAN_FAILED,
    timestamp: new Date().toISOString(),
    ...(includeStack && { stack: error.stack }),
  };
};

export const validateHtmlContent = (html: unknown): string => {
  if (!html || typeof html !== 'string') {
    throw new ValidationError(ERROR_MESSAGES.INVALID_HTML);
  }

  if (html.trim().length === 0) {
    throw new ValidationError(ERROR_MESSAGES.EMPTY_HTML);
  }

  if (html.length > 1024 * 1024) { // 1MB limit
    throw new PayloadTooLargeError();
  }

  return html;
};

export const sleep = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

export const retry = async <T>(
  fn: () => Promise<T>,
  maxAttempts: number = 3,
  delay: number = 1000
): Promise<T> => {
  let lastError: Error;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      
      if (attempt === maxAttempts) {
        throw lastError;
      }

      await sleep(delay * attempt);
    }
  }

  throw lastError!;
};
