# 🚀 OctoFlow – Startup Engineering Health Check

Optimizing startup developer workflow, efficiency, and scalability

## 🛠 About OctoFlow

OctoFlow is an interactive, self-assessment tool designed to help startups evaluate, optimize, and scale their development workflows.

- ✅ Measure your engineering health across key areas like collaboration, CI/CD, security, and AI adoption.
- ✅ Get tailored recommendations based on industry best practices & GitHub resources.
- ✅ Benchmark against other startups and track improvements over time.

Hosted on GitHub Pages for easy access & continuous updates.

## 🚀 Features

- Dynamic health check → Answer a few questions, get instant insights
- Real-time scoring & benchmarks → Compare against industry best practices
- Personalized recommendations → Next steps tailored to your startup stage & team size
- No tracking, no friction → Private, self-serve, and free to use

## 📌 Development Guidelines

### 🎯 Project Goals

- 🚀 Build a lightweight, GitHub Pages-hosted health check for startup engineering teams
- 🔄 Prioritize clarity, usability, and actionable insights for users
- 🎯 Make it scalable with future iterations based on real startup data

### ⚠️ Development Guardrails

- Stick to MVP scope – No unnecessary features or complexity
- No backend logic – React-only, fully static deployment on GitHub Pages
- Follow React best practices – Keep code modular, maintainable, and efficient
- Use GitHub Copilot responsibly – Avoid premature optimizations

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in development mode at [http://localhost:3000](http://localhost:3000).

### `npm test`

Launches the test runner in interactive watch mode.

### `npm run build`

Builds the app for production to the `build` folder.

### `npm run deploy`

Deploys the app to GitHub Pages. This will:
- Build the React app
- Push to the gh-pages branch
- Deploy to GitHub Pages

## 🔄 Next Steps

- ✅ Test deployment thoroughly – Ensure scoring & recommendations work as expected
- ✅ Push final adjustments to main branch
- ✅ Begin internal testing with startups & GitHub for Startups members
- ✅ Iterate based on feedback and prepare for public launch

## 🔗 Resources

- 📌 [GitHub Pages Documentation](https://docs.github.com/en/pages)
- 📌 [React Documentation](https://reactjs.org/)
- 📌 [GitHub Copilot Documentation](https://docs.github.com/en/copilot)

---

🚀 OctoFlow is just the beginning – let's scale engineering together! 🔥🐙

# OctoFlow Documentation

## User Flow
1. Landing Page (Hero)
2. Stage Selection
3. Assessment
4. Summary
5. Results

## Core Features
- Persistent state management using sessionStorage
- Error boundary implementation for graceful error handling
- Responsive radar chart visualization
- Automated test suite

## Known Issues
- [ ] Session storage limitations
- [ ] Mobile responsiveness improvements needed

## Future Improvements
- [ ] PDF export functionality
- [ ] Enhanced GitHub API integration
- [ ] Automated saving mechanism
- [ ] User analytics dashboard
- [ ] Custom scoring algorithms

## Development

### Installation
```bash
npm install
```

### Running Tests
```bash
npm test
```

### Starting Development Server
```bash
npm start
```

## Completion Survey

After completing the assessment flow (Hero → StageSelector → Assessment → Summary → Results), please help us improve by filling out our brief survey. Your feedback is valuable!

[Complete Survey](https://forms.gle/your-google-form-url) (opens in a new tab)

## Contributing
Please see CONTRIBUTING.md for guidelines.
