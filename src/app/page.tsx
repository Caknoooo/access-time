'use client';

import { TestSamples } from '@/components/TestSamples';
import { ScanResults } from '@/components/ScanResults';
import { PreviewModal } from '@/components/PreviewModal';
import { ErrorDisplay } from '@/components/ErrorDisplay';
import { ProgressBar } from '@/components/ProgressBar';
import { StatusIndicator } from '@/components/StatusIndicator';
import { useEmailMonitoring } from '@/hooks/useEmailMonitoring';
import { APP_CONFIG } from '@/utils/constants';

const TEST_EMAIL = 'test@local.test';

export default function Home() {
  const {
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
  } = useEmailMonitoring();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header Section */}
          <header className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Email Accessibility Scanner
            </h1>
            <p className="text-xl text-slate-300 max-w-2xl mx-auto">
              Automated accessibility testing for email HTML content using modern web standards
            </p>
          </header>

          {/* Main Content */}
          <main className="space-y-8">
            <TestSamples 
              samples={samples}
              onTestSample={testSample}
              onPreviewSample={previewSample}
            />

            {/* Control Panel */}
            <section className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
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
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors duration-200 shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-900"
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
            </section>

            <ProgressBar status={status} />

            {error && <ErrorDisplay error={error} />}

            {results && <ScanResults results={results} />}
          </main>
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