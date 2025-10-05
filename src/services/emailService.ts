import { EmailData, ScanResult, EmailSample, SampleResponse, SendResponse } from '@/types';

class EmailService {
  private static readonly API_BASE = 'http://localhost:3001/api';

  static async checkForEmails(): Promise<EmailData> {
    const response = await fetch(`${this.API_BASE}/emails`);
    if (!response.ok) {
      throw new Error('Failed to check emails');
    }
    return response.json();
  }

  static async scanHtml(html: string, sendEmail = false): Promise<ScanResult> {
    // Validate HTML content before sending
    if (!html || html.trim().length === 0) {
      throw new Error('HTML content cannot be empty');
    }

    const response = await fetch(`${this.API_BASE}/scan`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ html, sendEmail }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to scan HTML: ${response.status} ${errorText}`);
    }
    return response.json();
  }

  static async loadSamples(): Promise<EmailSample[]> {
    const response = await fetch(`${this.API_BASE}/test-samples`);
    if (!response.ok) {
      throw new Error('Failed to load samples');
    }
    const data = await response.json();
    return data.emailSamples || [];
  }

  static async getSampleContent(sampleId: string): Promise<SampleResponse> {
    const response = await fetch(`${this.API_BASE}/test-samples`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ sampleId, action: 'read' }),
    });

    if (!response.ok) {
      throw new Error('Failed to get sample content');
    }
    return response.json();
  }

  static async sendSample(sampleId: string): Promise<SendResponse> {
    const response = await fetch(`${this.API_BASE}/test-samples`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ sampleId, action: 'send' }),
    });

    if (!response.ok) {
      throw new Error('Failed to send sample');
    }
    return response.json();
  }
}

export { EmailService };