'use client';

import { useState, useEffect } from 'react';

const TEST_EMAIL = 'test@local.test';

type EmailSample = {
  id: string;
  name: string;
  file: string;
  description: string;
  features: string[];
  violationsExpected: number;
};

export default function Home() {
  const [status, setStatus] = useState<'waiting' | 'processing' | 'complete' | 'error'>('waiting');
  const [results, setResults] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [samples, setSamples] = useState<EmailSample[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [previewContent, setPreviewContent] = useState<{sample: EmailSample, content: string} | null>(null);

  useEffect(() => {
    let lastEmailId: string | null = null;
    let isProcessing = false;
    
    const checkForEmails = async () => {
      try {
        if (isProcessing) return;
        
        const response = await fetch('/api/emails');
        const data = await response.json();
        
        if (data.hasNewEmail && data.emailId !== lastEmailId) {
          lastEmailId = data.emailId;
          isProcessing = true;
          setStatus('processing');
          setError(null);
          
          const scanResponse = await fetch('/api/scan', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ html: data.htmlContent })
          });
          
          const scanResults = await scanResponse.json();
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
    
    checkForEmails();
    const interval = setInterval(checkForEmails, 3000);
    
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const loadSamples = async () => {
      try {
        const response = await fetch('/api/test-samples');
        const data = await response.json();
        setSamples(data.emailSamples);
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
      
      const sendResponse = await fetch('/api/test-samples', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sampleId: sample.id, action: 'send' })
      });
      
      const sendData = await sendResponse.json();
      
      if (!sendData.sent) {
        throw new Error('Failed to send sample to MailHog');
      }
      
      console.log('Sample sent to MailHog, waiting for detection...');
      await new Promise(resolve => setTimeout(resolve, 1000));
      const emailResponse = await fetch('/api/emails');
      const emailData = await emailResponse.json();
      
      if (!emailData.hasNewEmail) {
        throw new Error('Email not detected in MailHog');
      }
      
      const scanResponse = await fetch('/api/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ html: emailData.htmlContent })
      });
      
      const scanResults = await scanResponse.json();
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
      const response = await fetch('/api/test-samples', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sampleId: sample.id })
      });
      
      const data = await response.json();
      setPreviewContent({
        sample,
        content: data.htmlContent
      });
      setShowPreview(true);
    } catch (err) {
      console.error('Error loading preview:', err);
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '40px 20px',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      <div style={{
        maxWidth: '800px',
        margin: '0 auto',
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderRadius: '20px',
        padding: '40px',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
        backdropFilter: 'blur(10px)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h1 style={{
            fontSize: '2.5rem',
            fontWeight: '700',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            margin: '0 0 10px 0',
            letterSpacing: '-0.02em'
          }}>
            Email Accessibility Scanner
          </h1>
          <p style={{
            color: '#6b7280',
            fontSize: '1.1rem',
            margin: '0'
          }}>
            Automated accessibility testing for email HTML content
          </p>
            </div>

            {/* Test Samples Section */}
            {samples.length > 0 && (
              <div style={{
                backgroundColor: '#f8fafc',
                padding: '24px',
                borderRadius: '16px',
                marginBottom: '32px',
                border: '1px solid #e2e8f0'
              }}>
                <h3 style={{
                  fontSize: '1.25rem',
                  fontWeight: '600',
                  color: '#1f2937',
                  marginBottom: '20px'
                }}>
                  🧪 Test Samples
                </h3>
                <p style={{
                  color: '#6b7280',
                  fontSize: '0.875rem',
                  marginBottom: '20px'
                }}>
                  Sample HTML akan dikirim ke MailHog sebagai email, lalu di-scan otomatis
                </p>
                
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                  gap: '16px'
                }}>
                  {samples.map((sample) => (
                    <div key={sample.id} style={{
                      backgroundColor: 'white',
                      padding: '16px',
                      borderRadius: '12px',
                      border: '1px solid #e2e8f0',
                      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
                    }}>
                      <h4 style={{
                        fontSize: '1rem',
                        fontWeight: '600',
                        color: '#1f2937',
                        marginBottom: '8px'
                      }}>
                        {sample.name}
                      </h4>
                      
                      <p style={{
                        color: '#6b7280',
                        fontSize: '0.75rem',
                        marginBottom: '12px',
                        lineHeight: '1.4'
                      }}>
                        {sample.description}
                      </p>
                      
                      <div style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: '4px',
                        marginBottom: '12px'
                      }}>
                        {sample.features.slice(0, 3).map((feature, index) => (
                          <span key={index} style={{
                            backgroundColor: '#e5e7eb',
                            color: '#374151',
                            padding: '2px 6px',
                            borderRadius: '4px',
                            fontSize: '0.65rem',
                            fontWeight: '500'
                          }}>
                            {feature}
                          </span>
                        ))}
                        {sample.features.length > 3 && (
                          <span style={{
                            backgroundColor: '#e5e7eb',
                            color: '#6b7280',
                            padding: '2px 6px',
                            borderRadius: '4px',
                            fontSize: '0.65rem'
                          }}>
                            +{sample.features.length - 3} more
                          </span>
                        )}
                      </div>
                      
                      <div style={{
                        display: 'flex',
                        gap: '8px'
                      }}>
                        <button
                          onClick={() => testSample(sample)}
                          style={{
                            flex: 1,
                            padding: '8px 12px',
                            backgroundColor: '#3b82f6',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '0.75rem',
                            fontWeight: '500',
                            transition: 'all 0.2s ease'
                          }}
                          onMouseOver={(e) => {
                            e.currentTarget.style.backgroundColor = '#2563eb';
                            e.currentTarget.style.transform = 'translateY(-1px)';
                          }}
                          onMouseOut={(e) => {
                            e.currentTarget.style.backgroundColor = '#3b82f6';
                            e.currentTarget.style.transform = 'translateY(0)';
                          }}
                        >
                          🔍 Test Scan
                        </button>
                        <button
                          onClick={() => previewSample(sample)}
                          style={{
                            padding: '8px 12px',
                            backgroundColor: '#10b981',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '0.75rem',
                            fontWeight: '500',
                            transition: 'all 0.2s ease'
                          }}
                          onMouseOver={(e) => {
                            e.currentTarget.style.backgroundColor = '#059669';
                            e.currentTarget.style.transform = 'translateY(-1px)';
                          }}
                          onMouseOut={(e) => {
                            e.currentTarget.style.backgroundColor = '#10b981';
                            e.currentTarget.style.transform = 'translateY(0)';
                          }}
                        >
                          👁️ Preview
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div style={{
              backgroundColor: '#f8fafc',
              padding: '24px',
              borderRadius: '16px',
              marginBottom: '32px',
              border: '1px solid #e2e8f0'
            }}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{
              display: 'block',
              fontSize: '0.875rem',
              fontWeight: '600',
              color: '#374151',
              marginBottom: '8px'
            }}>
              Test Email Address:
            </label>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              flexWrap: 'wrap'
            }}>
              <code style={{
                backgroundColor: '#e5e7eb',
                padding: '8px 12px',
                borderRadius: '8px',
                fontSize: '0.875rem',
                fontFamily: 'Monaco, "Cascadia Code", "Roboto Mono", monospace',
                color: '#1f2937'
              }}>
                {TEST_EMAIL}
              </code>
              <button 
                onClick={() => {
                  setStatus('waiting');
                  setResults(null);
                  setError(null);
                }}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 2px 4px rgba(59, 130, 246, 0.3)'
                }}
                onMouseOver={(e) => {
                  e.target.style.backgroundColor = '#2563eb';
                  e.target.style.transform = 'translateY(-1px)';
                  e.target.style.boxShadow = '0 4px 8px rgba(59, 130, 246, 0.4)';
                }}
                onMouseOut={(e) => {
                  e.target.style.backgroundColor = '#3b82f6';
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 2px 4px rgba(59, 130, 246, 0.3)';
                }}
              >
                Reset Scanner
              </button>
            </div>
          </div>
          
          <div style={{ marginBottom: '16px' }}>
            <label style={{
              display: 'block',
              fontSize: '0.875rem',
              fontWeight: '600',
              color: '#374151',
              marginBottom: '8px'
            }}>
              Current Status:
            </label>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 16px',
              borderRadius: '12px',
              backgroundColor: status === 'waiting' ? '#fef3c7' : 
                              status === 'processing' ? '#dbeafe' :
                              status === 'complete' ? '#d1fae5' : '#fee2e2',
              border: `1px solid ${status === 'waiting' ? '#f59e0b' : 
                                status === 'processing' ? '#3b82f6' :
                                status === 'complete' ? '#10b981' : '#ef4444'}`
            }}>
              <div style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: status === 'waiting' ? '#f59e0b' : 
                                status === 'processing' ? '#3b82f6' :
                                status === 'complete' ? '#10b981' : '#ef4444',
                animation: status === 'processing' ? 'pulse 2s infinite' : 'none'
              }} />
              <span style={{
                fontSize: '0.875rem',
                fontWeight: '500',
                color: status === 'waiting' ? '#92400e' : 
                       status === 'processing' ? '#1e40af' :
                       status === 'complete' ? '#065f46' : '#991b1b'
              }}>
                {status === 'waiting' && 'Waiting for email...'}
                {status === 'processing' && 'Processing accessibility scan...'}
                {status === 'complete' && 'Scan completed successfully'}
                {status === 'error' && 'Error occurred'}
              </span>
            </div>
          </div>
        </div>

        {status === 'processing' && (
          <div style={{ marginBottom: '32px' }}>
            <div style={{
              width: '100%',
              height: '8px',
              backgroundColor: '#e5e7eb',
              borderRadius: '4px',
              overflow: 'hidden'
            }}>
              <div style={{
                width: '100%',
                height: '100%',
                background: 'linear-gradient(90deg, #3b82f6, #8b5cf6, #3b82f6)',
                backgroundSize: '200% 100%',
                animation: 'shimmer 2s ease-in-out infinite'
              }} />
            </div>
          </div>
        )}

        {error && (
          <div style={{ 
            padding: '16px', 
            backgroundColor: '#fef2f2', 
            border: '1px solid #fecaca',
            borderRadius: '12px',
            marginBottom: '32px'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '8px'
            }}>
              <div style={{
                width: '20px',
                height: '20px',
                backgroundColor: '#ef4444',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '12px',
                fontWeight: 'bold'
              }}>
                !
              </div>
              <strong style={{ color: '#991b1b', fontSize: '0.875rem' }}>Error:</strong>
            </div>
            <p style={{ color: '#7f1d1d', margin: '0', fontSize: '0.875rem' }}>
              {error}
            </p>
          </div>
        )}

            {results && (
              <div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  marginBottom: '20px'
                }}>
                  <div style={{
                    width: '32px',
                    height: '32px',
                    backgroundColor: '#10b981',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: '16px'
                  }}>
                    ✓
                  </div>
                  <h2 style={{
                    fontSize: '1.5rem',
                    fontWeight: '600',
                    color: '#1f2937',
                    margin: '0'
                  }}>
                    Accessibility Scan Results
                    {results.sampleInfo && (
                      <span style={{
                        fontSize: '1rem',
                        fontWeight: '400',
                        color: '#6b7280',
                        marginLeft: '12px'
                      }}>
                        - {results.sampleInfo.name}
                      </span>
                    )}
                  </h2>
                </div>

                {/* Summary Stats */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
                  gap: '12px',
                  marginBottom: '20px'
                }}>
                  <div style={{
                    backgroundColor: '#fee2e2',
                    border: '1px solid #fecaca',
                    borderRadius: '8px',
                    padding: '12px',
                    textAlign: 'center'
                  }}>
                    <div style={{
                      fontSize: '1.5rem',
                      fontWeight: '700',
                      color: '#dc2626'
                    }}>
                      {results.violations?.length || 0}
                    </div>
                    <div style={{
                      fontSize: '0.75rem',
                      color: '#7f1d1d',
                      fontWeight: '500'
                    }}>
                      Violations
                    </div>
                  </div>
                  <div style={{
                    backgroundColor: '#d1fae5',
                    border: '1px solid #a7f3d0',
                    borderRadius: '8px',
                    padding: '12px',
                    textAlign: 'center'
                  }}>
                    <div style={{
                      fontSize: '1.5rem',
                      fontWeight: '700',
                      color: '#059669'
                    }}>
                      {results.passes?.length || 0}
                    </div>
                    <div style={{
                      fontSize: '0.75rem',
                      color: '#065f46',
                      fontWeight: '500'
                    }}>
                      Passes
                    </div>
                  </div>
                  <div style={{
                    backgroundColor: '#fef3c7',
                    border: '1px solid #fde68a',
                    borderRadius: '8px',
                    padding: '12px',
                    textAlign: 'center'
                  }}>
                    <div style={{
                      fontSize: '1.5rem',
                      fontWeight: '700',
                      color: '#d97706'
                    }}>
                      {results.incomplete?.length || 0}
                    </div>
                    <div style={{
                      fontSize: '0.75rem',
                      color: '#92400e',
                      fontWeight: '500'
                    }}>
                      Incomplete
                    </div>
                  </div>
                  <div style={{
                    backgroundColor: '#f3f4f6',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    padding: '12px',
                    textAlign: 'center'
                  }}>
                    <div style={{
                      fontSize: '1.5rem',
                      fontWeight: '700',
                      color: '#4b5563'
                    }}>
                      {results.inapplicable?.length || 0}
                    </div>
                    <div style={{
                      fontSize: '0.75rem',
                      color: '#374151',
                      fontWeight: '500'
                    }}>
                      Inapplicable
                    </div>
                  </div>
                </div>

                <div style={{
                  backgroundColor: '#1f2937',
                  borderRadius: '12px',
                  padding: '20px',
                  overflow: 'auto',
                  maxHeight: '500px'
                }}>
                  <pre style={{
                    color: '#e5e7eb',
                    fontSize: '0.875rem',
                    fontFamily: 'Monaco, "Cascadia Code", "Roboto Mono", monospace',
                    margin: '0',
                    lineHeight: '1.5',
                    whiteSpace: 'pre-wrap'
                  }}>
                    {JSON.stringify(results, null, 2)}
                  </pre>
                </div>
              </div>
            )}

            {/* Preview Modal */}
            {showPreview && previewContent && (
              <div style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.75)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1000,
                padding: '20px'
              }}>
                <div style={{
                  backgroundColor: 'white',
                  borderRadius: '16px',
                  maxWidth: '90vw',
                  maxHeight: '90vh',
                  width: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  boxShadow: '0 25px 50px rgba(0, 0, 0, 0.25)'
                }}>
                  {/* Modal Header */}
                  <div style={{
                    padding: '20px',
                    borderBottom: '1px solid #e2e8f0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}>
                    <div>
                      <h3 style={{
                        fontSize: '1.25rem',
                        fontWeight: '600',
                        color: '#1f2937',
                        margin: '0 0 4px 0'
                      }}>
                        {previewContent.sample.name}
                      </h3>
                      <p style={{
                        color: '#6b7280',
                        fontSize: '0.875rem',
                        margin: '0'
                      }}>
                        {previewContent.sample.description}
                      </p>
                    </div>
                    <button
                      onClick={() => setShowPreview(false)}
                      style={{
                        backgroundColor: '#ef4444',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        width: '32px',
                        height: '32px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '16px',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.backgroundColor = '#dc2626';
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.backgroundColor = '#ef4444';
                      }}
                    >
                      ×
                    </button>
                  </div>
                  
                  {/* Modal Content */}
                  <div style={{
                    flex: 1,
                    padding: '20px',
                    overflow: 'auto'
                  }}>
                    <iframe
                      srcDoc={previewContent.content}
                      style={{
                        width: '100%',
                        height: '500px',
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px'
                      }}
                    />
                  </div>
                  
                  {/* Modal Footer */}
                  <div style={{
                    padding: '20px',
                    borderTop: '1px solid #e2e8f0',
                    display: 'flex',
                    gap: '12px',
                    justifyContent: 'flex-end'
                  }}>
                    <button
                      onClick={() => setShowPreview(false)}
                      style={{
                        padding: '8px 16px',
                        backgroundColor: '#6b7280',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontSize: '0.875rem',
                        fontWeight: '500'
                      }}
                    >
                      Close
                    </button>
                    <button
                      onClick={() => {
                        setShowPreview(false);
                        testSample(previewContent.sample);
                      }}
                      style={{
                        padding: '8px 16px',
                        backgroundColor: '#3b82f6',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontSize: '0.875rem',
                        fontWeight: '500'
                      }}
                    >
                      Test This Sample
                    </button>
                  </div>
                </div>
              </div>
            )}

        <style jsx>{`
          @keyframes shimmer {
            0% { background-position: -200% 0; }
            100% { background-position: 200% 0; }
          }
          
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
          }
        `}</style>
      </div>
    </div>
  );
}
