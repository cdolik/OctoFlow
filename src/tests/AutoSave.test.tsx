import React from 'react';
import { render, act } from '@testing-library/react';
import AutoSave from '../components/AutoSave';

// Mock storage utility
jest.mock('../utils/storage', () => ({
  saveAssessmentResponses: jest.fn()
}));

describe('AutoSave', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  const mockData = {
    responses: { 'question-1': 3 },
    timestamp: Date.now()
  };

  const defaultProps = {
    data: mockData,
    onSave: jest.fn(),
    interval: 5000,
    onError: jest.fn()
  };

  it('should auto-save data at specified intervals', async () => {
    const mockSave = jest.fn().mockResolvedValue(undefined);
    const mockData = { test: 'data' };
    
    render(
      <AutoSave
        data={mockData}
        onSave={mockSave}
        interval={5000}
        onError={jest.fn()}
      />
    );

    expect(mockSave).not.toHaveBeenCalled();

    // Advance timers by the interval
    await act(async () => {
      jest.advanceTimersByTime(5000);
    });

    expect(mockSave).toHaveBeenCalledWith(mockData);
  });

  it('should save immediately when data changes', async () => {
    const mockSave = jest.fn().mockResolvedValue(undefined);
    const mockData = { test: 'data' };
    
    const { rerender } = render(
      <AutoSave
        data={mockData}
        onSave={mockSave}
        interval={5000}
        onError={jest.fn()}
      />
    );

    // Change the data
    const newData = { test: 'updated' };
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
        data={{ test: 'data' }}
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
        data={{ test: 'data' }}
        onSave={mockSave}
        interval={5000}
        onError={jest.fn()}
      />
    );

    unmount();

    // Advance timers after unmount
    act(() => {
      jest.advanceTimersByTime(5000);
    });

    // Verify save wasn't called after unmount
    expect(mockSave).not.toHaveBeenCalled();
  });

  it('should not save if data is unchanged', () => {
    const { rerender } = render(<AutoSave {...defaultProps} />);
    
    // Rerender with same data
    rerender(<AutoSave {...defaultProps} data={mockData} />);
    
    expect(defaultProps.onSave).not.toHaveBeenCalled();
  });

  it('should debounce rapid data changes', async () => {
    const mockSave = jest.fn().mockResolvedValue(undefined);
    const { rerender } = render(
      <AutoSave
        data={{ test: '1' }}
        onSave={mockSave}
        interval={5000}
        onError={jest.fn()}
      />
    );

    // Trigger multiple rapid data changes
    for (let i = 2; i <= 5; i++) {
      rerender(
        <AutoSave
          data={{ test: String(i) }}
          onSave={mockSave}
          interval={5000}
          onError={jest.fn()}
        />
      );
    }

    await act(async () => {
      jest.advanceTimersByTime(5000);
    });

    // Should only save the latest value
    expect(mockSave).toHaveBeenCalledTimes(1);
    expect(mockSave).toHaveBeenCalledWith({ test: '5' });
  });

  it('should save data when the save button is clicked', async () => {
    const mockSave = jest.fn().mockResolvedValue(undefined);
    const mockData = { test: 'data' };
    
    const { getByText } = render(
      <AutoSave
        data={mockData}
        onSave={mockSave}
        interval={5000}
        onError={jest.fn()}
      />
    );

    const saveButton = getByText('Save Now');
    fireEvent.click(saveButton);

    expect(mockSave).toHaveBeenCalledWith(mockData);
  });

  it('should display a save status message', async () => {
    const mockSave = jest.fn().mockResolvedValue(undefined);
    const mockData = { test: 'data' };
    
    const { getByText } = render(
      <AutoSave
        data={mockData}
        onSave={mockSave}
        interval={5000}
        onError={jest.fn()}
      />
    );

    const saveButton = getByText('Save Now');
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(getByText('Save successful')).toBeInTheDocument();
    });
  });

  it('should handle save errors and display an error message', async () => {
    const mockError = new Error('Save failed');
    const mockSave = jest.fn().mockRejectedValue(mockError);
    const mockOnError = jest.fn();
    
    const { getByText } = render(
      <AutoSave
        data={{ test: 'data' }}
        onSave={mockSave}
        interval={5000}
        onError={mockOnError}
      />
    );

    const saveButton = getByText('Save Now');
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(getByText('Save failed')).toBeInTheDocument();
    });
  });
});
