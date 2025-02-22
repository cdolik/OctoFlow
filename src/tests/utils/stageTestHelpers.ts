import { Stage, Question } from '../../types';

export const createMockStageState = (
  stage: Stage = 'pre-seed',
  responses: Record<string, number> = {}
) => ({
  stage,
  responses,
  metadata: {
    startTime: Date.now() - 1000,
    lastSaved: Date.now(),
    questionCount: Object.keys(responses).length
  }
});

export const generateStageResponses = (questions: Question[], score = 3): Record<string, number> => {
  return questions.reduce((acc, question) => ({
    ...acc,
    [question.id]: score
  }), {});
};

export const mockStageProgression = async (stage: Stage) => {
  sessionStorage.clear();
  const responses: Record<string, number> = {};
  const questionCount = 5;

  for (let i = 1; i <= questionCount; i++) {
    responses[`question-${stage}-${i}`] = Math.floor(Math.random() * 3) + 2; // Random score between 2-4
  }

  return createMockStageState(stage, responses);
};

export const validateStageCompletion = (
  responses: Record<string, number>,
  stage: Stage,
  questions: Question[]
): boolean => {
  const stageQuestions = questions.filter(q => q.stages.includes(stage));
  const answeredQuestions = Object.keys(responses).length;
  const validScores = Object.values(responses).every(score => score >= 1 && score <= 4);
  
  return answeredQuestions === stageQuestions.length && validScores;
};