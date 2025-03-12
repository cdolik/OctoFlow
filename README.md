# OctoFlow: GitHub Health Analysis for Startups

![OctoFlow Banner](https://github.com/cdolik/OctoFlow/raw/main/public/logo192.png)

OctoFlow is a GitHub-native tool that helps startup engineering teams improve their GitHub practices and get investor-ready. It analyzes your pull requests and GitHub activity to provide actionable insights based on GitHub's Well-Architected Framework.

## 🚀 Features

- **GitHub Health Analysis**: Analyze your PR quality, code collaboration, and engineering velocity
- **Investor Readiness Score**: Get a clear measure of how your GitHub practices align with what investors look for
- **Startup-Focused Insights**: Receive recommendations tailored specifically for fast-moving startup teams

## 📋 How It Works

1. **Install GitHub Action**: Add the OctoFlow GitHub Action to your repository
2. **Automatic Analysis**: OctoFlow automatically analyzes your PRs and GitHub activity
3. **Get Actionable Insights**: Receive a GitHub Health Report with recommendations

## 🔧 Installation

### Option 1: Quick Install (Recommended)

1. Create a `.github/workflows` directory in your repository if it doesn't exist
2. Create a file named `octoflow.yml` in the `.github/workflows` directory
3. Copy and paste the following content:

```yaml
name: "OctoFlow: Startup GitHub Health Analysis"

on:
  pull_request:
    types: [opened, synchronize, reopened, ready_for_review]
  schedule:
    # Run daily at midnight UTC
    - cron: "0 0 * * *"
  # Allow manual triggering
  workflow_dispatch:

jobs:
  analyze:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v3
        with:
          fetch-depth: 0  # Fetch all history for accurate PR analysis
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: 18
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run Startup GitHub Health Analysis
        id: pr_analysis
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          REPO_OWNER: ${{ github.repository_owner }}
          REPO_NAME: ${{ github.event.repository.name }}
          PR_NUMBER: ${{ github.event.pull_request.number }}
          IS_PR_EVENT: ${{ github.event_name == 'pull_request' }}
        run: |
          ./run-analysis.sh
          # If this is a PR event, create a summary file for commenting
          if [ "$IS_PR_EVENT" = "true" ]; then
            node src/scripts/generatePRComment.js
            echo "::set-output name=summary_path::./data/pr-comment.md"
          fi
      
      - name: Comment on PR with Startup GitHub Health Insights
        if: github.event_name == 'pull_request' && steps.pr_analysis.outputs.summary_path
        uses: actions/github-script@v6
        with:
          github-token: ${{ secrets.GITHUB_TOKEN }}
          script: |
            const fs = require('fs');
            const prNumber = context.payload.pull_request.number;
            const summaryPath = '${{ steps.pr_analysis.outputs.summary_path }}';
            
            if (fs.existsSync(summaryPath)) {
              const summary = fs.readFileSync(summaryPath, 'utf8');
              await github.rest.issues.createComment({
                owner: context.repo.owner,
                repo: context.repo.repo,
                issue_number: prNumber,
                body: summary
              });
              console.log('Posted OctoFlow Startup GitHub Health analysis to PR #' + prNumber);
            } else {
              console.log('No summary file found at ' + summaryPath);
            }
      
      - name: Generate GitHub Health Report
        if: github.event_name != 'pull_request'
        run: |
          node src/scripts/generateHealthReport.js
      
      - name: Commit and push results
        if: github.event_name != 'pull_request'
        run: |
          git config --global user.name 'GitHub Action'
          git config --global user.email 'action@github.com'
          git add data/
          git commit -m "Update GitHub Health Report [skip ci]" || echo "No changes to commit"
          git push
```

4. Commit and push the file to your repository
5. The action will run automatically on new PRs and daily at midnight UTC

### Option 2: Manual Installation

1. Fork the [OctoFlow repository](https://github.com/cdolik/OctoFlow)
2. Customize the analysis rules in `src/analysis/ruleBased/analyzePR.js`
3. Deploy the action to your repositories

## 📊 GitHub Health Report

OctoFlow generates a comprehensive GitHub Health Report that includes:

- **Overall GitHub Health Score**: A measure of your GitHub practices
- **Investor Readiness Score**: How well your practices align with investor expectations
- **Category Scores**:
  - **GitHub Fundamentals**: Repo structure, PR templates, branch management
  - **Code Collaboration & Quality**: PR reviews, PR size, linked issues
  - **Engineering Velocity**: Time to review, time to merge, reversion rate
- **Recommendations**: Actionable insights to improve your GitHub practices
- **Strengths**: Areas where your team is already following best practices

## 🔒 Security & Privacy

OctoFlow runs entirely within your GitHub Actions environment and does not send your code or PR data to any external servers. All analysis is performed locally within the GitHub Actions runner.

We take security seriously and have implemented a comprehensive dependency resolution strategy to ensure all dependencies are using secure versions. For more details, see our [Security Policy](SECURITY.md).

## 📚 Resources

- [GitHub's Well-Architected Framework](https://wellarchitected.github.com/library/overview/)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📧 Contact

If you have any questions or feedback, please open an issue on the [GitHub repository](https://github.com/cdolik/OctoFlow/issues).

---

*OctoFlow is an unofficial GitHub application. Not affiliated with GitHub, Inc.*
