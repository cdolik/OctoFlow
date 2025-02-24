import { AssessmentError } from '../types/errors';

const SENSITIVE_PATTERNS = [
  /token[=:]\s*[\w-]+/gi,
  /key[=:]\s*[\w-]+/gi,
  /password[=:]\s*[\w-]+/gi,
  /secret[=:]\s*[\w-]+/gi,
  /auth[=:]\s*[\w-]+/gi
];

const ERROR_MESSAGE_MAX_LENGTH = 150;

export function sanitizeErrorMessage(message: string): string {
  let sanitized = message;

  // Remove sensitive data
  SENSITIVE_PATTERNS.forEach(pattern => {
    sanitized = sanitized.replace(pattern, '[REDACTED]');
  });

  // Truncate long messages
  if (sanitized.length > ERROR_MESSAGE_MAX_LENGTH) {
    sanitized = sanitized.substring(0, ERROR_MESSAGE_MAX_LENGTH) + '...';
  }

  // Remove any HTML/script tags
  sanitized = sanitized.replace(/<[^>]*>/g, '');

  // Remove file paths
  sanitized = sanitized.replace(/(?:\/[\w.-]+){2,}/g, '[PATH]');

  return sanitized;
}

export function sanitizeError(error: Error | AssessmentError): Error {
  const sanitized = new Error(sanitizeErrorMessage(error.message));
  
  // Preserve assessment error properties if present
  if ('severity' in error) {
    Object.assign(sanitized, {
      severity: (error as AssessmentError).severity,
      recoverable: (error as AssessmentError).recoverable,
      context: sanitizeErrorContext((error as AssessmentError).context)
    });
  }

  // Sanitize stack trace
  if (error.stack) {
    sanitized.stack = error.stack
      .split('\n')
      .map(line => sanitizeErrorMessage(line))
      .join('\n');
  }

  return sanitized;
}

export function sanitizeErrorContext(
  context?: Record<string, unknown>
): Record<string, unknown> | undefined {
  if (!context) return undefined;

  const sanitized: Record<string, unknown> = {};
  
  for (const [key, value] of Object.entries(context)) {
    if (typeof value === 'string') {
      sanitized[key] = sanitizeErrorMessage(value);
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeErrorContext(value as Record<string, unknown>);
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
}