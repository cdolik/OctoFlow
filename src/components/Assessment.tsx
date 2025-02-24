import React, { useCallback, useMemo } from 'react';
import { Stage, KeyboardShortcut } from '../types';
import { useKeyboardNavigation } from '../hooks/useKeyboardNavigation';
import { useAssessmentSession } from '../hooks/useAssessmentSession';
import { AssessmentErrorBoundary } from './AssessmentErrorBoundary';
import { LoadingSpinner } from './LoadingSpinner';
import { AccessibleShortcutHelper } from './AccessibleShortcutHelper';
import { withMemo } from '../utils/withMemo';
import './styles.css';

interface AssessmentProps {
  stage: Stage;
  onStepChange?: (index: number) => void;
  onComplete?: () => void;
}

function AssessmentBase({ 
  stage, 
  onStepChange,
  onComplete 
}: AssessmentProps): JSX.Element {
  const {
    state,
    saveResponse,
    isLoading,
    error,
    completeSession,
    saveStatus
  } = useAssessmentSession();

  const handleNext = useCallback(async () => {
    if (!state) return;
    const nextIndex = state.progress.questionIndex + 1;
    if (nextIndex < state.progress.totalQuestions) {
      onStepChange?.(nextIndex);
    } else {
      const completed = await completeSession();
      if (completed) {
        onComplete?.();
      }
    }
  }, [state, completeSession, onStepChange, onComplete]);

  const handlePrevious = useCallback(() => {
    if (!state) return;
    const prevIndex = state.progress.questionIndex - 1;
    if (prevIndex >= 0) {
      onStepChange?.(prevIndex);
    }
  }, [state, onStepChange]);

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
      </div>

      {isEnabled && (
        <AccessibleShortcutHelper
          shortcuts={shortcuts}
          stage={stage}
          visible={true}
        />
      )}
    </div>
  );
}

// Memoize the component with custom comparison
const propsAreEqual = (prevProps: AssessmentProps, nextProps: AssessmentProps) => {
  return prevProps.stage === nextProps.stage;
};

export const Assessment = withMemo(AssessmentBase, propsAreEqual, 'Assessment');
export default Assessment;
