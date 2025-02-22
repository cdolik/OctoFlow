import React from 'react';
import { Stage } from '../types';
import LoadingSpinner from './LoadingSpinner';
import './styles.css';

interface StageTransitionProps {
  fromStage?: Stage;
  toStage: Stage;
  progress: number;
}

const StageTransition: React.FC<StageTransitionProps> = ({ fromStage, toStage, progress }) => {
  return (
    <div className="stage-transition">
      <div className="transition-content">
        <LoadingSpinner size="small" showProgress progress={progress} />
        <div className="transition-text">
          <p>
            {fromStage ? 
              `Moving from ${fromStage} to ${toStage}...` : 
              `Loading ${toStage} assessment...`}
          </p>
          <small className="transition-note">
            Your progress is automatically saved
          </small>
        </div>
      </div>
    </div>
  );
};

export default StageTransition;