import { Recommendation } from '../types';

export const RECOMMENDATIONS: Recommendation[] = [
  {
    id: 'improve-branch-strategy',
    text: 'Consider adopting a more structured branching strategy like GitFlow to improve collaboration and code quality.'
  },
  {
    id: 'enhance-pr-reviews',
    text: 'Implement a formal pull request review process with multiple reviewers to ensure code quality and knowledge sharing.'
  },
  {
    id: 'automate-ci',
    text: 'Enhance your CI practices by automating builds, tests, and deployments to improve efficiency and reduce errors.'
  }
];