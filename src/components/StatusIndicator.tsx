import { ScanStatus } from '@/types';
import { STATUS_CONFIG } from '@/utils/constants';

interface StatusIndicatorProps {
  status: ScanStatus;
}

export function StatusIndicator({ status }: StatusIndicatorProps) {
  const config = STATUS_CONFIG[status];

  return (
    <div className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg border font-medium ${config.className}`}>
      <span className="text-lg">{config.icon}</span>
      <span>{config.label}</span>
    </div>
  );
}