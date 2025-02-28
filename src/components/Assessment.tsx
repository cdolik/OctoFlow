import React, { useState, useEffect } from 'react';
import { AssessmentProps, AssessmentError } from '../types/props';
// import { saveResponse } from '../utils/api';
import { ProgressTracker } from './ProgressTracker';
import { AutoSave } from './AutoSave';
// import { withFlowValidation } from '../hoc/withFlowValidation';

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

// export const Assessment = withFlowValidation(AssessmentBase);

export default AssessmentBase;
