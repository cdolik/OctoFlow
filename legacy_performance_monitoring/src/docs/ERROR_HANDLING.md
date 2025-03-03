# Error Handling & Storage Architecture

## Overview

The application uses a centralized error handling system with TypeScript types defined in `errors.d.ts`. The system provides consistent error tracking, recovery mechanisms, and storage state management.

## Error Types

All errors extend from `BaseError`:
```typescript
interface BaseError extends Error {
  severity: 'low' | 'medium' | 'high' | 'critical';
  recoverable: boolean;
  name: string;
}
```

Specialized error types:
- `StorageError`: For IndexedDB and storage operations
- `NavigationError`: For route/stage transition issues
- `StateError`: For state management issues
- `ValidationError`: For data validation failures

## Error Context

All error tracking uses a standardized context:
```typescript
interface ErrorContext {
  component: string;   // Source component/module
  action: string;      // Action being performed
  message: string;     // Error description
  timestamp: string;   // ISO timestamp
  metadata?: Record<string, unknown>;
}
```

## Storage System

### State Types

```typescript
interface StorageState {
  version: string;
  currentStage: Stage | null;
  responses: Record<string, number>;
  metadata: {
    lastSaved: string;
    timeSpent: number;
    attemptCount: number;
    // ... other metadata
  };
  progress: {
    questionIndex: number;
    totalQuestions: number;
    isComplete: boolean;
  };
}
```

`AssessmentState` extends `StorageState` with additional assessment-specific fields.

### Usage Example

```typescript
import { useStorage } from '../hooks/useStorage';
import { createErrorContext } from '../utils/errorHandling';

function MyComponent() {
  const { state, saveState, error } = useStorage();
  
  const handleSave = async (data) => {
    try {
      await saveState(data);
    } catch (error) {
      trackError(error, createErrorContext(
        'MyComponent',
        'handleSave',
        'Failed to save state'
      ));
    }
  };
}
```

## Error Recovery

The system supports automatic retry mechanisms through `handleError`:

```typescript
const result = await handleError(error, context, {
  maxRetries: 3,
  retryDelay: 1000,
  recoveryFn: async () => { /* recovery logic */ }
});
```

## Best Practices

1. Always use `createErrorContext` for consistent error tracking
2. Implement recovery functions for recoverable errors
3. Use appropriate error severity levels
4. Include relevant metadata in error contexts
5. Validate storage state with `validateStorageState`

## Testing

Unit tests cover:
- Error class instantiation
- Error context creation
- Storage operations
- Recovery mechanisms
- State validation

Run tests with: `npm test`