import { Stage } from '../../types';

export interface MockAssessmentState {
  stage: Stage;
  responses: Record<string, number>;
  metadata?: {
    startTime: number;
    lastSaved: number;
    questionCount: number;
  };
}

export const createMockState = (
  stage: Stage = 'pre-seed',
  responses: Record<string, number> = {}
): MockAssessmentState => ({
  stage,
  responses,
  metadata: {
    startTime: Date.now() - 1000,
    lastSaved: Date.now(),
    questionCount: Object.keys(responses).length
  }
});

export const mockAssessmentFlow = async (stage: Stage) => {
  sessionStorage.clear();
  const responses: Record<string, number> = {};
  const questionCount = 5; // Simulated number of questions

  // Simulate answering questions
  for (let i = 1; i <= questionCount; i++) {
    responses[`question${i}`] = Math.floor(Math.random() * 4) + 1;
  }

  return createMockState(stage, responses);
};

export const simulateError = (component: string, message: string = 'Test error') => {
  const error = new Error(message);
  error.name = `${component}Error`;
  throw error;
};

export const waitForAutoSave = () => new Promise(resolve => setTimeout(resolve, 100));

export const mockKeyboardEvent = (key: string, ctrlKey: boolean = false) => {
  return new KeyboardEvent('keydown', {
    key,
    ctrlKey,
    bubbles: true
  });
};