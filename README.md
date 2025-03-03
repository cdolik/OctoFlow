# OctoFlow

A stage-specific self-assessment tool for startup engineering teams to evaluate GitHub practices and workflows.

## Overview

OctoFlow helps startup engineering teams assess their GitHub practices across different stages of company growth. By answering a series of questions, teams receive tailored recommendations linked directly to official GitHub documentation.

## Features

- **Stage-Specific Assessment**: Choose from Seed/Earlier, Series A, or Series B+ startup stages
- **Comprehensive Evaluation**: Assessment covers Security, Collaboration, Automation, Compliance, Testing, and Documentation
- **Actionable Recommendations**: Get prioritized improvement suggestions with direct links to GitHub documentation
- **Progress Persistence**: Assessment progress automatically saved using sessionStorage
- **Visual Results**: View your results in an intuitive radar chart visualization 
- **Client-Side Only**: No backend required - all data stays in your browser

## Quick Start

### Installation

```bash
# Clone the repository
git clone https://github.com/coreydolik/OctoFlow.git

# Navigate to the project directory
cd OctoFlow

# Install dependencies
npm install
```

### Development

```bash
# Start the development server
npm start
```

The application will be available at http://localhost:3000

### Deployment

```bash
# Build and deploy to GitHub Pages
npm run deploy
```

## Assessment Process

1. **Select Your Startup Stage**: Choose from Seed/Earlier, Series A, or Series B+
2. **Answer Questions**: Evaluate your current practices on a scale of 1-4
3. **Review Results**: Get a visual representation of your strengths and areas for improvement
4. **Implement Recommendations**: Follow direct links to GitHub documentation to enhance your workflows

## Project Structure

- `src/components/`: UI components (StageSelector, AssessmentFlow, ResultsDashboard)
- `src/data/`: Question bank and scoring logic
- `src/App.tsx`: Main application component and state management
- `public/`: Static assets

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- GitHub for providing excellent documentation and tools for developers
- Create React App for the project bootstrapping
