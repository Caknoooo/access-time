import axios from 'axios';

const MAILHOG_API_URL = process.env.MAILHOG_API_URL || 'http://localhost:8025/api/v2';

export async function GET() {
  try {
    const response = await axios.get(`${MAILHOG_API_URL}/messages`);
    const messages = response.data.items || [];
    
    return Response.json({
      status: 'ok',
      messageCount: messages.length,
      mailhogUrl: MAILHOG_API_URL,
      latestMessage: messages.length > 0 ? {
        id: messages[0].ID,
        from: messages[0].From,
        to: messages[0].To,
        subject: messages[0].Content?.Headers?.Subject?.[0] || 'No subject',
        received: messages[0].Created
      } : null
    });
  } catch (error) {
    return Response.json({
      status: 'error',
      error: `Cannot connect to MailHog: ${error}`,
      mailhogUrl: MAILHOG_API_URL
    }, { status: 500 });
  }
}
