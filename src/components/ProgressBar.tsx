import { ScanStatus } from '@/types';
import { PROGRESS_CONFIG } from '@/utils/constants';

interface ProgressBarProps {
  status: ScanStatus;
}

export function ProgressBar({ status }: ProgressBarProps) {
  const config = PROGRESS_CONFIG[status];

  return (
    <div className="bg-white rounded-xl p-6 border border-gray-200 mb-6 shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-700">{config.label}</span>
        <span className="text-sm text-gray-500">{config.percentage}</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className={`h-2 rounded-full transition-all duration-500 ease-out ${config.color} ${config.width}`}
        />
      </div>
    </div>
  );
}