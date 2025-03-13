# OctoFlow: GitHub Well-Architected Framework

OctoFlow is a GitHub-native intelligence and learning platform that empowers startups with AI-driven insights and actionable recommendations to achieve GitHub mastery. It evaluates repositories against the GitHub Well-Architected Framework and provides personalized guidance to improve repository health.

![OctoFlow Logo](docs/images/octoflow-logo.png)

## 🌟 Features

- **GitHub Health Assessment**: Evaluate repositories against the GitHub Well-Architected Framework
- **AI-Powered Recommendations**: Get personalized, actionable recommendations to improve repository health
- **GitHub Actions Integration**: Automate the implementation of recommendations with GitHub Actions
- **Visualization Dashboard**: View repository health metrics and trends in a user-friendly dashboard
- **Repository Comparison**: Compare the health of multiple repositories
- **Embeddable Badges**: Showcase your repository health with embeddable badges

## 🏗️ Architecture

OctoFlow follows a modular architecture with clear separation of concerns:

### Core Services

- **GitHub Data Service**: Fetches and processes data from the GitHub API
- **Assessment Service**: Evaluates repositories against the GitHub Well-Architected Framework
- **Recommendation Engine**: Generates AI-powered recommendations
- **GitHub Actions Service**: Integrates with GitHub Actions to automate recommendations
- **Visualization Service**: Generates charts and visualizations for repository health

### API Layer

- RESTful API endpoints for all OctoFlow functionality
- Express.js server with proper error handling and security measures

### Frontend (Coming Soon)

- React-based dashboard for visualizing repository health
- Interactive UI for implementing recommendations
- Repository comparison tools

## 🚀 Getting Started

### Prerequisites

- Node.js 16+
- npm or yarn
- GitHub API token with appropriate permissions

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/octoflow/octoflow.git
   cd octoflow
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file with your GitHub API token:
   ```
   GITHUB_TOKEN=your_github_token
   PORT=3000
   NODE_ENV=development
   ```

4. Build the project:
   ```bash
   npm run build
   ```

5. Start the server:
   ```bash
   npm start
   ```

The server will be running at http://localhost:3000.

## 📊 API Usage

### Assess a Repository

```bash
curl -X GET "http://localhost:3000/api/health/assess/owner/repo"
```

### Get Enhanced Assessment with AI Recommendations

```bash
curl -X GET "http://localhost:3000/api/health/enhanced/owner/repo"
```

### Get Visualization Data

```bash
curl -X GET "http://localhost:3000/api/health/visualization/owner/repo"
```

### Get Health Badges

```bash
curl -X GET "http://localhost:3000/api/health/badges/owner/repo"
```

### Implement a Recommendation

```bash
curl -X POST "http://localhost:3000/api/health/implement" \
  -H "Content-Type: application/json" \
  -d '{"owner":"owner", "repo":"repo", "recommendationId":"security-branch-protection"}'
```

### Compare Repositories

```bash
curl -X GET "http://localhost:3000/api/health/compare/owner1/repo1/owner2/repo2"
```

## 📋 GitHub Well-Architected Framework

OctoFlow evaluates repositories against the following pillars of the GitHub Well-Architected Framework:

### 1. Security

- Branch protection rules
- Code scanning and secret scanning
- Dependency management
- Security policies

### 2. Reliability

- CI/CD setup
- Test coverage
- Workflow success rate
- Error handling

### 3. Maintainability

- Documentation quality
- Code organization
- Contribution guidelines
- Code owners

### 4. Collaboration

- Pull request templates
- Issue templates
- Review processes
- Team communication

### 5. Velocity

- Time to merge
- Pull request size
- Release frequency
- Development efficiency

## 🛠️ Development

### Project Structure

```
octoflow/
├── src/
│   ├── api/              # API endpoints
│   ├── controllers/      # Business logic controllers
│   ├── services/         # Core services
│   ├── utils/            # Utility functions
│   └── server.ts         # Main server file
├── client/               # Frontend React application (coming soon)
├── docs/                 # Documentation
├── tests/                # Test files
└── README.md             # This file
```

### Running in Development Mode

```bash
npm run dev
```

This will start the server with nodemon for automatic reloading.

### Running Tests

```bash
npm test
```

### Building for Production

```bash
npm run build
npm start
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📞 Contact

For questions or support, please open an issue or contact the maintainers:

- GitHub: [@octoflow](https://github.com/octoflow)
- Email: support@octoflow.dev

---

Built with ❤️ by the OctoFlow team
