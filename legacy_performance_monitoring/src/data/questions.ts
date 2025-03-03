import { Stage, Question } from '../types';

export const questions: Question[] = [
  {
    id: 'q1',
    text: 'Do you frequently feel overwhelmed by work tasks?',
    stage: Stage.Assessment,
    category: 'workload'
  },
  {
    id: 'q2',
    text: 'Can you easily prioritize your tasks?',
    stage: Stage.Assessment,
    category: 'planning'
  },
  {
    id: 'q3',
    text: 'Do you have clear goals for your professional development?',
    stage: Stage.Assessment,
    category: 'career'
  },
  {
    id: 'q4',
    text: 'Do you feel recognized for your contributions at work?',
    stage: Stage.Assessment,
    category: 'satisfaction'
  },
  {
    id: 'q5',
    text: 'Do you have difficulty delegating tasks?',
    stage: Stage.Assessment,
    category: 'management'
  },
  {
    id: 'q6',
    text: 'Do you have a good work-life balance?',
    stage: Stage.Assessment,
    category: 'wellbeing'
  },
  {
    id: 'q7',
    text: 'Do you regularly receive constructive feedback?',
    stage: Stage.Assessment,
    category: 'growth'
  },
  {
    id: 'q8',
    text: 'Are you comfortable speaking up in team meetings?',
    stage: Stage.Assessment,
    category: 'communication'
  }
];

export function getQuestionsByStage(stage: Stage): Question[] {
  return questions.filter(q => q.stage === stage);
}

export function getQuestionById(id: string): Question | undefined {
  return questions.find(q => q.id === id);
}
