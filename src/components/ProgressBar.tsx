import { ScanStatus } from '@/types';

interface ProgressBarProps {
  status: ScanStatus;
}

export function ProgressBar({ status }: ProgressBarProps) {
  const getProgressConfig = () => {
    switch (status) {
      case 'waiting':
        return {
          width: '0%',
          color: 'bg-gray-300',
          label: 'Waiting for email...',
        };
      case 'processing':
        return {
          width: '50%',
          color: 'bg-blue-500',
          label: 'Scanning accessibility...',
        };
      case 'complete':
        return {
          width: '100%',
          color: 'bg-green-500',
          label: 'Scan completed!',
        };
      case 'error':
        return {
          width: '100%',
          color: 'bg-red-500',
          label: 'Scan failed',
        };
      default:
        return {
          width: '0%',
          color: 'bg-gray-300',
          label: 'Ready',
        };
    }
  };

  const config = getProgressConfig();

  return (
    <div className="bg-white rounded-xl p-6 border border-gray-200 mb-6 shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-700">{config.label}</span>
        <span className="text-sm text-gray-500">{config.width}</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className={`h-2 rounded-full transition-all duration-500 ease-out ${config.color}`}
          style={{ width: config.width }}
        />
      </div>
    </div>
  );
}