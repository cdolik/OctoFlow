import { AssessmentError, ErrorContext, ErrorSeverity } from '../types/errors';

interface SanitizedError {
  message: string;
  type: string;
  severity: ErrorSeverity;
  recoverable: boolean;
  context?: Partial<ErrorContext>;
}

const SENSITIVE_PATTERNS = [
  /api[_-]?key/i,
  /auth[_-]?token/i,
  /password/i,
  /secret/i,
  /credential/i,
  /private[_-]?key/i,
  /session[_-]?id/i
];

const ERROR_MESSAGE_REPLACEMENTS = new Map([
  [/network.*fail/i, 'Unable to connect to the server'],
  [/timeout/i, 'The request took too long to complete'],
  [/unauthorized|forbidden|invalid.*token/i, 'Access denied'],
  [/not.*found/i, 'The requested resource was not found'],
  [/validation.*fail/i, 'The provided data was invalid'],
  [/database|sql|mongo/i, 'A data storage error occurred']
]);

export function sanitizeError(error: Error): SanitizedError {
  const isAssessmentError = error instanceof AssessmentError;
  let message = error.message;
  let context = isAssessmentError ? error.context : undefined;

  // Remove sensitive information from error message
  SENSITIVE_PATTERNS.forEach(pattern => {
    message = message.replace(new RegExp(`${pattern.source}[^\\s]*`, 'gi'), '[REDACTED]');
  });

  // Replace technical messages with user-friendly ones
  ERROR_MESSAGE_REPLACEMENTS.forEach((replacement, pattern) => {
    if (pattern.test(message)) {
      message = replacement;
    }
  });

  // Sanitize context if it exists
  if (context) {
    context = {
      ...context,
      component: context.component,
      message: context.message,
      timestamp: context.timestamp
    };
  }

  return {
    message,
    type: error.constructor.name,
    severity: isAssessmentError ? error.severity : 'high',
    recoverable: isAssessmentError ? error.recoverable : true,
    context
  };
}

export function sanitizeStackTrace(stack: string | undefined): string {
  if (!stack) return '';
  
  return stack
    .split('\n')
    .filter(line => !SENSITIVE_PATTERNS.some(pattern => pattern.test(line)))
    .map(line => {
      ERROR_MESSAGE_REPLACEMENTS.forEach((replacement, pattern) => {
        if (pattern.test(line)) {
          line = line.replace(pattern, replacement);
        }
      });
      return line;
    })
    .join('\n');
}

export function createSafeErrorMessage(error: Error): string {
  const sanitized = sanitizeError(error);
  return `${sanitized.message} (${sanitized.type})`;
}

export function shouldExposeErrorDetails(error: Error): boolean {
  if (error instanceof AssessmentError) {
    return error.severity !== 'high' && error.recoverable;
  }
  return process.env.NODE_ENV !== 'production';
}