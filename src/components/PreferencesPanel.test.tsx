import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import PreferencesPanel from './PreferencesPanel';
import { UserPreferences } from '../types';
import { useUserPreferences } from './UserPreferences';
import { useAudioFeedback } from './AudioFeedback';

jest.mock('./UserPreferences');
jest.mock('./AudioFeedback');

const mockPreferences: UserPreferences = {
  theme: 'light',
  fontSize: 'medium',
  soundEnabled: true,
  highContrast: false,
  motionReduced: false,
  keyboardMode: 'basic',
  autoSave: true,
  autoSaveInterval: 60
};

const mockOnPreferencesChange = jest.fn();
const mockOnClose = jest.fn();

describe('PreferencesPanel', () => {
  const mockUpdatePreference = jest.fn();
  const mockPlaySound = jest.fn();

  beforeEach(() => {
    (useUserPreferences as jest.Mock).mockReturnValue({
      preferences: mockPreferences,
      updatePreference: mockUpdatePreference
    });
    (useAudioFeedback as jest.Mock).mockReturnValue({
      playSound: mockPlaySound
    });
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.useRealTimers();
  });

  it('renders preferences form', () => {
    render(
      <PreferencesPanel 
        preferences={mockPreferences} 
        onPreferencesChange={mockOnPreferencesChange} 
        onClose={mockOnClose} 
      />
    );

    expect(screen.getByLabelText('Theme:')).toBeInTheDocument();
    expect(screen.getByLabelText('Font Size:')).toBeInTheDocument();
  });

  it('calls onPreferencesChange when theme is changed', () => {
    render(
      <PreferencesPanel 
        preferences={mockPreferences} 
        onPreferencesChange={mockOnPreferencesChange} 
        onClose={mockOnClose} 
      />
    );

    fireEvent.change(screen.getByLabelText('Theme:'), { target: { value: 'dark' } });
    expect(mockOnPreferencesChange).toHaveBeenCalledWith({ ...mockPreferences, theme: 'dark' });
  });

  it('calls onPreferencesChange when font size is changed', () => {
    render(
      <PreferencesPanel 
        preferences={mockPreferences} 
        onPreferencesChange={mockOnPreferencesChange} 
        onClose={mockOnClose} 
      />
    );

    fireEvent.change(screen.getByLabelText('Font Size:'), { target: { value: 'large' } });
    expect(mockOnPreferencesChange).toHaveBeenCalledWith({ ...mockPreferences, fontSize: 'large' });
  });

  it('calls onClose when close button is clicked', () => {
    render(
      <PreferencesPanel 
        preferences={mockPreferences} 
        onPreferencesChange={mockOnPreferencesChange} 
        onClose={mockOnClose} 
      />
    );

    fireEvent.click(screen.getByText('Close'));
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('renders all preference sections', () => {
    render(<PreferencesPanel />);

    expect(screen.getByText('Appearance')).toBeInTheDocument();
    expect(screen.getByText('Accessibility')).toBeInTheDocument();
    expect(screen.getByText('Keyboard')).toBeInTheDocument();
    expect(screen.getByText('Auto-Save')).toBeInTheDocument();
  });

  it('handles theme changes', async () => {
    render(<PreferencesPanel />);
    
    const themeSelect = screen.getByLabelText('Theme');
    await act(async () => {
      fireEvent.change(themeSelect, { target: { value: 'dark' } });
    });

    expect(mockUpdatePreference).toHaveBeenCalledWith('theme', 'dark');
    expect(mockPlaySound).toHaveBeenCalledWith('success');
  });

  it('handles font size changes', async () => {
    render(<PreferencesPanel />);
    
    const fontSizeSelect = screen.getByLabelText('Font Size');
    await act(async () => {
      fireEvent.change(fontSizeSelect, { target: { value: 'large' } });
    });

    expect(mockUpdatePreference).toHaveBeenCalledWith('fontSize', 'large');
  });

  it('toggles accessibility features', async () => {
    render(<PreferencesPanel />);
    
    const highContrastToggle = screen.getByLabelText(/High Contrast Mode/);
    const motionReducedToggle = screen.getByLabelText(/Reduce Motion/);

    await act(async () => {
      fireEvent.click(highContrastToggle);
    });
    expect(mockUpdatePreference).toHaveBeenCalledWith('highContrast', true);

    await act(async () => {
      fireEvent.click(motionReducedToggle);
    });
    expect(mockUpdatePreference).toHaveBeenCalledWith('motionReduced', true);
  });

  it('handles keyboard mode changes', async () => {
    render(<PreferencesPanel />);
    
    const keyboardModeSelect = screen.getByLabelText('Keyboard Mode');
    await act(async () => {
      fireEvent.change(keyboardModeSelect, { target: { value: 'vim' } });
    });

    expect(mockUpdatePreference).toHaveBeenCalledWith('keyboardMode', 'vim');
  });

  it('toggles auto-save settings', async () => {
    render(<PreferencesPanel />);
    
    const autoSaveToggle = screen.getByLabelText(/Enable Auto-Save/);
    await act(async () => {
      fireEvent.click(autoSaveToggle);
    });

    expect(mockUpdatePreference).toHaveBeenCalledWith('autoSave', false);
  });

  it('shows auto-save interval input when auto-save is enabled', () => {
    (useUserPreferences as jest.Mock).mockReturnValue({
      preferences: { ...mockPreferences, autoSave: true },
      updatePreference: mockUpdatePreference
    });

    render(<PreferencesPanel />);
    expect(screen.getByLabelText(/Save Interval/)).toBeInTheDocument();
  });

  it('handles auto-save interval changes', async () => {
    render(<PreferencesPanel />);
    
    const intervalInput = screen.getByLabelText(/Save Interval/);
    await act(async () => {
      fireEvent.change(intervalInput, { target: { value: '60' } });
    });

    expect(mockUpdatePreference).toHaveBeenCalledWith('autoSaveInterval', 60000);
  });

  it('shows saving status while updating', async () => {
    mockUpdatePreference.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 1000)));
    
    render(<PreferencesPanel />);
    
    const themeSelect = screen.getByLabelText('Theme');
    fireEvent.change(themeSelect, { target: { value: 'dark' } });

    expect(screen.getByText('Saving changes...')).toBeInTheDocument();

    await act(async () => {
      jest.advanceTimersByTime(1000);
    });
  });

  it('shows last saved time after successful update', async () => {
    render(<PreferencesPanel />);
    
    const themeSelect = screen.getByLabelText('Theme');
    await act(async () => {
      fireEvent.change(themeSelect, { target: { value: 'dark' } });
    });

    expect(screen.getByText(/Last saved:/)).toBeInTheDocument();
  });

  it('maintains proper ARIA attributes', () => {
    render(<PreferencesPanel />);
    
    expect(screen.getByRole('dialog')).toHaveAttribute('aria-labelledby', 'preferences-title');
    expect(screen.getByText('User Preferences')).toHaveAttribute('id', 'preferences-title');
  });

  it('closes panel and plays sound', () => {
    const onClose = jest.fn();
    render(<PreferencesPanel onClose={onClose} />);
    
    const closeButton = screen.getByLabelText('Close preferences');
    fireEvent.click(closeButton);

    expect(onClose).toHaveBeenCalled();
    expect(mockPlaySound).toHaveBeenCalledWith('navigation');
  });

  it('announces preference changes via LiveRegion', async () => {
    render(<PreferencesPanel />);
    
    const themeSelect = screen.getByLabelText('Theme');
    await act(async () => {
      fireEvent.change(themeSelect, { target: { value: 'dark' } });
    });

    expect(screen.getByText('Preferences saved successfully')).toBeInTheDocument();
  });
});