import React from 'react';

interface LoadingSkeletonProps {
  type: 'table' | 'card' | 'text' | 'chart' | 'form';
  count?: number;
  height?: string;
  width?: string;
  animated?: boolean;
}

const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({ 
  type, 
  count = 1, 
  height, 
  width, 
  animated = true 
}) => {
  const skeletonClass = `skeleton-${type} ${animated ? 'animated' : ''}`;
  
  const generateSkeletons = () => {
    const skeletons = [];
    for (let i = 0; i < count; i++) {
      switch (type) {
        case 'table':
          skeletons.push(
            <div key={i} className="skeleton-table-wrapper">
              <div className="skeleton-table-header" />
              <div className="skeleton-table-row" />
              <div className="skeleton-table-row" />
              <div className="skeleton-table-row" />
            </div>
          );
          break;
        case 'card':
          skeletons.push(
            <div 
              key={i} 
              className="skeleton-card" 
              style={{ height: height || '150px', width: width || '100%' }}
            >
              <div className="skeleton-card-header" />
              <div className="skeleton-card-content">
                <div className="skeleton-text-line" style={{ width: '90%' }} />
                <div className="skeleton-text-line" style={{ width: '70%' }} />
                <div className="skeleton-text-line" style={{ width: '80%' }} />
              </div>
            </div>
          );
          break;
        case 'chart':
          skeletons.push(
            <div 
              key={i} 
              className="skeleton-chart" 
              style={{ height: height || '200px', width: width || '100%' }}
            >
              <div className="skeleton-chart-center" />
              <div className="skeleton-chart-line" />
              <div className="skeleton-chart-line" style={{ transform: 'rotate(60deg)' }} />
              <div className="skeleton-chart-line" style={{ transform: 'rotate(120deg)' }} />
              <div className="skeleton-chart-line" style={{ transform: 'rotate(180deg)' }} />
              <div className="skeleton-chart-line" style={{ transform: 'rotate(240deg)' }} />
              <div className="skeleton-chart-line" style={{ transform: 'rotate(300deg)' }} />
            </div>
          );
          break;
        case 'form':
          skeletons.push(
            <div 
              key={i} 
              className="skeleton-form" 
              style={{ height: height || 'auto', width: width || '100%' }}
            >
              <div className="skeleton-form-group">
                <div className="skeleton-label" />
                <div className="skeleton-input" />
              </div>
              <div className="skeleton-form-group">
                <div className="skeleton-label" />
                <div className="skeleton-input" />
              </div>
              <div className="skeleton-form-group">
                <div className="skeleton-label" />
                <div className="skeleton-input" />
              </div>
              <div className="skeleton-button" />
            </div>
          );
          break;
        case 'text':
        default:
          skeletons.push(
            <div 
              key={i} 
              className="skeleton-text" 
              style={{ height: height || 'auto', width: width || '100%' }}
            >
              <div className="skeleton-text-line" style={{ width: '100%' }} />
              <div className="skeleton-text-line" style={{ width: '90%' }} />
              <div className="skeleton-text-line" style={{ width: '80%' }} />
              <div className="skeleton-text-line" style={{ width: '85%' }} />
            </div>
          );
      }
    }
    return skeletons;
  };

  return (
    <div className={skeletonClass}>
      {generateSkeletons()}
    </div>
  );
};

export default LoadingSkeleton; 