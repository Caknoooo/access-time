import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import nodemailer from 'nodemailer';

async function sendSampleToMailHog(sample: any, htmlContent: string) {
  const timestamp = new Date().toISOString();
  
  // Create SMTP transporter untuk MailHog
  const transporter = nodemailer.createTransport({
    host: 'localhost',
    port: 1025, // SMTP port MailHog
    secure: false, // Tidak menggunakan SSL/TLS untuk local development
    ignoreTLS: true,
  });

  const mailOptions = {
    from: 'test@example.com',
    to: 'test@local.test',
    subject: `Sample Test: ${sample.name} - ${timestamp}`,
    html: htmlContent,
    text: `Test sample: ${sample.name}\nDescription: ${sample.description}\nFeatures: ${sample.features.join(', ')}`
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Sample sent to MailHog successfully:', info.messageId);
  } catch (error) {
    console.error('Error sending email to MailHog:', error);
    throw new Error(`Failed to send sample to MailHog: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function GET(request: NextRequest) {
  try {
    const samplesPath = path.join(process.cwd(), 'tests', 'email-samples');
    const indexPath = path.join(process.cwd(), 'tests', 'index.json');
    
    // Read the index file for sample metadata
    const indexData = JSON.parse(fs.readFileSync(indexPath, 'utf8'));
    
    return NextResponse.json(indexData);
  } catch (error) {
    console.error('Error reading test samples:', error);
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
    
    // Read the index to get sample info
    const indexData = JSON.parse(fs.readFileSync(indexPath, 'utf8'));
    const sample = indexData.emailSamples.find((s: any) => s.id === sampleId);
    
    if (!sample) {
      return NextResponse.json({ error: 'Sample not found' }, { status: 404 });
    }
    
    // Read the HTML file
    const filePath = path.join(samplesPath, sample.file);
    const htmlContent = fs.readFileSync(filePath, 'utf8');
    
    if (action === 'send') {
      // Send sample to MailHog as email
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
    console.error('Error with sample:', error);
    return NextResponse.json({ error: 'Failed to process sample: ' + (error instanceof Error ? error.message : 'Unknown error') }, { status: 500 });
  }
}
