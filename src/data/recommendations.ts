import { Stage, Recommendation } from '../types';

export const RECOMMENDATIONS: Record<Stage, Recommendation[]> = {
  'pre-seed': [
    {
      title: 'Set up branch protection rules',
      description: 'Enable basic branch protection for your main branch to prevent direct pushes.',
      priority: 'high',
      effort: 'low',
      category: 'security',
      links: [
        {
          text: 'About protected branches',
          url: 'https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/defining-the-mergeability-of-pull-requests/about-protected-branches'
        }
      ]
    },
    {
      title: 'Implement basic CI workflow',
      description: 'Set up a simple GitHub Actions workflow for continuous integration.',
      priority: 'high',
      effort: 'medium',
      category: 'automation',
      links: [
        {
          text: 'Quickstart for GitHub Actions',
          url: 'https://docs.github.com/en/actions/quickstart'
        }
      ]
    }
  ],
  'seed': [
    {
      title: 'Configure CODEOWNERS',
      description: 'Define code ownership to automatically request reviews from the right team members.',
      priority: 'medium',
      effort: 'low',
      category: 'workflow',
      links: [
        {
          text: 'About code owners',
          url: 'https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-code-owners'
        }
      ]
    },
    {
      title: 'Enable Dependabot',
      description: 'Automate dependency updates and security alerts.',
      priority: 'high',
      effort: 'low',
      category: 'security',
      links: [
        {
          text: 'Configuring Dependabot security updates',
          url: 'https://docs.github.com/en/code-security/dependabot/dependabot-security-updates/configuring-dependabot-security-updates'
        }
      ]
    }
  ],
  'series-a': [
    {
      title: 'Implement advanced CI/CD',
      description: 'Set up comprehensive CI/CD pipelines with staging environments.',
      priority: 'high',
      effort: 'high',
      category: 'automation',
      links: [
        {
          text: 'Using environments for deployment',
          url: 'https://docs.github.com/en/actions/deployment/targeting-different-environments/using-environments-for-deployment'
        }
      ]
    },
    {
      title: 'Configure security scanning',
      description: 'Enable code scanning with CodeQL and secret scanning.',
      priority: 'high',
      effort: 'medium',
      category: 'security',
      links: [
        {
          text: 'About code scanning',
          url: 'https://docs.github.com/en/code-security/code-scanning/automatically-scanning-your-code-for-vulnerabilities-and-errors/about-code-scanning'
        }
      ]
    }
  ],
  'series-b': [
    {
      title: 'Implement compliance controls',
      description: 'Set up audit logging and compliance reporting.',
      priority: 'high',
      effort: 'high',
      category: 'governance',
      links: [
        {
          text: 'About audit logging',
          url: 'https://docs.github.com/en/organizations/keeping-your-organization-secure/managing-security-settings-for-your-organization/reviewing-the-audit-log-for-your-organization'
        }
      ]
    },
    {
      title: 'Advanced workflow optimization',
      description: 'Implement custom GitHub Apps and advanced automation.',
      priority: 'medium',
      effort: 'high',
      category: 'optimization',
      links: [
        {
          text: 'About GitHub Apps',
          url: 'https://docs.github.com/en/developers/apps/getting-started-with-apps/about-apps'
        }
      ]
    }
  ]
};