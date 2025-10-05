import { useState, useEffect, useCallback } from 'react';
import { ScanStatus, ScanResult, EmailSample } from '@/types';
import { EmailService, EmailEvent } from '@/services/emailService';
import { logger } from '@/utils/logger';

export interface UseEmailMonitoringReturn {
  status: ScanStatus;
  results: ScanResult | null;
  error: string | null;
  samples: EmailSample[];
  showPreview: boolean;
  previewContent: { sample: EmailSample; content: string } | null;
  testSample: (sample: EmailSample) => Promise<void>;
  previewSample: (sample: EmailSample) => Promise<void>;
  resetScanner: () => void;
  setShowPreview: (show: boolean) => void;
}

export function useEmailMonitoring(): UseEmailMonitoringReturn {
  const [status, setStatus] = useState<ScanStatus>('waiting');
  const [results, setResults] = useState<ScanResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [samples, setSamples] = useState<EmailSample[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [previewContent, setPreviewContent] = useState<{sample: EmailSample, content: string} | null>(null);

  useEffect(() => {
    const loadSamples = async () => {
      try {
        const samplesData = await EmailService.loadSamples();
        setSamples(samplesData);
        logger.info('Samples loaded successfully', { count: samplesData.length });
      } catch (err) {
        logger.error('Error loading samples', { error: err instanceof Error ? err.message : 'Unknown error' });
      }
    };
    
    loadSamples();
  }, []);

  useEffect(() => {
    logger.info('Setting up email monitoring');
    
    const eventSource = EmailService.connectToEvents();
    
    const handleEmailEvent = (event: EmailEvent) => {
      switch (event.type) {
        case 'email_received':
          logger.info('Email received', { data: event.data });
          setStatus('processing');
          setError(null);
          break;
        case 'scan_complete':
          logger.info('Scan complete', { data: event.data });
          setStatus('complete');
          setResults((event.data as { results: ScanResult }).results);
          break;
        case 'scan_error':
          logger.error('Scan error', { data: event.data });
          setStatus('error');
          setError((event.data as { error?: string }).error || 'Scan failed');
          break;
        case 'status_update':
          logger.debug('Status update', { data: event.data });
          if ((event.data as { status?: string }).status === 'listening') {
            setStatus('waiting');
          }
          break;
      }
    };

    EmailService.addEventListener('main', handleEmailEvent);

    return () => {
      logger.info('Cleaning up email monitoring');
      EmailService.removeEventListener('main');
      EmailService.disconnect();
    };
  }, []);

  const testSample = useCallback(async (sample: EmailSample) => {
    try {
      logger.info('Testing sample', { sampleId: sample.id, sampleName: sample.name });
      setStatus('processing');
      setError(null);
      
      const sendData = await EmailService.sendSample(sample.id);
      
      if (!sendData.sent) {
        throw new Error('Failed to send sample to MailHog');
      }
      
      logger.info('Sample sent to MailHog, waiting for detection');

    } catch (err) {
      logger.error('Error testing sample', { error: err instanceof Error ? err.message : 'Unknown error' });
      setStatus('error');
      setError(`Failed to test sample: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  }, []);

  const previewSample = useCallback(async (sample: EmailSample) => {
    try {
      logger.info('Previewing sample', { sampleId: sample.id });
      const data = await EmailService.getSampleContent(sample.id);
      setPreviewContent({
        sample,
        content: data.htmlContent
      });
      setShowPreview(true);
    } catch (err) {
      logger.error('Error loading preview', { error: err instanceof Error ? err.message : 'Unknown error' });
    }
  }, []);

  const resetScanner = useCallback(() => {
    logger.info('Resetting scanner');
    setStatus('waiting');
    setResults(null);
    setError(null);
  }, []);

  return {
    status,
    results,
    error,
    samples,
    showPreview,
    previewContent,
    testSample,
    previewSample,
    resetScanner,
    setShowPreview,
  };
}
