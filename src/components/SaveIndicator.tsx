import React from 'react';
import { LiveRegion } from './LiveRegion';
import type { SaveIndicatorProps } from '../types/props';

export const SaveIndicator: React.FC<SaveIndicatorProps> = ({ 
  state, 
  lastSaved 
}) => {
  const getMessage = () => {
    switch (state) {
      case 'saving':
        return 'Saving changes...';
      case 'saved':
        if (lastSaved) {
          const timeString = lastSaved.toLocaleTimeString();
          return `All changes saved at ${timeString}`;
        }
        return 'All changes saved';
      case 'error':
        return 'Failed to save changes';
      default:
        return '';
    }
  };

  const getIcon = () => {
    switch (state) {
      case 'saving':
        return '⏳';
      case 'saved':
        return '✓';
      case 'error':
        return '⚠️';
      default:
        return null;
    }
  };

  const getClassName = () => {
    return `save-indicator ${state}`;
  };

  if (state === 'idle') return null;

  return (
    <div className={getClassName()} role="status">
      <LiveRegion aria-live={state === 'error' ? 'assertive' : 'polite'}>
        <span className="icon">{getIcon()}</span>
        <span className="message">{getMessage()}</span>
      </LiveRegion>
    </div>
  );
};