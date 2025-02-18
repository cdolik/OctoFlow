import React from 'react';
import { render, act, waitFor } from '@testing-library/react';
import AutoSave from '../components/AutoSave';

describe('AutoSave', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.clearAllMocks();
  });

  it('should call onSave after the specified interval', async () => {
    const mockSave = jest.fn().mockResolvedValue(undefined);
    const mockError = jest.fn();
    const testData = { test: 'data' };

    render(
      <AutoSave 
        data={testData} 
        onSave={mockSave} 
        interval={1000} 
        onError={mockError} 
      />
    );

    // Fast-forward timers
    await act(async () => {
      jest.advanceTimersByTime(1000);
    });

    await waitFor(() => {
      expect(mockSave).toHaveBeenCalledWith(testData);
    });
    expect(mockError).not.toHaveBeenCalled();
  });

  it('should handle save errors correctly', async () => {
    const error = new Error('Save failed');
    const mockSave = jest.fn().mockRejectedValue(error);
    const mockError = jest.fn();
    const testData = { test: 'data' };

    render(
      <AutoSave 
        data={testData} 
        onSave={mockSave} 
        interval={1000} 
        onError={mockError} 
      />
    );

    await act(async () => {
      jest.advanceTimersByTime(1000);
    });

    await waitFor(() => {
      expect(mockError).toHaveBeenCalledWith(error);
    });
  });
});

