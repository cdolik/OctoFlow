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

## Live Demo

Visit the live application at: https://cdolik.github.io/OctoFlow/

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

## Feedback and Testing

We're actively collecting feedback on the OctoFlow assessment tool. If you've used the tool, please consider sharing your experience:

[📝 Submit Feedback](https://github.com/coreydolik/OctoFlow/issues/new?template=feedback.md)

You can also report bugs or request new features:
- [🐞 Report a Bug](https://github.com/coreydolik/OctoFlow/issues/new?template=bug_report.md)
- [💡 Request a Feature](https://github.com/coreydolik/OctoFlow/issues/new?template=feature_request.md)

Your input is invaluable as we continue to improve the tool for engineering teams at all startup stages.

## Assessment Process

1. **Select Your Startup Stage**: Choose from Seed/Earlier, Series A, or Series B+
2. **Answer Questions**: Evaluate your current practices on a scale of 1-4
3. **Review Results**: Get a visual representation of your strengths and areas for improvement
4. **Implement Recommendations**: Follow direct links to GitHub documentation to enhance your workflows

## Project Structure

```
src/
├── components/           # React components
│   ├── AssessmentFlow/  # Assessment wizard and logic
│   ├── RadarChart/      # Results visualization
│   └── FeedbackForm/    # User feedback collection
├── data/                # Questions and scoring logic
└── utils/               # Helper functions and utilities
```

## Recent Updates

- **MVP Release**: Focused on core assessment functionality and GitHub practices evaluation
- **Improved UI**: Enhanced user experience with radar chart visualization
- **GitHub Pages**: Deployed and accessible at https://cdolik.github.io/OctoFlow/
- **Legacy Code**: Previous performance monitoring features archived in `archive/performance-monitoring` branch

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
- All contributors and users providing valuable feedback
