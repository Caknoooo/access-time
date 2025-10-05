import { EmailSample } from '@/types';

interface TestSamplesProps {
  samples: EmailSample[];
  onTestSample: (sample: EmailSample) => void;
  onPreviewSample: (sample: EmailSample) => void;
}

export function TestSamples({ samples, onTestSample, onPreviewSample }: TestSamplesProps) {
  if (samples.length === 0) {
    return (
      <div className="bg-gray-50 rounded-xl p-6 border border-gray-200 mb-8">
        <div className="text-center text-gray-500">
          <div className="text-4xl mb-2">📧</div>
          <p>Loading test samples...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl p-6 border border-gray-200 mb-8 shadow-sm">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Test Samples</h2>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {samples.map((sample) => (
          <div key={sample.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <h3 className="font-medium text-gray-900 mb-2">{sample.name}</h3>
            <p className="text-sm text-gray-600 mb-3">{sample.description}</p>
            
            <div className="mb-4">
              <div className="text-xs font-medium text-gray-500 mb-1">Features:</div>
              <div className="flex flex-wrap gap-1">
                {sample.features.map((feature) => (
                  <span
                    key={feature}
                    className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded"
                  >
                    {feature}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => onTestSample(sample)}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 px-3 rounded-lg transition-colors duration-200"
              >
                Test
              </button>
              <button
                onClick={() => onPreviewSample(sample)}
                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white text-sm font-medium py-2 px-3 rounded-lg transition-colors duration-200"
              >
                Preview
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}