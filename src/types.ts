export type ScanStatus = 'waiting' | 'processing' | 'complete' | 'error';

export interface EmailSample {
  id: string;
  name: string;
  description: string;
  features: string[];
  file: string;
}

export interface ScanResult {
  violations: AccessibilityViolation[];
  passes: AccessibilityPass[];
  incomplete: AccessibilityIncomplete[];
  inapplicable: AccessibilityInapplicable[];
  sampleInfo?: EmailSample;
}

export interface AccessibilityViolation {
  id: string;
  impact: 'critical' | 'serious' | 'moderate' | 'minor';
  tags: string[];
  description: string;
  help: string;
  helpUrl: string;
  nodes: AccessibilityNode[];
}

export interface AccessibilityPass {
  id: string;
  impact: null;
  tags: string[];
  description: string;
  nodes: AccessibilityNode[];
}

export interface AccessibilityIncomplete {
  id: string;
  impact: 'critical' | 'serious' | 'moderate' | 'minor';
  tags: string[];
  description: string;
  nodes: AccessibilityNode[];
}

export interface AccessibilityInapplicable {
  id: string;
  impact: null;
  tags: string[];
  description: string;
  nodes: AccessibilityNode[];
}

export interface AccessibilityNode {
  target: string[];
  html: string;
  failureSummary?: string;
}

export interface EmailData {
  hasNewEmail: boolean;
  emailId?: string;
  htmlContent?: string;
  subject?: string;
}

export interface SampleResponse {
  sample: EmailSample;
  htmlContent: string;
}

export interface SendResponse {
  message: string;
  sample: EmailSample;
  sent: boolean;
}
