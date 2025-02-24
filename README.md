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
