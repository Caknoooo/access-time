'use client';

import { useState, useEffect } from 'react';
import { EmailSample, ScanResult, ScanStatus } from '@/types';
import { EmailService } from '@/services/emailService';
import { StatusIndicator } from '@/components/StatusIndicator';
import { TestSamples } from '@/components/TestSamples';
import { ScanResults } from '@/components/ScanResults';
import { PreviewModal } from '@/components/PreviewModal';
import { ErrorDisplay } from '@/components/ErrorDisplay';
import { ProgressBar } from '@/components/ProgressBar';

const TEST_EMAIL = 'test@local.test';

export default function Home() {
  const [status, setStatus] = useState<ScanStatus>('waiting');
  const [results, setResults] = useState<ScanResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [samples, setSamples] = useState<EmailSample[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [previewContent, setPreviewContent] = useState<{sample: EmailSample, content: string} | null>(null);

  useEffect(() => {
    let lastEmailId: string | null = null;
    let isProcessing = false;
    let timeoutId: NodeJS.Timeout;
    let isActive = true;
    
    const checkForEmails = async () => {
      try {
        if (!isActive || isProcessing) return;
        
        const emailData = await EmailService.checkForEmails();
        
        if (emailData.hasNewEmail && emailData.emailId !== lastEmailId) {
          lastEmailId = emailData.emailId!;
          isProcessing = true;
          setStatus('processing');
          setError(null);
          
          const scanResults = await EmailService.scanHtml(emailData.htmlContent!);
          setStatus('complete');
          setResults(scanResults);
          isProcessing = false;
          return;
        }
        
        if (!isProcessing && status !== 'complete') {
          setStatus('waiting');
        }
      } catch (err) {
        console.error('Error checking emails:', err);
        setStatus('error');
        setError('Failed to check emails');
        isProcessing = false;
      }
    };
    
    const startPolling = () => {
      if (!isActive) return;
      
      checkForEmails();
      timeoutId = setTimeout(startPolling, 10000); // Increased to 10 seconds
    };
    
    startPolling();
    
    return () => {
      isActive = false;
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [status]); // Keep status dependency but with better control

  useEffect(() => {
    const loadSamples = async () => {
      try {
        const samplesData = await EmailService.loadSamples();
        setSamples(samplesData);
      } catch (err) {
        console.error('Error loading samples:', err);
      }
    };
    
    loadSamples();
  }, []);

  const testSample = async (sample: EmailSample) => {
    try {
      setStatus('processing');
      setError(null);
      
      const sendData = await EmailService.sendSample(sample.id);
      
      if (!sendData.sent) {
        throw new Error('Failed to send sample to MailHog');
      }
      
      console.log('Sample sent to MailHog, waiting for detection...');
      // Wait for email to be processed
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Check for email with simple retry mechanism
      let attempts = 0;
      let emailData;
      do {
        emailData = await EmailService.checkForEmails();
        attempts++;
        if (!emailData.hasNewEmail && attempts < 3) {
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      } while (!emailData.hasNewEmail && attempts < 3);
      
      if (!emailData.hasNewEmail) {
        throw new Error('Email not detected in MailHog after multiple attempts');
      }
      
      const scanResults = await EmailService.scanHtml(emailData.htmlContent!);
      setStatus('complete');
      setResults({ ...scanResults, sampleInfo: sample });
    } catch (err) {
      console.error('Error testing sample:', err);
      setStatus('error');
      setError(`Failed to test sample: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  const previewSample = async (sample: EmailSample) => {
    try {
      const data = await EmailService.getSampleContent(sample.id);
      setPreviewContent({
        sample,
        content: data.htmlContent
      });
      setShowPreview(true);
    } catch (err) {
      console.error('Error loading preview:', err);
    }
  };

  const resetScanner = () => {
    setStatus('waiting');
    setResults(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Email Accessibility Scanner
            </h1>
            <p className="text-xl text-slate-300 max-w-2xl mx-auto">
              Automated accessibility testing for email HTML content using modern web standards
            </p>
          </div>

          {/* Main Content */}
          <div className="space-y-8">
            <TestSamples 
              samples={samples}
              onTestSample={testSample}
              onPreviewSample={previewSample}
            />

            {/* Scanner Status */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-white mb-3">
                    Test Email Address
                  </label>
                  <div className="flex items-center gap-3 flex-wrap">
                    <code className="bg-slate-800 text-slate-200 px-4 py-2 rounded-lg text-sm font-mono">
                      {TEST_EMAIL}
                    </code>
                    <button 
                      onClick={resetScanner}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors duration-200 shadow-lg hover:shadow-xl"
                    >
                      Reset Scanner
                    </button>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-white mb-3">
                    Current Status
                  </label>
                  <StatusIndicator status={status} />
                </div>
              </div>
            </div>

            <ProgressBar status={status} />

            {error && <ErrorDisplay error={error} />}

            {results && <ScanResults results={results} />}
          </div>
        </div>
      </div>

      <PreviewModal
        isOpen={showPreview}
        sample={previewContent?.sample || null}
        content={previewContent?.content || ''}
        onClose={() => setShowPreview(false)}
        onTest={testSample}
      />
    </div>
  );
}