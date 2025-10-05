import { NextRequest, NextResponse } from 'next/server';

const MAILHOG_API_URL = process.env.MAILHOG_API_URL || 'https://access-time-mailhog.bengcare.com/api/v2';

export async function GET() {
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
      const htmlPart = latestEmail.MIME.Parts.find((part: { Headers?: { 'Content-Type'?: string[] }; Body?: string }) => 
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
    return NextResponse.json({ error: `Failed to fetch emails: ${error instanceof Error ? error.message : 'Unknown error'}` }, { status: 500 });
  }
}
