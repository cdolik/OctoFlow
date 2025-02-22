import { Stage, StageValidationResult } from '../types';
import { stages } from '../data/stages';
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

export const validateStageProgression = (
  currentStage: Stage | null, 
  targetStage: Stage
): StageValidationResult => {
  // Allow starting at any stage if no current stage
  if (!currentStage) {
    return { isValid: true };
  }

  const stageOrder = stages.map(s => s.id);
  const currentIdx = stageOrder.indexOf(currentStage);
  const targetIdx = stageOrder.indexOf(targetStage);
  
  if (currentIdx === -1 || targetIdx === -1) {
    return {
      isValid: false,
      error: 'Invalid stage identifier'
    };
  }

  // Allow:
  // 1. Moving to the next stage
  // 2. Moving to any previous stage
  // 3. Staying in current stage
  if (
    targetIdx === currentIdx + 1 || // Next stage
    targetIdx <= currentIdx || // Previous stage or current stage
    currentIdx === -1 // First stage selection
  ) {
    return { isValid: true };
  }

  return {
    isValid: false,
    error: 'Cannot skip stages forward'
  };
};

export const getNextStage = (currentStage: Stage): Stage | null => {
  const stageOrder = stages.map(s => s.id);
  const currentIdx = stageOrder.indexOf(currentStage);
  
  if (currentIdx === -1 || currentIdx === stageOrder.length - 1) {
    return null;
  }
  
  return stageOrder[currentIdx + 1];
};

export const getPreviousStage = (currentStage: Stage): Stage | null => {
  const stageOrder = stages.map(s => s.id);
  const currentIdx = stageOrder.indexOf(currentStage);
  
  if (currentIdx <= 0) {
    return null;
  }
  
  return stageOrder[currentIdx - 1];
};