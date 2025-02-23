# OctoFlow Architecture

## Core Architecture

### Application Flow
```
Hero → StageSelector → Assessment → Summary → Results
```

Each transition is protected by:
1. Stage validation (preventing skips)
2. Response validation (ensuring completion)
3. Error boundaries (handling failures)

### State Management
```typescript
interface ApplicationState {
  currentStage: Stage | null;
  responses: Record<string, number>;
  progress: {
    questionIndex: number;
    totalQuestions: number;
    isComplete: boolean;
  };
}
```

### Stage Progression
The application enforces a strict stage progression model:
- Stages: pre-seed → seed → series-a → series-b
- Each stage has specific question filtering and benchmarks
- Forward progression requires completion of current stage
- Backward navigation is always allowed
- Auto-save occurs on:
  - Question answers
  - Stage transitions
  - Before navigation

### Error Recovery System
1. Session Recovery
   - Automatic state restoration on load
   - Backup storage for error recovery
   - Progress preservation across sessions

2. Error Boundaries
   - AssessmentErrorBoundary for assessment-specific errors
   - GlobalErrorBoundary for application-wide errors
   - Automatic retry with exponential backoff

3. Data Persistence
   - Primary storage in sessionStorage
   - Backup in localStorage
   - Periodic state snapshots

### Technical Decisions

1. Stage Management
   - Centralized stage definitions in stages.ts
   - Stage-specific question filtering
   - Dynamic benchmarking based on stage
   - Strict validation rules

2. Error Handling
   - Hierarchical error boundaries
   - Graceful degradation
   - Detailed error tracking
   - Recovery mechanisms for common failures

3. State Persistence
   - Auto-save with debouncing
   - Background backup creation
   - Version-aware state migration
   - Conflict resolution

4. Performance Considerations
   - Lazy loading of stage content
   - Optimized re-renders
   - Memory leak prevention
   - Error tracking rate limiting

### Testing Strategy

1. Unit Tests
   - Hook behavior verification
   - Utility function coverage
   - State management validation

2. Integration Tests
   - Complete flow verification
   - Error recovery scenarios
   - State persistence checks
   - Navigation patterns

3. End-to-End Testing
   - User journey simulation
   - Error boundary verification
   - Performance monitoring
   - Cross-browser compatibility

## Key Components

1. StageSelector
   - Stage filtering and selection
   - Progress visualization
   - Stage requirements display

2. Assessment
   - Question rendering and validation
   - Progress tracking
   - Auto-save integration

3. Summary
   - Response review
   - Stage completion validation
   - Navigation guards

4. Results
   - Score calculation and display
   - Benchmark comparisons
   - Recommendation generation

### Error Boundaries
- GlobalErrorBoundary
  - Handles application-wide errors
  - Provides reset functionality
  - Logs errors with context
- AssessmentErrorBoundary
  - Handles stage-specific errors
  - Preserves assessment state
  - Enables partial recovery

### Stage Management
```typescript
interface StageDefinition {
  id: Stage;
  label: string;
  description: string;
  focus: string[];
  benchmarks: {
    deploymentFreq: string;
    securityLevel: number;
    costEfficiency: number;
    expectedScores: Record<string, number>;
  };
  questionFilter: (q: Question) => boolean;
}
```

### Question Filtering
- Stage-specific filtering
- Category-based filtering
- Weight-based prioritization

## Testing Strategy

### Unit Testing
- Utility functions
- Hook behaviors
- Pure functions

### Integration Testing
- Complete user flows
- Error scenarios
- Data persistence

### Component Testing
- Rendering logic
- User interactions
- Error states

## Error Handling Strategy

### Error Types
1. Validation Errors
   - Stage progression
   - Response validation
   - Question filtering
2. Storage Errors
   - Session storage
   - Data persistence
   - State recovery
3. Runtime Errors
   - Component failures
   - Async operations
   - Data transformations

### Recovery Strategy
1. Auto-Recovery
   - Session restoration
   - Progress preservation
   - State rollback
2. Manual Recovery
   - User-initiated retry
   - Stage restart
   - Complete reset

## Performance Considerations

### Data Structure Optimization
- Normalized state shape
- Efficient lookups
- Minimal re-renders

### Resource Management
- Question filtering
- Response validation
- Error boundary cleanup

### State Persistence
- Session storage
- Error logging
- Progress tracking

## Deployment Strategy

### GitHub Pages
- Automated deployment
- Build validation
- Route handling

### Branch Management
- Protected main branch
- Automated testing
- Version tagging

## Future Improvements

### Post-MVP Features
1. Enhanced Storage
   - IndexedDB implementation
   - Offline support
   - Data migration
2. Analytics
   - User journey tracking
   - Error reporting
   - Performance monitoring
3. Mobile Support
   - Responsive design
   - Touch interactions
   - Progressive loading
