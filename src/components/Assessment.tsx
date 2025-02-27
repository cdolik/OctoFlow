import React, { useCallback, useMemo, useState } from 'react';
import { Stage, KeyboardShortcut } from '../types';
import { useKeyboardNavigation } from '../hooks/useKeyboardNavigation';
import { useAssessmentSession } from '../hooks/useAssessmentSession';
import { AssessmentErrorBoundary } from './AssessmentErrorBoundary';
import { LoadingSpinner } from './LoadingSpinner';
import { AccessibleShortcutHelper } from './AccessibleShortcutHelper';
import { calculateStageScores } from '../utils/scoring';
import { stages } from '../data/stages';
import './styles.css';

interface AssessmentProps {
  stage: Stage;
  onStepChange?: (index: number) => void;
  onComplete?: () => void;
}

const AssessmentBase: React.FC<AssessmentProps> = ({ stage, onStepChange, onComplete }) => {
  const {
    state,
    saveResponse,
    isLoading,
    error,
    completeSession,
    saveStatus
  } = useAssessmentSession();

  const [showSummary, setShowSummary] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleNext = useCallback(async () => {
    if (!state) return;
    
    // Check if we're at the last question
    const nextIndex = state.progress.questionIndex + 1;
    if (nextIndex >= state.progress.totalQuestions) {
      // Calculate score before showing summary
      const stageConfig = stages.find(s => s.id === stage);
      const scores = calculateStageScores(stage, state.responses);
      
      // Check if score meets threshold
      if (stageConfig && scores.overallScore < (stageConfig.scoringCriteria?.threshold || 0)) {
        setValidationError(`Your score is below the required threshold to proceed. You need at least ${stageConfig.scoringCriteria?.threshold} points.`);
        return;
      }
      
      setShowSummary(true);
      return;
    }

    // Regular next question flow
    try {
      await onStepChange({
        ...state,
        progress: {
          ...state.progress,
          questionIndex: nextIndex
        }
      });
      setValidationError(null);
    } catch (error) {
      setValidationError(error instanceof Error ? error.message : 'Error advancing to next question');
    }
  }, [state, onStepChange, stage]);

  const handlePrevious = useCallback(() => {
    if (!state) return;
    const prevIndex = state.progress.questionIndex - 1;
    if (prevIndex >= 0) {
      onStepChange?.(prevIndex);
    }
  }, [state, onStepChange]);

  const handleSummary = useCallback(() => {
    if (!state) return;
    const totalScore = state.responses.reduce((acc, response) => acc + response.score, 0);
    if (totalScore < 40) {
      setValidationError('Your score is below the required threshold to proceed.');
    } else {
      setShowSummary(true);
    }
  }, [state]);

  const shortcuts: KeyboardShortcut[] = useMemo(() => [
    {
      key: '1',
      description: 'Score: Low',
      action: () => state && saveResponse(state.progress.questionIndex, 1, 0)
    },
    {
      key: '2',
      description: 'Score: Medium-Low',
      action: () => state && saveResponse(state.progress.questionIndex, 2, 0)
    },
    {
      key: '3',
      description: 'Score: Medium-High',
      action: () => state && saveResponse(state.progress.questionIndex, 3, 0)
    },
    {
      key: '4',
      description: 'Score: High',
      action: () => state && saveResponse(state.progress.questionIndex, 4, 0)
    },
    {
      key: '→',
      description: 'Next question',
      action: handleNext
    },
    {
      key: '←',
      description: 'Previous question',
      action: handlePrevious
    }
  ], [state, saveResponse, handleNext, handlePrevious]);

  const { isEnabled } = useKeyboardNavigation({ 
    shortcuts,
    stage,
    onNext: handleNext,
    onPrevious: handlePrevious
  });

  if (isLoading) {
    return (
      <LoadingSpinner 
        size="large"
        message="Loading assessment..."
        showProgress={true}
      />
    );
  }

  if (error) {
    return (
      <AssessmentErrorBoundary>
        <div role="alert" className="error-message">
          {error.message}
        </div>
      </AssessmentErrorBoundary>
    );
  }

  if (!state) {
    return <div>No assessment state available</div>;
  }

  const progress = (state.progress.questionIndex / state.progress.totalQuestions) * 100;

  return (
    <div className="assessment">
      <div className="assessment-header">
        <h2>Assessment for {stage}</h2>
        <div className="progress-indicator" role="progressbar" 
             aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}>
          {Math.round(progress)}% Complete
        </div>
      </div>

      <div className="assessment-content">
        {/* Assessment questions would be rendered here */}
      </div>

      <div className="assessment-footer">
        <button
          onClick={handlePrevious}
          disabled={state.progress.questionIndex === 0}
          className="nav-button prev"
        >
          Previous
        </button>
        <div className="save-status" role="status">
          {saveStatus.status === 'saving' && 'Saving...'}
          {saveStatus.status === 'saved' && 'Changes saved'}
          {saveStatus.status === 'error' && 'Save failed'}
        </div>
        <button
          onClick={handleNext}
          className="nav-button next"
        >
          {state.progress.questionIndex === state.progress.totalQuestions - 1 
            ? 'Complete' 
            : 'Next'}
        </button>
        <button
          onClick={handleSummary}
          className="nav-button summary"
        >
          Summary
        </button>
      </div>

      {validationError && (
        <div className="error-message" role="alert">
          {validationError}
        </div>
      )}

      {showSummary && (
        <div className="summary-screen">
          {/* Summary screen content would be rendered here */}
        </div>
      )}

      {isEnabled && (
        <AccessibleShortcutHelper
          shortcuts={shortcuts}
          stage={stage}
          visible={true}
        />
      )}
    </div>
  );
};

// Memoize the component with custom comparison
const propsAreEqual = (prevProps: AssessmentProps, nextProps: AssessmentProps) => {
  return prevProps.stage === nextProps.stage;
};

export const Assessment = withMemo(AssessmentBase, propsAreEqual, 'Assessment');
export default Assessment;
