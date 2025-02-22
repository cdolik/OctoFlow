import { Stage } from '../types';
import { getAssessmentResponses, getAssessmentMetadata } from './storage';

export const getResumePoint = (): {
  stage: Stage | null;
  questionIndex: number;
  completed: boolean;
} => {
  const responses = getAssessmentResponses();
  const metadata = getAssessmentMetadata();
  
  if (!metadata?.stage || !responses) {
    return { stage: null, questionIndex: 0, completed: false };
  }

  const answeredQuestions = Object.keys(responses).length;
  const totalQuestions = metadata.questionCount || 0;
  
  return {
    stage: metadata.stage as Stage,
    questionIndex: answeredQuestions,
    completed: answeredQuestions === totalQuestions
  };
};

export const validateStageProgression = (currentStage: Stage, targetStage: Stage): boolean => {
  const stageOrder = ['pre-seed', 'seed', 'series-a'];
  const currentIdx = stageOrder.indexOf(currentStage);
  const targetIdx = stageOrder.indexOf(targetStage);
  
  // Allow moving to adjacent stage or any previous stage
  return targetIdx <= currentIdx + 1;
};