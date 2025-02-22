# OctoFlow Architecture

## Core Concepts

### Stage Progression
The application follows a strict stage progression model:
- Stages: pre-seed → seed → series-a
- Each stage has its own benchmarks and question filtering
- Stage transitions must be sequential (no skipping)

### Data Structure
```typescript
Stage = 'pre-seed' | 'seed' | 'series-a'

StageDefinition = {
  id: Stage
  label: string
  description: string
  focus: string[]
  benchmarks: {
    deploymentFreq: string
    securityLevel: number
    costEfficiency: number
    expectedScores: Record<string, number>
  }
  questionFilter: (q: Question) => boolean
}

Question = {
  id: string
  text: string
  category: string
  weight: number
  stages: Stage[]
  options: Array<{ value: number, text: string }>
}
```

### Flow Validation
1. Stage Progression Validation
   - Prevents skipping stages
   - Validates stage completion before progression
   - Handles error recovery

2. Response Validation
   - Validates score ranges (1-4)
   - Ensures all required questions are answered
   - Prevents invalid question IDs

### Error Handling & Recovery
- AssessmentErrorBoundary
  - Handles stage-specific errors
  - Preserves responses during errors
  - Provides recovery mechanisms

- Storage Persistence
  - Auto-saves responses per stage
  - Validates data before storage
  - Provides recovery points

### Testing Strategy
1. Unit Tests
   - Stage validation functions
   - Question filtering
   - Score calculations

2. Integration Tests
   - Complete flow validation
   - Error recovery scenarios
   - State persistence

3. Component Tests
   - Stage transitions
   - Response handling
   - Error boundaries

## Data Flow
1. Stage Selection
   ```
   Hero → StageSelector → Assessment
   ```

2. Assessment Flow
   ```
   Assessment → Summary → Results
   ```

3. Error Recovery
   ```
   Error → AssessmentErrorBoundary → Last Valid State
   ```

## Best Practices
1. Stage Transitions
   - Always validate before transition
   - Preserve responses during transitions
   - Handle errors gracefully

2. Response Handling
   - Validate before saving
   - Auto-save after each response
   - Provide recovery mechanisms

3. Error Management
   - Use appropriate error boundaries
   - Track errors with context
   - Provide clear recovery paths