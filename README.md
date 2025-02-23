# 🚀 OctoFlow – Startup Engineering Health Check

An interactive assessment tool to evaluate and optimize GitHub engineering workflows.

## 🛠 Core Features (MVP)

- Stage-based assessment flow with strict validation
- Auto-save with error recovery
- Weighted scoring system with benchmarks
- Stage-specific recommendations

## 🏗 Technical Foundation

### Stage Progression
- Pre-seed → Seed → Series A → Series B
- Each stage has specific:
  - Question filtering
  - Category weights
  - Performance benchmarks

### Type Safety
```typescript
type Stage = 'pre-seed' | 'seed' | 'series-a' | 'series-b';

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

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm start

# Run tests
npm test

# Build for production
npm run build
```

## 🧪 Testing Strategy

### Unit Tests
```bash
# Run specific test suites
npm test userFlow
npm test stageValidation
npm test scoring
```

### Test Coverage
```bash
# Generate coverage report
npm test -- --coverage
```

### Key Test Areas
1. Stage progression validation
2. Response persistence
3. Score calculation
4. Error recovery
5. Auto-save functionality

## 🔍 Development Guidelines

### Code Organization
```
src/
  ├── components/   # React components
  ├── data/        # Stage and question definitions
  ├── hooks/       # Custom React hooks
  ├── types/       # TypeScript definitions
  └── utils/       # Utility functions
```

### Best Practices
1. Use TypeScript for type safety
2. Write tests for new features
3. Follow error boundary pattern
4. Maintain auto-save functionality
5. Document significant changes

## 🎯 MVP Scope

### Included Features
- ✅ Stage-based assessment
- ✅ Auto-save functionality
- ✅ Error recovery
- ✅ Keyboard navigation
- ✅ Question filtering
- ✅ Basic analytics

### Deferred Features
- 📋 PDF Export
- 💾 IndexedDB storage
- 📱 Mobile optimization
- 👥 Team collaboration
- 🔄 GitHub integration

## 🐛 Error Handling

### Recovery Strategy
1. Component-level boundaries
2. Storage backups
3. State restoration
4. Graceful degradation

### Error Reporting
Errors are tracked with context for debugging.

## 📈 Performance

### Optimization Focus
- Efficient state updates
- Memoized calculations
- Progressive loading
- Error isolation

## 🤝 Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for:
- Development setup
- Testing guidelines
- PR process
- Architecture overview
