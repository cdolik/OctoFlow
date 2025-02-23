import React, { useCallback, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useKeyboardShortcuts } from '../contexts/KeyboardShortcutsContext';
import { Stage } from '../types';
import { trackCTAClick } from '../utils/analytics';
import './styles.css';

interface NavigationProps {
  currentStage: Stage;
  totalStages: number;
  onStageChange?: (stage: Stage) => void;
}

const Navigation: React.FC<NavigationProps> = ({
  currentStage,
  totalStages,
  onStageChange
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { registerShortcut } = useKeyboardShortcuts();
  const navRef = useRef<HTMLElement>(null);

  const stageIndex = ['pre-seed', 'seed', 'series-a', 'series-b'].indexOf(currentStage);

  const handleStageChange = useCallback((newStage: Stage) => {
    trackCTAClick('stage_navigation');
    onStageChange?.(newStage);
  }, [onStageChange]);

  const handleKeyboardNavigation = useCallback((direction: 'next' | 'prev') => {
    const stages = ['pre-seed', 'seed', 'series-a', 'series-b'];
    const currentIndex = stages.indexOf(currentStage);
    const newIndex = direction === 'next' ? currentIndex + 1 : currentIndex - 1;

    if (newIndex >= 0 && newIndex < stages.length) {
      handleStageChange(stages[newIndex] as Stage);
    }
  }, [currentStage, handleStageChange]);

  // Register keyboard shortcuts
  useEffect(() => {
    const shortcuts = [
      {
        key: '[',
        description: 'Previous stage',
        action: () => handleKeyboardNavigation('prev')
      },
      {
        key: ']',
        description: 'Next stage',
        action: () => handleKeyboardNavigation('next')
      }
    ];

    shortcuts.forEach(registerShortcut);
  }, [registerShortcut, handleKeyboardNavigation]);

  // Focus management
  useEffect(() => {
    if (navRef.current && location.state?.fromKeyboard) {
      navRef.current.focus();
    }
  }, [location]);

  return (
    <nav
      ref={navRef}
      className="stage-navigation"
      role="navigation"
      aria-label="Stage navigation"
      tabIndex={-1}
    >
      <div className="stage-navigation__progress" role="progressbar" 
           aria-valuenow={(stageIndex + 1)} 
           aria-valuemin={1} 
           aria-valuemax={totalStages}
           aria-label="Assessment progress">
        <div 
          className="stage-navigation__progress-bar"
          style={{ width: `${((stageIndex + 1) / totalStages) * 100}%` }}
        />
      </div>

      <div className="stage-navigation__controls" role="group" aria-label="Stage controls">
        <button
          onClick={() => handleKeyboardNavigation('prev')}
          disabled={stageIndex === 0}
          aria-label="Previous stage"
          className="stage-navigation__button"
        >
          <span aria-hidden="true">←</span>
          <span className="visually-hidden">Previous stage</span>
        </button>

        <div 
          className="stage-navigation__status"
          aria-live="polite"
        >
          Stage {stageIndex + 1} of {totalStages}
        </div>

        <button
          onClick={() => handleKeyboardNavigation('next')}
          disabled={stageIndex === totalStages - 1}
          aria-label="Next stage"
          className="stage-navigation__button"
        >
          <span aria-hidden="true">→</span>
          <span className="visually-hidden">Next stage</span>
        </button>
      </div>

      <div className="stage-navigation__shortcuts" aria-label="Keyboard shortcuts">
        <kbd>[</kbd> prev stage
        <kbd>]</kbd> next stage
      </div>
    </nav>
  );
};