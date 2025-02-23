import React, { useCallback, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useKeyboardShortcuts } from '../contexts/KeyboardShortcutsContext';
import { useAssessmentSession } from '../hooks/useAssessmentSession';
import { Stage } from '../types';
import { trackCTAClick } from '../utils/analytics';
import KeyboardShortcutHelper from './KeyboardShortcutHelper';
import SaveIndicator from './SaveIndicator';
import './styles.css';

const Assessment: React.FC = () => {
  const { stage } = useParams<{ stage: Stage }>();
  const navigate = useNavigate();
  const { registerShortcut } = useKeyboardShortcuts();
  const {
    state,
    saveStatus,
    saveResponse,
    completeSession,
    isLoading
  } = useAssessmentSession({
    initialStage: stage
  });

  const handleNextQuestion = useCallback(() => {
    if (!state) return;
    const nextIndex = state.progress.questionIndex + 1;
    if (nextIndex < state.progress.totalQuestions) {
      trackCTAClick('next_question');
      // Update progress logic here
    }
  }, [state]);

  const handlePreviousQuestion = useCallback(() => {
    if (!state) return;
    const prevIndex = state.progress.questionIndex - 1;
    if (prevIndex >= 0) {
      trackCTAClick('previous_question');
      // Update progress logic here
    }
  }, [state]);

  const handleComplete = useCallback(async () => {
    if (!state) return;
    const success = await completeSession();
    if (success) {
      navigate(`/summary/${stage}`);
    }
  }, [state, stage, completeSession, navigate]);

  // Register keyboard shortcuts
  useEffect(() => {
    const shortcuts = [
      {
        key: 'ArrowRight',
        description: 'Next question',
        action: handleNextQuestion
      },
      {
        key: 'ArrowLeft',
        description: 'Previous question',
        action: handlePreviousQuestion
      },
      {
        key: '1',
        description: 'Select score 1',
        action: () => saveResponse(state?.progress.questionIndex || 0, 1, 0)
      },
      {
        key: '2',
        description: 'Select score 2',
        action: () => saveResponse(state?.progress.questionIndex || 0, 2, 0)
      },
      {
        key: '3',
        description: 'Select score 3',
        action: () => saveResponse(state?.progress.questionIndex || 0, 3, 0)
      },
      {
        key: '4',
        description: 'Select score 4',
        action: () => saveResponse(state?.progress.questionIndex || 0, 4, 0)
      },
      {
        key: 'Enter',
        description: 'Complete assessment',
        action: handleComplete
      }
    ];

    shortcuts.forEach(registerShortcut);
  }, [
    registerShortcut,
    handleNextQuestion,
    handlePreviousQuestion,
    handleComplete,
    saveResponse,
    state
  ]);

  if (isLoading) {
    return <div className="loading">Loading assessment...</div>;
  }

  if (!state) {
    return <div className="error">Assessment not found</div>;
  }

  return (
    <div className="assessment">
      <SaveIndicator status={saveStatus} />
      <KeyboardShortcutHelper 
        shortcuts={[
          {
            key: '→',
            description: 'Next question'
          },
          {
            key: '←',
            description: 'Previous question'
          },
          {
            key: '1-4',
            description: 'Select score'
          },
          {
            key: 'Enter',
            description: 'Complete assessment'
          }
        ]} 
      />
      {/* Rest of assessment UI */}
    </div>
  );
};

export default Assessment;
