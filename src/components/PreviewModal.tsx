import { EmailSample } from '@/types';

interface PreviewModalProps {
  isOpen: boolean;
  sample: EmailSample | null;
  content: string;
  onClose: () => void;
  onTest: (sample: EmailSample) => void;
}

export function PreviewModal({ isOpen, sample, content, onClose, onTest }: PreviewModalProps) {
  if (!isOpen || !sample) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-center justify-center p-4">
        {/* Backdrop */}
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
          onClick={onClose}
        />
        
        {/* Modal */}
        <div className="relative bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">{sample.name}</h2>
              <p className="text-sm text-gray-600 mt-1">{sample.description}</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
            <div className="mb-4">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Features:</h3>
              <div className="flex flex-wrap gap-2">
                {sample.features.map((feature) => (
                  <span
                    key={feature}
                    className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded"
                  >
                    {feature}
                  </span>
                ))}
              </div>
            </div>

            <div className="mb-4">
              <h3 className="text-sm font-medium text-gray-700 mb-2">HTML Preview:</h3>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 overflow-x-auto">
                <pre className="text-xs text-gray-800 whitespace-pre-wrap">
                  {content.substring(0, 1000)}
                  {content.length > 1000 && '...'}
                </pre>
              </div>
            </div>

            <div className="mb-4">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Rendered Preview:</h3>
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <iframe
                  srcDoc={content}
                  className="w-full h-96 border-0"
                  title={`Preview of ${sample.name}`}
                />
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Close
            </button>
            <button
              onClick={() => {
                onTest(sample);
                onClose();
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Test This Sample
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}