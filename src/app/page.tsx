'use client';

import { useState, useEffect } from 'react';

interface ScanResult {
  status: 'waiting' | 'processing' | 'completed' | 'error';
  data?: unknown;
  error?: string;
}

export default function Home() {
  const [scanResult, setScanResult] = useState<ScanResult>({ status: 'waiting' });
  const [isListening, setIsListening] = useState(false);

  const testEmail = process.env.NEXT_PUBLIC_TEST_EMAIL || 'test@local.test';

  useEffect(() => {
    if (isListening) {
      const eventSource = new EventSource('/api/scan');
      
      eventSource.onmessage = (event) => {
        const data = JSON.parse(event.data);
        setScanResult(data);
      };

      eventSource.onerror = () => {
        setScanResult({ status: 'error', error: 'Connection error' });
        eventSource.close();
      };

      return () => {
        eventSource.close();
      };
    }
  }, [isListening]);

  const startListening = () => {
    setIsListening(true);
    setScanResult({ status: 'processing' });
  };

  const stopListening = () => {
    setIsListening(false);
    setScanResult({ status: 'waiting' });
  };

  return (
    <div className="min-h-screen p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Email Accessibility Scanner POC</h1>
      
      <div className="mb-8 p-6 border rounded-lg bg-gray-50">
        <h2 className="text-xl font-semibold mb-4">Test Email Address</h2>
        <p className="text-lg font-mono bg-white p-3 rounded border">
          {testEmail}
        </p>
        <p className="text-sm text-gray-600 mt-2">
          Kirim email HTML ke alamat ini untuk memulai scan aksesibilitas
        </p>
      </div>

      <div className="mb-8">
        <button
          onClick={isListening ? stopListening : startListening}
          className={`px-6 py-3 rounded font-medium ${
            isListening 
              ? 'bg-red-500 text-white hover:bg-red-600' 
              : 'bg-blue-500 text-white hover:bg-blue-600'
          }`}
        >
          {isListening ? 'Stop Listening' : 'Start Listening'}
        </button>
      </div>

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Status</h2>
        <div className="p-4 border rounded-lg">
          {scanResult.status === 'waiting' && (
            <p className="text-gray-600">Menunggu untuk memulai scan...</p>
          )}
          
          {scanResult.status === 'processing' && (
            <div className="flex items-center space-x-3">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
              <p className="text-blue-600">Memproses email dan menjalankan accessibility scan...</p>
            </div>
          )}
          
          {scanResult.status === 'error' && (
            <p className="text-red-600">Error: {scanResult.error}</p>
          )}
          
          {scanResult.status === 'completed' && (
            <p className="text-green-600">Scan selesai! Lihat hasil di bawah.</p>
          )}
        </div>
      </div>

      {scanResult.status === 'completed' && scanResult.data ? (
        <div>
          <h2 className="text-xl font-semibold mb-4">Hasil Accessibility Scan</h2>
          <div className="border rounded-lg p-4 bg-gray-50">
            <pre className="text-sm overflow-auto max-h-96 whitespace-pre-wrap">
              {JSON.stringify(scanResult.data, null, 2)}
            </pre>
          </div>
        </div>
      ) : null}
    </div>
  );
}
