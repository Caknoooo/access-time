import { NextRequest, NextResponse } from 'next/server';

const MAILHOG_API_URL = 'http://localhost:8025/api/v2';
const TEST_EMAIL = 'test@local.test';

export async function GET(request: NextRequest) {
  try {
    const response = await fetch(`${MAILHOG_API_URL}/messages`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch emails');
    }
    
    const data = await response.json();
    const messages = data.items || [];
    
    if (messages.length === 0) {
      return NextResponse.json({ hasNewEmail: false });
    }
    
    const latestEmail = messages[0];
    
    let htmlContent = '';
    if (latestEmail.MIME && latestEmail.MIME.Parts) {
      const htmlPart = latestEmail.MIME.Parts.find((part: any) => 
        part.Headers && part.Headers['Content-Type'] && 
        part.Headers['Content-Type'][0].includes('text/html')
      );
      if (htmlPart) {
        htmlContent = htmlPart.Body || '';
      }
    }
    
    if (!htmlContent) {
      htmlContent = latestEmail.Body || '';
    }
    
    // Clean up the HTML content
    htmlContent = htmlContent
      .replace(/\\r\\n/g, '\n')
      .replace(/\\n/g, '\n')
      .replace(/\\"/g, '"')
      .replace(/\\t/g, '\t');
    
    return NextResponse.json({
      hasNewEmail: true,
      emailId: latestEmail.ID,
      htmlContent,
      subject: latestEmail.Content?.Headers?.Subject?.[0] || 'Test Email'
    });
  } catch (error) {
    console.error('Email fetch error:', error);
    return NextResponse.json({ error: `Failed to fetch emails: ${error instanceof Error ? error.message : 'Unknown error'}` }, { status: 500 });
  }
}
