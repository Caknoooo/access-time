// Constants for the application
export const APP_CONFIG = {
  API_BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api',
  POLLING_INTERVAL: 5000, // 5 seconds
  MAX_HTML_SIZE: 1024 * 1024, // 1MB
  SCAN_TIMEOUT: 30000, // 30 seconds
  MAX_RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 2000, // 2 seconds
} as const;

export const STATUS_CONFIG = {
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
} as const;

export const PROGRESS_CONFIG = {
  waiting: {
    width: 'w-0',
    color: 'bg-gray-300',
    label: 'Waiting for email...',
    percentage: '0%',
  },
  processing: {
    width: 'w-1/2',
    color: 'bg-blue-500',
    label: 'Scanning accessibility...',
    percentage: '50%',
  },
  complete: {
    width: 'w-full',
    color: 'bg-green-500',
    label: 'Scan completed!',
    percentage: '100%',
  },
  error: {
    width: 'w-full',
    color: 'bg-red-500',
    label: 'Scan failed',
    percentage: '100%',
  },
} as const;

export const ERROR_MESSAGES = {
  INVALID_HTML: 'HTML content is required and must be a string',
  EMPTY_HTML: 'HTML content cannot be empty',
  HTML_TOO_LARGE: 'HTML content exceeds 1MB limit',
  SCAN_FAILED: 'Failed to scan HTML',
  EMAIL_CHECK_FAILED: 'Failed to check emails',
  SAMPLE_LOAD_FAILED: 'Failed to load samples',
  SAMPLE_SEND_FAILED: 'Failed to send sample',
  SAMPLE_CONTENT_FAILED: 'Failed to get sample content',
  SSE_CONNECTION_FAILED: 'Failed to establish SSE connection',
} as const;

export const HTTP_STATUS = {
  OK: 200,
  BAD_REQUEST: 400,
  PAYLOAD_TOO_LARGE: 413,
  REQUEST_TIMEOUT: 408,
  INTERNAL_SERVER_ERROR: 500,
} as const;
