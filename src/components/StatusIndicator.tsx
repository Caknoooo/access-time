import { ScanStatus } from '@/types';

interface StatusIndicatorProps {
  status: ScanStatus;
}

const statusConfig = {
  waiting: {
    label: 'Waiting for Email',
    icon: '⏳',
    className: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  },
  processing: {
    label: 'Processing',
    icon: '🔄',
    className: 'bg-blue-100 text-blue-800 border-blue-200',
  },
  complete: {
    label: 'Scan Complete',
    icon: '✅',
    className: 'bg-green-100 text-green-800 border-green-200',
  },
  error: {
    label: 'Error',
    icon: '❌',
    className: 'bg-red-100 text-red-800 border-red-200',
  },
};

export function StatusIndicator({ status }: StatusIndicatorProps) {
  const config = statusConfig[status];

  return (
    <div className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg border font-medium ${config.className}`}>
      <span className="text-lg">{config.icon}</span>
      <span>{config.label}</span>
    </div>
  );
}