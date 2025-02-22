import React from 'react';
import { render, screen, act, fireEvent, waitFor } from '@testing-library/react';
import AutoSave from '../components/AutoSave';
import type { Responses } from 'octoflow';
import { saveAssessmentResponses } from '../utils/storage';

// Mock storage utility
jest.mock('../utils/storage', () => ({
  saveAssessmentResponses: jest.fn()
}));

describe('AutoSave', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.clearAllMocks();
    (saveAssessmentResponses as jest.Mock).mockImplementation(() => true);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  const mockData: Responses = {
    'question-1': 1,
    'question-2': 2
  };

  const defaultProps = {
    data: mockData,
    onSave: jest.fn(),
    interval: 5000,
    onError: jest.fn()
  };

  it('should auto-save data at specified intervals', async () => {
    const mockSave = jest.fn().mockResolvedValue(undefined);
    
    render(
      <AutoSave
        data={mockData}
        onSave={mockSave}
        interval={5000}
        onError={jest.fn()}
      />
    );

    expect(mockSave).not.toHaveBeenCalled();
    
    await act(async () => {
      jest.advanceTimersByTime(5000);
    });

    expect(mockSave).toHaveBeenCalledWith(mockData);
  });

  it('should save immediately when data changes', async () => {
    const mockSave = jest.fn().mockResolvedValue(undefined);
    
    const { rerender } = render(
      <AutoSave
        data={mockData}
        onSave={mockSave}
        interval={5000}
        onError={jest.fn()}
      />
    );

    const newData: Responses = { 'question-1': 3, 'question-2': 4 };
    rerender(
      <AutoSave
        data={newData}
        onSave={mockSave}
        interval={5000}
        onError={jest.fn()}
      />
    );

    await act(async () => {
      jest.advanceTimersByTime(5000);
    });

    expect(mockSave).toHaveBeenCalledWith(newData);
  });

  it('should handle save errors', async () => {
    const mockError = new Error('Save failed');
    const mockSave = jest.fn().mockRejectedValue(mockError);
    const mockOnError = jest.fn();
    
    render(
      <AutoSave
        data={mockData}
        onSave={mockSave}
        interval={5000}
        onError={mockOnError}
      />
    );

    await act(async () => {
      jest.advanceTimersByTime(5000);
    });

    expect(mockOnError).toHaveBeenCalledWith(mockError);
  });

  it('should cleanup timer on unmount', () => {
    const mockSave = jest.fn();
    const { unmount } = render(
      <AutoSave
        data={mockData}
        onSave={mockSave}
        interval={5000}
        onError={jest.fn()}
      />
    );

    unmount();

    act(() => {
      jest.advanceTimersByTime(5000);
    });

    expect(mockSave).not.toHaveBeenCalled();
  });

  it('should not save if data is unchanged', () => {
    const { rerender } = render(<AutoSave {...defaultProps} />);
    
    rerender(<AutoSave {...defaultProps} data={mockData} />);
    
    expect(defaultProps.onSave).not.toHaveBeenCalled();
  });

  it('should debounce rapid data changes', async () => {
    const mockSave = jest.fn().mockResolvedValue(undefined);
    const { rerender } = render(
      <AutoSave
        data={{ 'question-1': 1, 'question-2': 2 }}
        onSave={mockSave}
        interval={5000}
        onError={jest.fn()}
      />
    );

    for (let i = 3; i <= 6; i++) {
      rerender(
        <AutoSave
          data={{ 'question-1': i, 'question-2': i }}
          onSave={mockSave}
          interval={5000}
          onError={jest.fn()}
        />
      );
    }

    await act(async () => {
      jest.advanceTimersByTime(5000);
    });

    expect(mockSave).toHaveBeenCalledTimes(1);
    expect(mockSave).toHaveBeenCalledWith({ 'question-1': 6, 'question-2': 6 });
  });

  it('should save data when the save button is clicked', async () => {
    const mockSave = jest.fn().mockResolvedValue(undefined);
    
    render(
      <AutoSave
        data={mockData}
        onSave={mockSave}
        interval={5000}
        onError={jest.fn()}
      />
    );

    const saveButton = screen.getByText('Save Now');
    fireEvent.click(saveButton);

    expect(mockSave).toHaveBeenCalledWith(mockData);
  });

  it('should display a save status message', async () => {
    const mockSave = jest.fn().mockResolvedValue(undefined);
    
    render(
      <AutoSave
        data={mockData}
        onSave={mockSave}
        interval={5000}
        onError={jest.fn()}
      />
    );

    const saveButton = screen.getByText('Save Now');
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(screen.getByText('Save successful')).toBeInTheDocument();
    });
  });

  it('should handle save errors and display an error message', async () => {
    const mockError = new Error('Save failed');
    const mockSave = jest.fn().mockRejectedValue(mockError);
    const mockOnError = jest.fn();
    
    render(
      <AutoSave
        data={mockData}
        onSave={mockSave}
        interval={5000}
        onError={mockOnError}
      />
    );

    const saveButton = screen.getByText('Save Now');
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(screen.getByText('Save failed')).toBeInTheDocument();
    });
  });

  it('auto-saves data at specified intervals', async () => {
    render(
      <AutoSave
        data={mockData}
        onSave={defaultProps.onSave}
        interval={1000}
        onError={defaultProps.onError}
      />
    );

    // Fast-forward through three save intervals
    for (let i = 0; i < 3; i++) {
      act(() => {
        jest.advanceTimersByTime(1000);
      });

      await waitFor(() => {
        expect(saveAssessmentResponses).toHaveBeenCalledWith(mockData);
        expect(defaultProps.onSave).toHaveBeenCalled();
      });
    }
  });

  it('handles save failures gracefully', async () => {
    (saveAssessmentResponses as jest.Mock).mockImplementation(() => {
      throw new Error('Save failed');
    });

    render(
      <AutoSave
        data={mockData}
        onSave={defaultProps.onSave}
        interval={1000}
        onError={defaultProps.onError}
      />
    );

    act(() => {
      jest.advanceTimersByTime(1000);
    });

    await waitFor(() => {
      expect(defaultProps.onError).toHaveBeenCalledWith(expect.any(Error));
      expect(defaultProps.onSave).not.toHaveBeenCalled();
    });
  });

  it('updates timer when interval changes', async () => {
    const { rerender } = render(
      <AutoSave
        data={mockData}
        onSave={defaultProps.onSave}
        interval={1000}
        onError={defaultProps.onError}
      />
    );

    act(() => {
      jest.advanceTimersByTime(1000);
    });

    await waitFor(() => {
      expect(saveAssessmentResponses).toHaveBeenCalledTimes(1);
    });

    rerender(
      <AutoSave
        data={mockData}
        onSave={defaultProps.onSave}
        interval={2000}
        onError={defaultProps.onError}
      />
    );

    act(() => {
      jest.advanceTimersByTime(1000);
    });

    expect(saveAssessmentResponses).toHaveBeenCalledTimes(1);

    act(() => {
      jest.advanceTimersByTime(1000);
    });

    await waitFor(() => {
      expect(saveAssessmentResponses).toHaveBeenCalledTimes(2);
    });
  });

  it('saves immediately when data changes significantly', async () => {
    const { rerender } = render(
      <AutoSave
        data={mockData}
        onSave={defaultProps.onSave}
        interval={5000}
        onError={defaultProps.onError}
      />
    );

    const newData = { ...mockData, question3: 2 };
    rerender(
      <AutoSave
        data={newData}
        onSave={defaultProps.onSave}
        interval={5000}
        onError={defaultProps.onError}
      />
    );

    await waitFor(() => {
      expect(saveAssessmentResponses).toHaveBeenCalledWith(newData);
    });
  });

  it('cleans up timer on unmount', () => {
    const { unmount } = render(
      <AutoSave
        data={mockData}
        onSave={defaultProps.onSave}
        interval={1000}
        onError={defaultProps.onError}
      />
    );

    unmount();

    act(() => {
      jest.advanceTimersByTime(1000);
    });

    expect(saveAssessmentResponses).not.toHaveBeenCalled();
  });
});
