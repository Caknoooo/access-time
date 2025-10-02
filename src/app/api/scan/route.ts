import { NextRequest } from 'next/server';
import { chromium } from 'playwright';
import { AxeBuilder } from '@axe-core/playwright';
import axios from 'axios';

const MAILHOG_API_URL = process.env.MAILHOG_API_URL || 'http://localhost:8025/api/v2';
const TEST_EMAIL = process.env.TEST_EMAIL || 'test@local.test';

let lastMessageId: string | null = null;
let isProcessing = false;

export async function GET(request: NextRequest) {
  const encoder = new TextEncoder();
  
  const stream = new ReadableStream({
    start(controller) {
      const sendEvent = (data: { status: string; data?: unknown; error?: string }) => {
        const event = `data: ${JSON.stringify(data)}\n\n`;
        controller.enqueue(encoder.encode(event));
      };

      const pollForEmails = async () => {
        try {
          const response = await axios.get(`${MAILHOG_API_URL}/messages`);
          const messages = response.data.items || [];
          
          if (messages.length > 0) {
            const latestMessage = messages[0];
            
            if (latestMessage.ID !== lastMessageId && !isProcessing) {
              lastMessageId = latestMessage.ID;
              isProcessing = true;
              
              sendEvent({ status: 'processing' });
              
              try {
                const messageDetail = await axios.get(`${MAILHOG_API_URL}/messages/${latestMessage.ID}`);
                const email = messageDetail.data;
                
                if (email.To && email.To.some((to: { Mailbox: string; Domain: string }) => to.Mailbox === TEST_EMAIL.split('@')[0] && to.Domain === TEST_EMAIL.split('@')[1])) {
                  const htmlContent = email.Content?.Body || '';
                  
                  if (htmlContent) {
                    const accessibilityResults = await runAccessibilityScan(htmlContent);
                    sendEvent({ 
                      status: 'completed', 
                      data: accessibilityResults 
                    });
                  } else {
                    sendEvent({ 
                      status: 'error', 
                      error: 'No HTML content found in email' 
                    });
                  }
                } else {
                  sendEvent({ 
                    status: 'error', 
                    error: 'Email not addressed to test email' 
                  });
                }
              } catch (error) {
                sendEvent({ 
                  status: 'error', 
                  error: `Failed to process email: ${error}` 
                });
              } finally {
                isProcessing = false;
              }
            }
          }
        } catch (error) {
          sendEvent({ 
            status: 'error', 
            error: `Failed to poll emails: ${error}` 
          });
        }
      };

      const interval = setInterval(pollForEmails, 2000);
      
      request.signal.addEventListener('abort', () => {
        clearInterval(interval);
        controller.close();
      });
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}

async function runAccessibilityScan(htmlContent: string) {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  try {
    await page.setContent(htmlContent);
    const results = await new AxeBuilder({ page }).analyze();
    const violations = results.violations;
    
    return {
      timestamp: new Date().toISOString(),
      violations,
      summary: {
        totalViolations: violations.length,
        critical: violations.filter((v) => v.impact === 'critical').length,
        serious: violations.filter((v) => v.impact === 'serious').length,
        moderate: violations.filter((v) => v.impact === 'moderate').length,
        minor: violations.filter((v) => v.impact === 'minor').length,
      }
    };
  } finally {
    await browser.close();
  }
}
