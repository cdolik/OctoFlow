import React from 'react';
import { render, screen } from '@testing-library/react';
import { ProgressTracker } from './ProgressTracker';
import { useAudioFeedback } from './AudioFeedback';

jest.mock('./AudioFeedback');

describe('ProgressTracker', () => {
  const mockPlaySound = jest.fn();

  beforeEach(() => {
    (useAudioFeedback as jest.Mock).mockReturnValue({
      playSound: mockPlaySound
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('calculates and displays progress correctly', () => {
    render(
      <ProgressTracker
        stage="pre-seed"
        currentStep={5}
        totalSteps={20}
      />
    );

    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '25');
    expect(screen.getByText('25%')).toBeInTheDocument();
  });

  it('shows appropriate progress status messages', () => {
    const { rerender } = render(
      <ProgressTracker
        stage="pre-seed"
        currentStep={0}
        totalSteps={20}
      />
    );
    expect(screen.getByText('Not started')).toBeInTheDocument();

    rerender(
      <ProgressTracker
        stage="pre-seed"
        currentStep={4}
        totalSteps={20}
      />
    );
    expect(screen.getByText('Just beginning')).toBeInTheDocument();

    rerender(
      <ProgressTracker
        stage="pre-seed"
        currentStep={10}
        totalSteps={20}
      />
    );
    expect(screen.getByText('Making progress')).toBeInTheDocument();

    rerender(
      <ProgressTracker
        stage="pre-seed"
        currentStep={20}
        totalSteps={20}
      />
    );
    expect(screen.getByText('Complete')).toBeInTheDocument();
  });

  it('calculates and displays time estimates correctly', () => {
    render(
      <ProgressTracker
        stage="pre-seed"
        currentStep={5}
        totalSteps={20}
        estimatedTimePerStep={30}
      />
    );

    expect(screen.getByText('Estimated time remaining: 8 minutes')).toBeInTheDocument();
  });

  it('triggers milestone callbacks with sound', () => {
    const mockOnMilestone = jest.fn();

    const { rerender } = render(
      <ProgressTracker
        stage="pre-seed"
        currentStep={5}
        totalSteps={20}
        onMilestone={mockOnMilestone}
      />
    );

    // 25% milestone
    expect(mockOnMilestone).toHaveBeenCalledWith(25);
    expect(mockPlaySound).toHaveBeenCalledWith('complete');

    // 50% milestone
    rerender(
      <ProgressTracker
        stage="pre-seed"
        currentStep={10}
        totalSteps={20}
        onMilestone={mockOnMilestone}
      />
    );
    expect(mockOnMilestone).toHaveBeenCalledWith(50);

    // 75% milestone
    rerender(
      <ProgressTracker
        stage="pre-seed"
        currentStep={15}
        totalSteps={20}
        onMilestone={mockOnMilestone}
      />
    );
    expect(mockOnMilestone).toHaveBeenCalledWith(75);

    // 100% milestone
    rerender(
      <ProgressTracker
        stage="pre-seed"
        currentStep={20}
        totalSteps={20}
        onMilestone={mockOnMilestone}
      />
    );
    expect(mockOnMilestone).toHaveBeenCalledWith(100);

    expect(mockOnMilestone).toHaveBeenCalledTimes(4);
  });

  it('provides accessible progress information', () => {
    render(
      <ProgressTracker
        stage="pre-seed"
        currentStep={5}
        totalSteps={20}
        estimatedTimePerStep={30}
      />
    );

    const progressbar = screen.getByRole('progressbar');
    expect(progressbar).toHaveAttribute('aria-label', 'Assessment progress for pre-seed');
    expect(progressbar).toHaveAttribute('aria-valuemin', '0');
    expect(progressbar).toHaveAttribute('aria-valuemax', '100');
    expect(progressbar).toHaveAttribute('aria-valuenow', '25');

    expect(screen.getByText('Step 5 of 20')).toBeInTheDocument();
  });

  it('handles sub-minute time estimates', () => {
    render(
      <ProgressTracker
        stage="pre-seed"
        currentStep={18}
        totalSteps={20}
        estimatedTimePerStep={15}
      />
    );

    expect(screen.getByText('Estimated time remaining: 30 seconds')).toBeInTheDocument();
  });

  it('correctly pluralizes time estimates', () => {
    const { rerender } = render(
      <ProgressTracker
        stage="pre-seed"
        currentStep={19}
        totalSteps={20}
        estimatedTimePerStep={60}
      />
    );

    expect(screen.getByText('Estimated time remaining: 1 minute')).toBeInTheDocument();

    rerender(
      <ProgressTracker
        stage="pre-seed"
        currentStep={15}
        totalSteps={20}
        estimatedTimePerStep={60}
      />
    );

    expect(screen.getByText('Estimated time remaining: 5 minutes')).toBeInTheDocument();
  });

  it('updates live region with progress changes', () => {
    const { rerender } = render(
      <ProgressTracker
        stage="pre-seed"
        currentStep={5}
        totalSteps={20}
        estimatedTimePerStep={60}
      />
    );

    const initialAnnouncement = screen.getByText(/Just beginning. 25% complete/);
    expect(initialAnnouncement).toBeInTheDocument();

    rerender(
      <ProgressTracker
        stage="pre-seed"
        currentStep={10}
        totalSteps={20}
        estimatedTimePerStep={60}
      />
    );

    const updatedAnnouncement = screen.getByText(/Making progress. 50% complete/);
    expect(updatedAnnouncement).toBeInTheDocument();
  });
});