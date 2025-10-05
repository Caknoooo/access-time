import { NextRequest } from 'next/server';
import { chromium } from 'playwright';
import axios from 'axios';

const MAILHOG_API_URL = process.env.MAILHOG_API_URL || 'http://localhost:8025/api/v2';
const TEST_EMAIL = process.env.TEST_EMAIL || 'test@local.test';

let lastMessageId: string | null = null;
let isProcessing = false;

export async function POST(request: NextRequest) {
  try {
    // Check if request has body
    const contentType = request.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      return Response.json({ 
        error: 'Content-Type must be application/json' 
      }, { status: 400 });
    }

    // Try to parse JSON with better error handling
    let body;
    try {
      body = await request.json();
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      return Response.json({ 
        error: 'Invalid JSON in request body',
        details: parseError instanceof Error ? parseError.message : 'Unknown parse error'
      }, { status: 400 });
    }

    const { html } = body;

    if (!html) {
      return Response.json({ error: 'HTML content is required' }, { status: 400 });
    }

    console.log('Starting accessibility scan...');
    const accessibilityResults = await runAccessibilityScan(html);

    return Response.json({
      ...accessibilityResults,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error in scan API:', error);
    return Response.json({
      error: 'Failed to scan HTML content',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  console.log('SSE endpoint called at', new Date().toISOString());
  const encoder = new TextEncoder();
  
  const stream = new ReadableStream({
    start(controller) {
      console.log('SSE stream started');
      const sendEvent = (data: { status: string; data?: unknown; error?: string }) => {
        console.log('Sending event:', data);
        const event = `data: ${JSON.stringify(data)}\n\n`;
        controller.enqueue(encoder.encode(event));
      };

      const pollForEmails = async () => {
        try {
          console.log('Polling for emails...');
          const response = await axios.get(`${MAILHOG_API_URL}/messages`);
          const messages = response.data || [];
          console.log('Found messages:', messages.length);
          
          if (messages.length > 0) {
            const latestMessage = messages[0];
            
            if (latestMessage.ID !== lastMessageId && !isProcessing) {
              lastMessageId = latestMessage.ID;
              isProcessing = true;
              
              sendEvent({ status: 'processing' });
              
              try {
                const messageDetail = await axios.get(`${MAILHOG_API_URL}/messages/${latestMessage.ID}`);
                const email = messageDetail.data;
                
                const toAddresses = email.To || [];
                const isTestEmail = toAddresses.some((to: { Mailbox: string; Domain: string }) => 
                  `${to.Mailbox}@${to.Domain}` === TEST_EMAIL
                );
                
                if (isTestEmail) {
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

function generateHtmlReport(results: { violations: unknown[]; summary: { totalViolations: number; critical: number; serious: number; moderate: number; minor: number }; timestamp: string }) {
  const { violations, summary, timestamp } = results;
  
  return `
  <!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Email Accessibility Report</title>
    <style>
      body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        line-height: 1.6; 
            margin: 0;
            padding: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
        }
        .container {
            max-width: 1200px;
        margin: 0 auto; 
            background: white;
            border-radius: 12px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
            overflow: hidden;
      }
      .header {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
            padding: 30px;
        text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 2.5rem;
            font-weight: 700;
        }
        .header p {
            margin: 10px 0 0 0;
            opacity: 0.9;
            font-size: 1.1rem;
        }
        .content {
            padding: 30px;
      }
      .summary {
        display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
        margin-bottom: 30px;
      }
      .stat-card {
            background: #f8f9fa;
            padding: 20px;
        border-radius: 8px;
        text-align: center;
            border-left: 4px solid #667eea;
        }
        .stat-card.critical { border-left-color: #dc3545; }
        .stat-card.serious { border-left-color: #fd7e14; }
        .stat-card.moderate { border-left-color: #ffc107; }
        .stat-card.minor { border-left-color: #28a745; }
        .number {
            font-size: 2rem;
        font-weight: bold;
            margin-bottom: 5px;
        }
        .label {
            color: #6c757d;
            font-size: 0.9rem;
            text-transform: uppercase;
            letter-spacing: 0.5px;
      }
      .section {
        margin-bottom: 30px;
      }
        .section h2 {
            color: #333;
            border-bottom: 2px solid #667eea;
            padding-bottom: 10px;
            margin-bottom: 20px;
        }
        .violation {
            background: #fff;
            border: 1px solid #e9ecef;
            border-radius: 8px;
            padding: 20px;
            margin-bottom: 15px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.05);
        }
        .violation-header {
            display: flex;
            justify-content: between;
            align-items: center;
            margin-bottom: 10px;
        }
        .impact {
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 0.8rem;
            font-weight: bold;
            text-transform: uppercase;
        }
        .impact.critical { background: #dc3545; color: white; }
        .impact.serious { background: #fd7e14; color: white; }
        .impact.moderate { background: #ffc107; color: #333; }
        .impact.minor { background: #28a745; color: white; }
        .violation-title {
            font-weight: bold;
            color: #333;
            margin-bottom: 10px;
        }
        .violation-description {
            color: #6c757d;
            margin-bottom: 15px;
        }
        .help {
            background: #e3f2fd;
            padding: 15px;
            border-radius: 6px;
            border-left: 4px solid #2196f3;
        }
        .help h4 {
            margin: 0 0 10px 0;
            color: #1976d2;
        }
        .help p {
            margin: 0;
            color: #1565c0;
        }
        .footer {
            background: #f8f9fa;
            padding: 20px;
            text-align: center;
            color: #6c757d;
            border-top: 1px solid #e9ecef;
        }
    </style>
  </head>
  <body>
    <div class="container">
    <div class="header">
            <h1>📧 Email Accessibility Report</h1>
            <p>Generated on ${new Date(timestamp).toLocaleString()}</p>
    </div>
        
        <div class="content">
    <div class="summary">
                <div class="stat-card">
                    <div class="number">${summary.totalViolations}</div>
                    <div class="label">Total Issues</div>
                </div>
                <div class="stat-card critical">
                    <div class="number">${summary.critical}</div>
                    <div class="label">Critical</div>
      </div>
                <div class="stat-card serious">
                    <div class="number">${summary.serious}</div>
                    <div class="label">Serious</div>
      </div>
                <div class="stat-card moderate">
                    <div class="number">${summary.moderate}</div>
                    <div class="label">Moderate</div>
      </div>
                <div class="stat-card minor">
                    <div class="number">${summary.minor}</div>
                    <div class="label">Minor</div>
      </div>
    </div>
            
            ${violations.length > 0 ? `
    <div class="section">
                <h2>🚨 Accessibility Violations</h2>
                ${violations.map((violation: unknown) => {
                  const v = violation as { impact: string; id: string; description: string; help: string };
                  return `
                    <div class="violation">
                        <div class="violation-header">
                            <span class="impact ${v.impact}">${v.impact}</span>
                        </div>
                        <div class="violation-title">${v.id}</div>
                        <div class="violation-description">${v.description}</div>
                        <div class="help">
                            <h4>💡 How to fix:</h4>
                            <p>${v.help}</p>
                        </div>
        </div>
      `;
                }).join('')}
    </div>
            ` : `
    <div class="section">
                <h2>✅ No Accessibility Issues Found</h2>
                <p>Great! This email appears to be accessible and follows web accessibility guidelines.</p>
            </div>
            `}
        </div>
        
        <div class="footer">
            <p>Report generated by Email Accessibility Scanner</p>
        </div>
    </div>
  </body>
</html>`;
}

async function runAccessibilityScan(htmlContent: string) {
  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  
  try {
    const fullHtml = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <title>Email Accessibility Scan</title>
        <script src="https://unpkg.com/axe-core@4.10.0/axe.min.js"></script>
    </head>
    <body>
        ${htmlContent}
    </body>
    </html>`;
    
    await page.setContent(fullHtml);
    
    const results = await page.evaluate(async () => {
      return new Promise((resolve) => {
        if (typeof window !== 'undefined' && (window as unknown as { axe?: unknown }).axe) {
          const axe = (window as unknown as { axe: { run: (doc: Document, options: Record<string, unknown>, callback: (err: Error | null, results: unknown) => void) => void } }).axe;
          axe.run(document, {}, (err: Error | null, results: unknown) => {
            if (err) {
              resolve({ violations: [], error: err.toString() });
        } else {
              resolve(results);
            }
          });
        } else {
          resolve({ violations: [], error: 'axe-core not loaded' });
        }
      });
    });
    
    const violations = (results as { violations?: unknown[] }).violations || [];
    
    const passes = (results as { passes?: unknown[] }).passes || [];
    const incomplete = (results as { incomplete?: unknown[] }).incomplete || [];
    const inapplicable = (results as { inapplicable?: unknown[] }).inapplicable || [];

      return {
      timestamp: new Date().toISOString(),
        violations,
        passes,
        incomplete,
      inapplicable,
      summary: {
        totalViolations: violations.length,
        critical: violations.filter((v: unknown) => (v as { impact?: string }).impact === 'critical').length,
        serious: violations.filter((v: unknown) => (v as { impact?: string }).impact === 'serious').length,
        moderate: violations.filter((v: unknown) => (v as { impact?: string }).impact === 'moderate').length,
        minor: violations.filter((v: unknown) => (v as { impact?: string }).impact === 'minor').length,
      },
      url: 'email-content',
      toolOptions: {
        resultTypes: ['violations']
      }
    };
  } catch (error) {
    return {
      timestamp: new Date().toISOString(),
      violations: [],
      passes: [],
      incomplete: [],
      inapplicable: [],
      summary: {
        totalViolations: 0,
        critical: 0,
        serious: 0,
        moderate: 0,
        minor: 0,
      },
      error: `Accessibility scan failed: ${error}`,
      url: 'email-content'
    };
  } finally {
    await browser.close();
  }
}
