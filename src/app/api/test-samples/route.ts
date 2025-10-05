import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import nodemailer from 'nodemailer';

async function sendSampleToMailHog(sample: { name: string; description: string; features: string[] }, htmlContent: string) {
  const timestamp = new Date().toISOString();

  const transporter = nodemailer.createTransport({
    host: process.env.MAILHOG_HOST || 'access-time-mailhog.bengcare.com',
    port: Number(process.env.MAILHOG_SMTP_PORT || '1025'),
    secure: process.env.SMTP_SECURE === 'true',
    ignoreTLS: process.env.SMTP_IGNORE_TLS === 'true',
  });

  const mailOptions = {
    from: process.env.TEST_FROM_EMAIL || 'test@example.com',
    to: process.env.TEST_TO_EMAIL || 'test@local.test',
    subject: `Sample Test: ${sample.name} - ${timestamp}`,
    html: htmlContent,
    text: `Test sample: ${sample.name}\nDescription: ${sample.description}\nFeatures: ${sample.features.join(', ')}`
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    throw new Error(`Failed to send sample to MailHog: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function GET() {
  try {
    const indexPath = path.join(process.cwd(), 'tests', 'index.json');
    const indexData = JSON.parse(fs.readFileSync(indexPath, 'utf8'));
    return NextResponse.json(indexData);
  } catch {
    return NextResponse.json({ error: 'Failed to read test samples' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { sampleId, action = 'read' } = await request.json();
    if (!sampleId) {
      return NextResponse.json({ error: 'Sample ID is required' }, { status: 400 });
    }
    
    const samplesPath = path.join(process.cwd(), 'tests', 'email-samples');
    const indexPath = path.join(process.cwd(), 'tests', 'index.json');
    const indexData = JSON.parse(fs.readFileSync(indexPath, 'utf8'));
    const sample = indexData.emailSamples.find((s: { id: string }) => s.id === sampleId);
    if (!sample) {
      return NextResponse.json({ error: 'Sample not found' }, { status: 404 });
    }

    const filePath = path.join(samplesPath, sample.file);
    const htmlContent = fs.readFileSync(filePath, 'utf8');
    if (action === 'send') {
      await sendSampleToMailHog(sample, htmlContent);
      return NextResponse.json({
        message: 'Sample sent to MailHog successfully',
        sample,
        sent: true
      });
    }

    return NextResponse.json({
      sample,
      htmlContent
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to process sample: ' + (error instanceof Error ? error.message : 'Unknown error') }, { status: 500 });
  }
}
