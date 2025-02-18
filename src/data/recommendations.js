export const RECOMMENDATIONS = {
  CODEOWNERS: {
    title: 'Implement CODEOWNERS',
    steps: [
      '1. Create .github/CODEOWNERS file',
      '2. Define ownership per directory:',
      '   src/* @frontend-team',
      '3. Enable required reviews in branch protection'
    ],
    resource: 'https://docs.github.com/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-code-owners',
    impact: 'High',
    effort: 'Low',
    details: 'CODEOWNERS automatically assigns reviewers based on file paths, ensuring the right teams review relevant changes.'
  },
  BRANCH_PROTECTION: {
    title: 'Configure Branch Protection Rules',
    steps: [
      '1. Go to repository Settings > Branches',
      '2. Add rule for main/master branch',
      '3. Enable: Required reviews, Status checks, Force push block',
      '4. Save changes'
    ],
    resource: 'https://docs.github.com/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches',
    impact: 'High',
    effort: 'Medium',
    details: 'Prevents accidental force pushes and ensures quality through mandatory reviews and checks.'
  },
  ISSUE_TEMPLATES: {
    title: 'Set up Issue Templates',
    steps: [
      '1. Create .github/ISSUE_TEMPLATE directory',
      '2. Add bug_report.md and feature_request.md',
      '3. Define structured templates with clear sections',
      '4. Add config.yml for template chooser'
    ],
    resource: 'https://docs.github.com/communities/using-templates-to-encourage-useful-issues-and-pull-requests/configuring-issue-templates-for-your-repository',
    impact: 'Medium',
    effort: 'Low',
    details: 'Standardizes issue reporting and makes it easier to gather required information.'
  },
  DEPENDABOT: {
    title: 'Enable Dependabot Security Updates',
    steps: [
      '1. Create .github/dependabot.yml',
      '2. Configure package ecosystems to monitor',
      '3. Set update schedule and target branch',
      '4. Enable automatic security updates'
    ],
    resource: 'https://docs.github.com/code-security/dependabot/dependabot-security-updates/configuring-dependabot-security-updates',
    impact: 'High',
    effort: 'Low',
    details: 'Automatically creates pull requests to update vulnerable dependencies.'
  },
  SECRET_SCANNING: {
    title: 'Enable Secret Scanning',
    steps: [
      '1. Go to repository Settings > Security & analysis',
      '2. Enable secret scanning',
      '3. Configure push protection',
      '4. Set up custom patterns if needed'
    ],
    resource: 'https://docs.github.com/code-security/secret-scanning/protecting-pushes-with-secret-scanning',
    impact: 'High',
    effort: 'Low',
    details: 'Prevents accidental commit of secrets and credentials to your repository.'
  },
  CODE_SCANNING: {
    title: 'Set up CodeQL Analysis',
    steps: [
      '1. Create .github/workflows/codeql.yml',
      '2. Configure languages and schedule',
      '3. Enable automated scanning on PRs',
      '4. Set up result filtering and notifications'
    ],
    resource: 'https://docs.github.com/code-security/code-scanning/automatically-scanning-your-code-for-vulnerabilities-and-errors/configuring-code-scanning',
    impact: 'High',
    effort: 'Medium',
    details: 'Identifies potential security vulnerabilities and coding errors through static analysis.'
  },
  COPILOT: {
    title: 'Adopt GitHub Copilot',
    steps: [
      '1. Enable Copilot for organization',
      '2. Install IDE extensions',
      '3. Configure .copilot settings',
      '4. Train team on effective usage'
    ],
    resource: 'https://docs.github.com/copilot/using-github-copilot/getting-started-with-github-copilot',
    impact: 'High',
    effort: 'Medium',
    details: 'Increases developer productivity through AI-powered code suggestions and pair programming.'
  },
  ACTIONS_WORKFLOW: {
    title: 'Implement CI/CD with Actions',
    steps: [
      '1. Create .github/workflows directory',
      '2. Set up build and test workflow',
      '3. Configure deployment environments',
      '4. Add status checks to branches'
    ],
    resource: 'https://docs.github.com/actions/quickstart',
    impact: 'High',
    effort: 'Medium',
    details: 'Automates build, test, and deployment processes with GitHub Actions workflows.'
  }
};