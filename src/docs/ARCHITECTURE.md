# OctoFlow Architecture

## Core Concepts

### Stage-Based Assessment Flow
OctoFlow implements a strict stage progression model to ensure users complete assessments in a logical order:

```
pre-seed → seed → series-a → series-b
```

Each stage has:
- Stage-specific question filtering
- Category weightings
- Performance benchmarks
- Focused improvement areas

### Data Model

```typescript
Stage Flow:
Assessment State → Response Validation → Score Calculation → Recommendations
```

Key interfaces:
- `StageDefinition`: Core stage configuration
- `StorageState`: Persistent assessment data
- `ScoreResult`: Calculated assessment results

### Error Handling Strategy

1. **Hierarchical Boundaries**
   - `GlobalErrorBoundary`: Application-wide errors
   - `AssessmentErrorBoundary`: Stage-specific errors
   - Component-level error states

2. **Recovery Mechanisms**
   - Auto-save with periodic backups
   - State recovery from backup storage
   - Graceful degradation

### Stage Validation

The system enforces:
1. Sequential stage progression
2. Complete question responses
3. Valid score ranges (1-4)
4. Category-specific weightings

### Storage Management

- Primary storage in SessionStorage
- Periodic backups with configurable intervals
- Merge strategy for partial updates
- Recovery from backup on storage failure

### Performance Optimization

1. **Rendering**
   - Memoized calculations
   - Deferred loading
   - Error boundary isolation

2. **Data Management**
   - Efficient state updates
   - Batched storage operations
   - Progressive loading

## Implementation Details

### Core Components

1. **StageSelector**
   - Stage filtering
   - Progress visualization
   - Requirement validation

2. **Assessment**
   - Question rendering
   - Response validation
   - Auto-save integration

3. **Summary**
   - Response review
   - Stage completion checks
   - Navigation guards

4. **Results**
   - Score calculation
   - Benchmark comparison
   - Recommendation generation

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

### Data Flow

1. User selects stage
2. System loads stage-specific questions
3. Responses auto-save to storage
4. Validation ensures completion
5. Scores calculate on completion
6. Recommendations generate based on gaps

### Testing Strategy

1. **Unit Tests**
   - Individual utility functions
   - Hook behavior
   - Component rendering

2. **Integration Tests**
   - Complete user flows
   - Error recovery
   - Storage persistence

3. **Edge Cases**
   - Network failures
   - Storage quota limits
   - Invalid state transitions

## Future Considerations

### Planned Enhancements
- Persistent storage solution
- Enhanced analytics tracking
- Mobile responsiveness
- PDF export capability
- Team collaboration features

### Migration Path
1. Implement storage versioning
2. Add data migration utilities
3. Maintain backward compatibility
4. Progressive feature rollout
