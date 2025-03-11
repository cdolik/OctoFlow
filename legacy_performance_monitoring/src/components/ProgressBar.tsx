import React from 'react';

interface ProgressBarProps {
  progress: number;
  label?: string;
  showText?: boolean;
  customText?: string;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ 
  progress, 
  label = 'Progress', 
  showText = true,
  customText
}) => {
  // Ensure progress is between 0 and 100
  const normalizedProgress = Math.min(100, Math.max(0, progress));
  
  return (
    <div
      className="progress-bar-container mb-8"
      role="progressbar"
      aria-label={label}
      aria-valuenow={normalizedProgress}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuetext={`${normalizedProgress}% complete`}
    >
      <div 
        className="progress-bar h-2 bg-gray-200 rounded"
        role="presentation"
      >
        <div
          className="progress-fill h-full bg-blue-600 rounded"
          style={{ width: `${normalizedProgress}%` }}
          role="presentation"
        />
      </div>
      {showText && (
        <div 
          className="text-right mt-2 text-sm text-gray-600" 
          aria-live="polite"
        >
          {customText || `${normalizedProgress}% complete`}
        </div>
      )}
    </div>
  );
};

export default ProgressBar; 