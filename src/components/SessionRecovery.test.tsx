import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { useNavigate } from 'react-router-dom';
import { SessionRecovery } from './SessionRecovery';
import { IndexedDBAdapter } from '../utils/storage/IndexedDBAdapter';
import { createMockState } from '../utils/testUtils';

jest.mock('react-router-dom', () => ({
  useNavigate: jest.fn()
}));

jest.mock('../utils/storage/IndexedDBAdapter');

describe('SessionRecovery', () => {
  const mockOnRecover = jest.fn();
  const mockOnDecline = jest.fn();
  const mockNavigate = jest.fn();
  
  beforeEach(() => {
    jest.clearAllMocks();
    (useNavigate as jest.Mock).mockReturnValue(mockNavigate);
  });

  it('shows loading state while checking for saved sessions', () => {
    const mockGetAllStates = jest.fn().mockImplementation(() => new Promise(() => {}));
    (IndexedDBAdapter as jest.Mock).mockImplementation(() => ({
      initialize: jest.fn().mockResolvedValue(undefined),
      getAllStates: mockGetAllStates
    }));

    render(
      <SessionRecovery 
        onRecover={mockOnRecover}
        onDecline={mockOnDecline}
      />
    );

    expect(screen.getByText(/Checking for saved sessions/)).toBeInTheDocument();
  });

  it('renders saved sessions in order of last modified', async () => {
    const mockStates = [
      createMockState({ 
        currentStage: 'pre-seed',
        metadata: { lastSaved: '2023-01-02T00:00:00Z' }
      }),
      createMockState({ 
        currentStage: 'seed',
        metadata: { lastSaved: '2023-01-01T00:00:00Z' }
      })
    ];

    (IndexedDBAdapter as jest.Mock).mockImplementation(() => ({
      initialize: jest.fn().mockResolvedValue(undefined),
      getAllStates: jest.fn().mockResolvedValue(mockStates)
    }));

    await act(async () => {
      render(
        <SessionRecovery 
          onRecover={mockOnRecover}
          onDecline={mockOnDecline}
        />
      );
    });

    const sessions = screen.getAllByRole('heading', { level: 3 });
    expect(sessions[0]).toHaveTextContent('pre-seed');
    expect(sessions[1]).toHaveTextContent('seed');
  });

  it('handles session recovery', async () => {
    const mockState = createMockState({ currentStage: 'pre-seed' });
    
    (IndexedDBAdapter as jest.Mock).mockImplementation(() => ({
      initialize: jest.fn().mockResolvedValue(undefined),
      getAllStates: jest.fn().mockResolvedValue([mockState])
    }));

    await act(async () => {
      render(
        <SessionRecovery 
          onRecover={mockOnRecover}
          onDecline={mockOnDecline}
        />
      );
    });

    fireEvent.click(screen.getByText('Resume'));

    expect(mockOnRecover).toHaveBeenCalledWith(mockState);
    expect(mockNavigate).toHaveBeenCalledWith('/assessment/pre-seed');
  });

  it('handles decline and starts new session', async () => {
    const mockState = createMockState({ currentStage: 'pre-seed' });
    
    (IndexedDBAdapter as jest.Mock).mockImplementation(() => ({
      initialize: jest.fn().mockResolvedValue(undefined),
      getAllStates: jest.fn().mockResolvedValue([mockState])
    }));

    await act(async () => {
      render(
        <SessionRecovery 
          onRecover={mockOnRecover}
          onDecline={mockOnDecline}
        />
      );
    });

    fireEvent.click(screen.getByText('Start New Session'));
    expect(mockOnDecline).toHaveBeenCalled();
  });

  it('handles error state', async () => {
    const error = new Error('Failed to load sessions');
    
    (IndexedDBAdapter as jest.Mock).mockImplementation(() => ({
      initialize: jest.fn().mockRejectedValue(error),
      getAllStates: jest.fn()
    }));

    await act(async () => {
      render(
        <SessionRecovery 
          onRecover={mockOnRecover}
          onDecline={mockOnDecline}
        />
      );
    });

    expect(screen.getByText('Unable to check for saved sessions')).toBeInTheDocument();
    expect(screen.getByText(error.message)).toBeInTheDocument();
  });

  it('renders nothing when no saved sessions exist', async () => {
    (IndexedDBAdapter as jest.Mock).mockImplementation(() => ({
      initialize: jest.fn().mockResolvedValue(undefined),
      getAllStates: jest.fn().mockResolvedValue([])
    }));

    await act(async () => {
      const { container } = render(
        <SessionRecovery 
          onRecover={mockOnRecover}
          onDecline={mockOnDecline}
        />
      );
      expect(container.firstChild).toBeNull();
    });
  });

  it('maintains focus management for accessibility', async () => {
    const mockStates = [
      createMockState({ currentStage: 'pre-seed' }),
      createMockState({ currentStage: 'seed' })
    ];

    (IndexedDBAdapter as jest.Mock).mockImplementation(() => ({
      initialize: jest.fn().mockResolvedValue(undefined),
      getAllStates: jest.fn().mockResolvedValue(mockStates)
    }));

    await act(async () => {
      render(
        <SessionRecovery 
          onRecover={mockOnRecover}
          onDecline={mockOnDecline}
        />
      );
    });

    const resumeButtons = screen.getAllByText('Resume');
    expect(resumeButtons[0]).toHaveFocus();
  });
});