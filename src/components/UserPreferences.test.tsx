import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { renderHook } from '@testing-library/react';
import { UserPreferences, useUserPreferences } from './UserPreferences';
import { useStorage } from '../hooks/useStorage';
import { useAudioFeedback } from './AudioFeedback';

jest.mock('../hooks/useStorage');
jest.mock('./AudioFeedback');

describe('UserPreferences', () => {
  const mockPlaySound = jest.fn();
  const mockSaveState = jest.fn();
  const mockState = {
    preferences: {
      theme: 'light',
      fontSize: 'medium',
      soundEnabled: true,
      highContrast: false,
      motionReduced: false,
      keyboardMode: 'basic',
      autoSave: true,
      autoSaveInterval: 30000
    }
  };

  beforeEach(() => {
    (useStorage as jest.Mock).mockReturnValue({
      state: mockState,
      saveState: mockSaveState
    });
    (useAudioFeedback as jest.Mock).mockReturnValue({
      playSound: mockPlaySound
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('provides default preferences when no state exists', () => {
    (useStorage as jest.Mock).mockReturnValue({
      state: null,
      saveState: mockSaveState
    });

    const { result } = renderHook(() => useUserPreferences(), {
      wrapper: ({ children }) => (
        <UserPreferences>{children}</UserPreferences>
      )
    });

    expect(result.current.preferences).toEqual({
      theme: 'system',
      fontSize: 'medium',
      soundEnabled: true,
      highContrast: false,
      motionReduced: false,
      keyboardMode: 'basic',
      autoSave: true,
      autoSaveInterval: 30000
    });
  });

  it('updates preferences successfully', async () => {
    mockSaveState.mockResolvedValue(true);

    const { result } = renderHook(() => useUserPreferences(), {
      wrapper: ({ children }) => (
        <UserPreferences>{children}</UserPreferences>
      )
    });

    await act(async () => {
      await result.current.updatePreference('theme', 'dark');
    });

    expect(mockSaveState).toHaveBeenCalledWith({
      ...mockState,
      preferences: {
        ...mockState.preferences,
        theme: 'dark'
      }
    });
    expect(mockPlaySound).toHaveBeenCalledWith('success');
  });

  it('handles failed preference updates', async () => {
    mockSaveState.mockResolvedValue(false);

    const { result } = renderHook(() => useUserPreferences(), {
      wrapper: ({ children }) => (
        <UserPreferences>{children}</UserPreferences>
      )
    });

    await act(async () => {
      await result.current.updatePreference('fontSize', 'large');
    });

    expect(mockPlaySound).toHaveBeenCalledWith('error');
  });

  it('calls onUpdate callback when preferences change successfully', async () => {
    mockSaveState.mockResolvedValue(true);
    const onUpdate = jest.fn();

    const { result } = renderHook(() => useUserPreferences(), {
      wrapper: ({ children }) => (
        <UserPreferences onUpdate={onUpdate}>{children}</UserPreferences>
      )
    });

    await act(async () => {
      await result.current.updatePreference('soundEnabled', false);
    });

    expect(onUpdate).toHaveBeenCalledWith({
      ...mockState.preferences,
      soundEnabled: false
    });
  });

  it('announces preferences loading via LiveRegion', () => {
    render(
      <UserPreferences>
        <div>Test content</div>
      </UserPreferences>
    );

    expect(screen.getByText(/Preferences loaded: \d+ settings available/))
      .toBeInTheDocument();
  });

  it('throws error when hook is used outside provider', () => {
    const { result } = renderHook(() => useUserPreferences());
    
    expect(result.error).toEqual(
      Error('useUserPreferences must be used within a UserPreferences provider')
    );
  });

  it('preserves existing preferences when updating a single value', async () => {
    mockSaveState.mockResolvedValue(true);

    const { result } = renderHook(() => useUserPreferences(), {
      wrapper: ({ children }) => (
        <UserPreferences>{children}</UserPreferences>
      )
    });

    await act(async () => {
      await result.current.updatePreference('highContrast', true);
    });

    expect(mockSaveState).toHaveBeenCalledWith({
      ...mockState,
      preferences: {
        ...mockState.preferences,
        highContrast: true
      }
    });
  });
});