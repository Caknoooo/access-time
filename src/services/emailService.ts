import { EmailData, ScanResult, EmailSample, SampleResponse, SendResponse } from '@/types';
import { APP_CONFIG, ERROR_MESSAGES } from '@/utils/constants';
import { logger } from '@/utils/logger';
import { apiClient } from '@/utils/apiClient';

export interface EmailEvent {
  type: 'email_received' | 'scan_complete' | 'scan_error' | 'status_update';
  data: unknown;
  timestamp: string;
}

class EmailService {
  private static eventSource: EventSource | null = null;
  private static eventListeners: Map<string, (event: EmailEvent) => void> = new Map();

  static async checkForEmails(): Promise<EmailData> {
    try {
      const response = await apiClient.get<EmailData>('/emails');
      
      if (response.error) {
        throw new Error(response.error);
      }
      
      return response.data!;
    } catch (error) {
      throw new Error(ERROR_MESSAGES.EMAIL_CHECK_FAILED);
    }
  }

  static connectToEvents(): EventSource {
    if (this.eventSource) {
      this.eventSource.close();
    }

    const eventsUrl = `${APP_CONFIG.API_BASE_URL}/events`;
    this.eventSource = new EventSource(eventsUrl);
    
    logger.info('Connecting to SSE', { url: eventsUrl });
    
    this.eventSource.onmessage = (event) => {
      try {
        const emailEvent: EmailEvent = JSON.parse(event.data);
        logger.debug('SSE event received', { type: emailEvent.type });
        
        this.eventListeners.forEach((listener) => {
          listener(emailEvent);
        });
      } catch (error) {
        logger.error('Error parsing SSE event', { error: error instanceof Error ? error.message : 'Unknown error' });
      }
    };

    this.eventSource.onerror = (error) => {
      logger.error('SSE connection error', { error });
    };

    return this.eventSource;
  }

  static addEventListener(eventType: string, listener: (event: EmailEvent) => void): void {
    this.eventListeners.set(eventType, listener);
    logger.debug('SSE listener added', { eventType });
  }

  static removeEventListener(eventType: string): void {
    this.eventListeners.delete(eventType);
    logger.debug('SSE listener removed', { eventType });
  }

  static disconnect(): void {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }
    this.eventListeners.clear();
    logger.info('SSE connection disconnected');
  }

  static async scanHtml(html: string, sendEmail = false): Promise<ScanResult> {
    try {
      const response = await apiClient.postWithRetry<ScanResult>('/scan', { 
        html, 
        sendEmail 
      });
      
      if (response.error) {
        throw new Error(response.error);
      }
      
      return response.data!;
    } catch (error) {
      logger.error('Failed to scan HTML', { error: error instanceof Error ? error.message : 'Unknown error' });
      throw new Error(ERROR_MESSAGES.SCAN_FAILED);
    }
  }

  static async loadSamples(): Promise<EmailSample[]> {
    try {
      const response = await apiClient.get<{ emailSamples: EmailSample[] }>('/test-samples');
      
      if (response.error) {
        throw new Error(response.error);
      }
      
      return response.data?.emailSamples || [];
    } catch (error) {
      logger.error('Failed to load samples', { error: error instanceof Error ? error.message : 'Unknown error' });
      throw new Error(ERROR_MESSAGES.SAMPLE_LOAD_FAILED);
    }
  }

  static async getSampleContent(sampleId: string): Promise<SampleResponse> {
    try {
      const response = await apiClient.post<SampleResponse>('/test-samples', {
        sampleId,
        action: 'read'
      });
      
      if (response.error) {
        throw new Error(response.error);
      }
      
      return response.data!;
    } catch (error) {
      logger.error('Failed to get sample content', { error: error instanceof Error ? error.message : 'Unknown error' });
      throw new Error(ERROR_MESSAGES.SAMPLE_CONTENT_FAILED);
    }
  }

  static async sendSample(sampleId: string): Promise<SendResponse> {
    try {
      const response = await apiClient.post<SendResponse>('/test-samples', {
        sampleId,
        action: 'send'
      });
      
      if (response.error) {
        throw new Error(response.error);
      }
      
      return response.data!;
    } catch (error) {
      logger.error('Failed to send sample', { error: error instanceof Error ? error.message : 'Unknown error' });
      throw new Error(ERROR_MESSAGES.SAMPLE_SEND_FAILED);
    }
  }
}

export { EmailService };