import { Category } from '../types';
import { questions } from './questions';

const categories: Category[] = [
  {
    id: 'github-ecosystem',
    title: 'GitHub Enterprise Adoption & Collaboration',
    description: 'Core GitHub features and collaboration practices',
    weight: 1.0,
    questions: questions.filter(q => q.category === 'github-ecosystem')
  },
  {
    id: 'workflow',
    title: 'Development Workflow',
    description: 'Branch strategy and code review practices',
    weight: 0.8,
    questions: questions.filter(q => q.category === 'workflow')
  },
  {
    id: 'automation',
    title: 'CI/CD & Automation',
    description: 'Continuous integration and deployment practices',
    weight: 0.9,
    questions: questions.filter(q => q.category === 'automation')
  },
  {
    id: 'security',
    title: 'Security & Compliance',
    description: 'Security features and best practices',
    weight: 1.0,
    questions: questions.filter(q => q.category === 'security')
  },
  {
    id: 'release',
    title: 'Release Management',
    description: 'Release process and deployment practices',
    weight: 0.7,
    questions: questions.filter(q => q.category === 'release')
  },
  {
    id: 'governance',
    title: 'Repository Governance',
    description: 'Repository settings and access control',
    weight: 0.6,
    questions: questions.filter(q => q.category === 'governance')
  },
  {
    id: 'optimization',
    title: 'Performance & Optimization',
    description: 'Repository and workflow optimization',
    weight: 0.8,
    questions: questions.filter(q => q.category === 'optimization')
  }
];