import { Stage, Question } from '../types';

export const validateQuestionFilter = (question: Question, stage: Stage): boolean => {
  // Base validation - check if question is tagged for this stage
  if (!question.stages.includes(stage)) return false;

  // Stage-specific validation rules
  switch (stage) {
    case 'pre-seed':
      // Pre-seed questions should focus on essentials
      return !question.category.includes('ai-adoption') && 
             question.weight <= 2;

    case 'seed':
      // Seed stage can include more advanced topics
      return question.weight <= 3;

    case 'series-a':
      // Series A can include all questions
      return true;

    default:
      return false;
  }
};

export const getStageQuestions = (questions: Question[], stage: Stage): Question[] => {
  return questions.filter(q => validateQuestionFilter(q, stage));
};

export const validateStageProgress = (
  responses: Record<string, number>,
  questions: Question[],
  stage: Stage
): boolean => {
  const stageQuestions = getStageQuestions(questions, stage);
  const requiredQuestions = stageQuestions.filter(q => !q.optional);
  
  return requiredQuestions.every(q => 
    responses[q.id] !== undefined && 
    responses[q.id] >= 1 && 
    responses[q.id] <= 4
  );
};