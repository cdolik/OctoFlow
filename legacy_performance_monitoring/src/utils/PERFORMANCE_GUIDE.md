# Performance Monitoring Guide

## Quick Start

1. **Track Component Performance**
```tsx
// Using HOC
import { withPerformanceTracking } from '../utils/performance';
const TrackedComponent = withPerformanceTracking(MyComponent, 'MyComponent');

// Using Hook
import { usePerformanceTracking } from '../utils/performance';
function MyComponent() {
  usePerformanceTracking('MyComponent');
  return <div>Content</div>;
}
```

2. **Configure Monitoring**
```tsx
import { PerformanceMonitor } from '../utils/performance';

PerformanceMonitor.getInstance({
  slowThreshold: 16,           // Mark components as slow if they exceed this render time
  sampleRate: 0.1,            // Only track 10% of renders for better performance
  enableMemoryTracking: true,  // Track memory usage
  enableInteractionTracking: true  // Track user interactions
});
```

## Interpreting Performance Logs

Performance logs follow this format:
```
[Performance] TIMESTAMP ComponentName[instanceId] - Operation: Duration
```

Example:
```
[Performance] 2024-03-20T10:30:45.123Z MyComponent[abc123] - RenderTime: 45.67ms
```

## Performance Thresholds

| Operation    | Threshold | Description                           |
|-------------|-----------|---------------------------------------|
| render      | 16ms      | Target frame time (60 fps)            |
| stateLoad   | 100ms     | Loading state from storage            |
| stateSave   | 50ms      | Saving state to storage               |
| calculation | 50ms      | Complex calculations/data processing   |

## Common Performance Issues

1. **Slow Renders (>16ms)**
   - Check for unnecessary re-renders
   - Consider memoization (useMemo, useCallback)
   - Split complex components

2. **High Memory Usage**
   - Look for memory leaks in useEffect cleanup
   - Check large data structures
   - Verify event listener cleanup

3. **Frequent Re-renders**
   - Review state management
   - Check prop changes
   - Consider using React.memo

## Debugging Tips

1. Use `getSlowComponents()` to identify problematic components:
```tsx
import { performance } from '../utils/performance';
console.table(performance.getSlowComponents());
```

2. Monitor specific operations:
```tsx
const startTime = window.performance.now();
// ... operation ...
const duration = window.performance.now() - startTime;
console.log(`Operation took: ${duration}ms`);
```

3. Check component metrics:
```tsx
const metrics = performance.getComponentMetrics();
console.table(metrics);
```

## Best Practices

1. Always use `window.performance.now()` for timing measurements
2. Clean up event listeners and observers
3. Use appropriate sampling rates in production
4. Monitor memory usage in long-lived components
5. Set meaningful component names for better debugging 