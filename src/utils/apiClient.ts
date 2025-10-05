import { APP_CONFIG, ERROR_MESSAGES } from './constants';
import { logger } from './logger';
import { retry } from './errors';

export interface ApiResponse<T = unknown> {
  data?: T;
  error?: string;
  message?: string;
  timestamp?: string;
}

export class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = APP_CONFIG.API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;
    
    logger.debug('Making API request', { url, method: options.method || 'GET' });

    try {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      logger.debug('API request successful', { url, status: response.status });
      
      return { data };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('API request failed', { url, error: errorMessage });
      return {
        error: errorMessage,
        message: ERROR_MESSAGES.SCAN_FAILED,
        timestamp: new Date().toISOString(),
      };
    }
  }

  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, body: unknown): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  async postWithRetry<T>(endpoint: string, body: unknown, maxAttempts: number = 3): Promise<ApiResponse<T>> {
    return retry(
      () => this.post<T>(endpoint, body),
      maxAttempts,
      1000
    );
  }
}

// Create default API client instance
export const apiClient = new ApiClient();
