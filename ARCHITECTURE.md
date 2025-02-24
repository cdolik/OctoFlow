# OctoFlow Architecture

## Overview
OctoFlow is a React application that helps engineering teams assess their GitHub workflow maturity level through a staged assessment process.

## Core Concepts

### Stages
- **Pre-seed**: Basic repository setup and workflow foundations
- **Seed**: Team collaboration and automation practices
- **Series-A**: Advanced integrations and security measures
- **Series-B**: Enterprise-level orchestration and compliance

### Data Flow
1. User selects development stage (StageSelector)
2. Stage-specific questions are filtered and presented (Assessment)
3. Responses are validated and auto-saved (useAssessmentSession)
4. Progress is tracked and persisted (useStorage)
5. Results are calculated using weighted scoring (scoring.ts)

### Key Components

#### Assessment Flow
```
Hero → StageSelector → Assessment → Summary → Results
```

#### Error Handling
- `GlobalErrorBoundary`: Application-wide error catching
- `AssessmentErrorBoundary`: Assessment-specific error handling
- `NetworkErrorBoundary`: Connection-related issues
- Error recovery through `SessionRecovery` component

### State Management
- Session storage for assessment data
- Context providers for:
  - Keyboard shortcuts
  - User preferences
  - Audio feedback
  - Assessment state

### Validation Layer
- Stage progression validation
- Response data validation
- Score calculation validation
- Session state validation

## Development Guidelines

### Testing Strategy
1. **Unit Tests**
   - Individual utility functions
   - React hooks
   - Component rendering

2. **Integration Tests**
   - Complete user flows
   - Error recovery scenarios
   - Data persistence
   - Stage transitions

3. **E2E Testing** (Future)
   - Cross-browser testing
   - Network conditions
   - Mobile responsiveness

### Code Organization
```
src/
├── components/     # React components
├── contexts/      # React contexts
├── data/          # Static data and configurations
├── hooks/         # Custom React hooks
├── types/         # TypeScript type definitions
├── utils/         # Utility functions
└── tests/         # Test files
```

### Build & Deploy
- GitHub Actions for CI/CD
- GitHub Pages for hosting
- Environment configurations

## Future Enhancements
1. Advanced Analytics
   - Team comparisons
   - Historical trends
   - Custom benchmarks

2. Enhanced Offline Support
   - Service Worker improvements
   - IndexedDB integration
   - Conflict resolution

3. Mobile Optimization
   - Responsive design improvements
   - Touch interactions
   - PWA features