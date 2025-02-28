import React, { useState, useEffect, useCallback } from 'react';
import { AssessmentProps, AssessmentError } from '../types/props';
import { Stage } from '../types';
import { useAssessment } from '../hooks/useAssessment';
import { useStorage } from '../hooks/useStorage';
import { ProgressTracker } from './ProgressTracker';
import { AutoSave } from './AutoSave';
import { StageTransition } from './StageTransition';

const AssessmentBase: React.FC<AssessmentProps> = ({ stage, onComplete, onError }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [responses, setResponses] = useState<Record<number, number>>({});

  useEffect(() => {
    // Fetch initial data or perform setup
  }, []);

  const handleResponse = async (questionId: number, value: number) => {
    try {
      // await saveResponse(questionId, value, timeSpent);
      setResponses((prevResponses) => ({ ...prevResponses, [questionId]: value }));
    } catch (error) {
      if (onError) onError(error as AssessmentError);
    }
  };

  const handleSave = async () => {
    // Implement save logic
    return true;
  };

  return (
    <div>
      <ProgressTracker currentStep={currentQuestionIndex + 1} totalSteps={10} stage={stage} />
      <AutoSave onSave={handleSave} />
      {/* Render questions and other components */}
    </div>
  );
};

interface AssessmentProps {
  stage: Stage;
  onStageComplete?: (score: number) => void;
}

export const Assessment: React.FC<AssessmentProps> = ({ stage, onStageComplete }) => {
  const { responses, saveResponse, completeStage, calculateScore } = useAssessment();
  const { state } = useStorage();

  const handleQuestionResponse = useCallback(async (questionId: string, value: number) => {
    await saveResponse(questionId, value);
  }, [saveResponse]);

  const handleStageComplete = useCallback(async () => {
    const success = await completeStage(stage);
    if (success) {
      const score = calculateScore(stage);
      onStageComplete?.(score);
    }
  }, [stage, completeStage, calculateScore, onStageComplete]);

  // Show stage transition if stage is completed
  if (state?.stages?.[stage]?.isComplete) {
    return (
      <StageTransition
        stage={stage}
        nextStage={null}
        onTransitionComplete={handleStageComplete}
      />
    );
  }

  return (
    <div className="assessment">
      <h2>Assessment for {stage}</h2>
      <div className="responses">
        {Object.entries(responses).map(([questionId, value]) => (
          <div key={questionId} className="response">
            Question {questionId}: {value}
          </div>
        ))}
      </div>
      <button onClick={handleStageComplete}>Complete Stage</button>
    </div>
  );
};

export default AssessmentBase;
