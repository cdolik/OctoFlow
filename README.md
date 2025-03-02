# OctoFlow

A React-based assessment platform focused on accessibility and reliable state management.

## Features

- 🔄 Automatic state persistence with retry mechanisms
- ⌨️ Full keyboard navigation support
- 🔊 Screen reader optimizations and audio feedback
- 📱 Responsive design with mobile-first approach
- 🎨 Customizable themes and accessibility options
- ⚡ Performance optimized with code splitting
- 🔍 Comprehensive error tracking and recovery

## Getting Started

### Prerequisites

- Node.js >= 18
- npm >= 7

### Installation

```bash
git clone https://github.com/yourusername/OctoFlow.git
cd OctoFlow
npm install
```

### Development

```bash
npm start
```

### Testing

```bash
# Run all tests
npm test

# Run tests with coverage
npm test -- --coverage

# Run specific tests
npm test -- ComponentName
```

### Building

```bash
npm run build
```

## Architecture

### Core Systems

- **State Management**: IndexedDB-based persistence with LocalStorage fallback
- **Accessibility**: ARIA live regions, keyboard navigation, audio feedback
- **Error Handling**: Comprehensive error boundaries and recovery mechanisms
- **Performance**: Code splitting, memoization, and performance monitoring

### Key Components

- `withAutoSave`: Automatic state persistence HOC
- `withFlowValidation`: Stage progression validation HOC
- `NavigationGuard`: Prevents accidental navigation loss
- `ErrorBoundary`: Graceful error handling and recovery
- `AccessibilityProvider`: Screen reader and keyboard navigation support

## Deployment

The application is automatically deployed to GitHub Pages using GitHub Actions. The deployment process includes:

1. Running tests and generating coverage reports
2. Building the application with production optimizations
3. Deploying to GitHub Pages
4. Verifying deployment success

### MVP Deployment Process

The project includes specialized scripts for different deployment scenarios. Here's when to use each:

#### `npm run verify-mvp`
- **When to use**: Before any deployment to verify critical functionality
- **What it does**: Runs core tests for storage and recommendations
- **Required for**: All deployments unless explicitly approved to skip
- **Best practice**: Run this before any PR merge

#### `npm run deploy-mvp`
- **When to use**: For normal MVP deployments
- **What it does**: Runs critical tests, builds, and deploys
- **Required for**: Standard deployment process
- **Best practice**: This should be your default deployment script

#### `npm run deploy-mvp-skip-tests`
- **When to use**: EMERGENCY SITUATIONS ONLY
- **What it does**: Bypasses all tests for immediate deployment
- **Warning**: Use only when:
  1. Critical hotfix needed immediately
  2. Tests are temporarily broken but fix is verified manually
  3. Explicit approval from tech lead obtained
- **Follow-up required**: Create a ticket to fix skipped tests

#### Test Coverage Strategy

The test strategy during MVP phase is deliberately focused on critical paths:

1. **Currently Skipped Tests**
   - Performance metrics tests (utils/performance.core.test.js)
     - _Reason_: Timing-sensitive tests need environment stability
     - _TODO_: Re-enable post-MVP with proper test environment
     - _Ticket_: OCTO-123 - Stabilize performance test suite

2. **Test Priority Levels**
   - P0 (Always Run):
     - Data persistence
     - Core recommendation engine
     - Critical user workflows
   - P1 (Run in verify-mvp):
     - State management
     - Error handling
   - P2 (Temporarily Simplified):
     - UI component tests
     - Edge case scenarios

3. **Post-MVP Test Plan**
   - Re-enable all skipped tests by [DATE]
   - Implement full E2E test suite
   - Add performance benchmark tests
   - Expand edge case coverage

**Note**: The simplified test strategy is temporary for rapid MVP iteration. All skipped or simplified tests are tracked in our issue system and will be addressed post-MVP phase.

## Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

### Development Guidelines

1. Write tests for all new features
2. Ensure accessibility compliance
3. Optimize performance for large datasets
4. Follow TypeScript best practices
5. Document all public APIs

## Performance Optimization

- Route-based code splitting
- Component lazy loading
- Memoization of expensive calculations
- Efficient state updates
- Asset optimization

## Accessibility Features

- ARIA live regions for dynamic content
- Keyboard navigation patterns
- Screen reader optimizations
- Audio feedback system
- High contrast mode
- Motion reduction options

## Error Handling

1. Automatic retry with exponential backoff
2. State recovery mechanisms
3. Comprehensive error reporting
4. User-friendly error messages
5. Development mode detailed errors

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- React Team for the core framework
- Testing Library for the excellent testing utilities
- The open source community for various incorporated libraries
