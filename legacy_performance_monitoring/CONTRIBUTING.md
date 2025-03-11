# Contributing to OctoFlow

## Development Setup

1. Install dependencies:
```bash
npm install
```

2. Start development server:
```bash
npm start
```

3. Run tests:
```bash
npm test
```

## Project Structure

- `src/components/` - React components
- `src/data/` - Stage and question configurations
- `src/utils/` - Utility functions and helpers
- `src/hooks/` - Custom React hooks
- `src/types/` - TypeScript type definitions
- `src/tests/` - Test files

## Core Concepts

### Stage Progression
- Stages follow strict order: pre-seed → seed → series-a → series-b
- Each stage has specific question filtering and benchmarks
- Stage validation prevents skipping and ensures completion

### Data Flow
1. User selects stage in StageSelector
2. Assessment loads stage-specific questions
3. Responses auto-save to session storage
4. Summary shows stage completion status
5. Results display based on weighted scores

### Error Handling
- AssessmentErrorBoundary for assessment-specific errors
- GlobalErrorBoundary for application-wide errors
- Auto-recovery for non-critical errors
- Data persistence for recovery scenarios

## Testing Guidelines

1. Unit Tests
- Test each utility function
- Mock external dependencies
- Use @testing-library/react for hooks

2. Integration Tests
- Test complete user flows
- Verify error recovery
- Check data persistence

3. Component Tests
- Test component rendering
- Verify user interactions
- Check error states

## Best Practices

1. Type Safety
- Use TypeScript interfaces
- Avoid `any` types
- Define proper return types

2. Error Handling
- Use error boundaries
- Implement recovery mechanisms
- Log errors with context

3. State Management
- Use React hooks
- Implement proper validation
- Handle side effects

4. Performance
- Implement proper memoization
- Use proper data structures
- Handle cleanup in useEffect

## Pull Request Guidelines

1. Checklist
- [ ] Tests added/updated
- [ ] Types properly defined
- [ ] Error handling implemented
- [ ] Documentation updated

2. Review Process
- Code review required
- Tests must pass
- No type errors
- Documentation updated