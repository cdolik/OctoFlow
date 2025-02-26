import React, { useState, useEffect } from 'react';
import { LiveRegion } from './LiveRegion';
import type { UserPreferences, ThemeMode, FontSize, KeyboardMode } from '../types/user';

interface PreferencesPanelProps {
  preferences: UserPreferences;
  onPreferencesChange: (preferences: UserPreferences) => void;
  onClose?: () => void;
}

const PreferencesPanel: React.FC<PreferencesPanelProps> = ({ preferences, onPreferencesChange, onClose }) => {
  const [localPreferences, setLocalPreferences] = useState<UserPreferences>(preferences);

  useEffect(() => {
    setLocalPreferences(preferences);
  }, [preferences]);

  const handleThemeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    onPreferencesChange({ ...preferences, theme: event.target.value as UserPreferences['theme'] });
  };

  const handleFontSizeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    onPreferencesChange({ ...preferences, fontSize: event.target.value as UserPreferences['fontSize'] });
  };

  const handleToggle = (key: keyof UserPreferences) => {
    const newValue = !localPreferences[key];
    setLocalPreferences(prev => ({ ...prev, [key]: newValue }));
    onPreferencesChange({ ...preferences, [key]: newValue });
  };

  const handleKeyboardModeChange = (keyboardMode: KeyboardMode) => {
    setLocalPreferences(prev => ({ ...prev, keyboardMode }));
    onPreferencesChange({ ...preferences, keyboardMode });
  };

  return (
    <div className="preferences-panel" role="dialog" aria-label="Preferences">
      <LiveRegion>
        <h2>Preferences</h2>
      </LiveRegion>
      
      <section>
        <h3>Theme</h3>
        <div className="theme-options">
          <label htmlFor="theme-select">Theme:</label>
          <select id="theme-select" value={preferences.theme} onChange={handleThemeChange}>
            <option value="light">Light</option>
            <option value="dark">Dark</option>
            <option value="system">System</option>
          </select>
        </div>
      </section>

      <section>
        <h3>Font Size</h3>
        <div className="font-size-options">
          <label htmlFor="font-size-select">Font Size:</label>
          <select id="font-size-select" value={preferences.fontSize} onChange={handleFontSizeChange}>
            <option value="small">Small</option>
            <option value="medium">Medium</option>
            <option value="large">Large</option>
          </select>
        </div>
      </section>

      <section>
        <h3>Accessibility</h3>
        <div className="accessibility-options">
          <label>
            <input
              type="checkbox"
              checked={localPreferences.highContrast}
              onChange={() => handleToggle('highContrast')}
            />
            High Contrast
          </label>
          <label>
            <input
              type="checkbox"
              checked={localPreferences.motionReduced}
              onChange={() => handleToggle('motionReduced')}
            />
            Reduced Motion
          </label>
          <label>
            <input
              type="checkbox"
              checked={localPreferences.soundEnabled}
              onChange={() => handleToggle('soundEnabled')}
            />
            Sound Effects
          </label>
        </div>
      </section>

      <section>
        <h3>Keyboard Mode</h3>
        <div className="keyboard-mode-options">
          {(['basic', 'advanced'] as KeyboardMode[]).map(mode => (
            <button
              key={mode}
              onClick={() => handleKeyboardModeChange(mode)}
              className={localPreferences.keyboardMode === mode ? 'active' : ''}
              aria-pressed={localPreferences.keyboardMode === mode}
            >
              {mode.charAt(0).toUpperCase() + mode.slice(1)}
            </button>
          ))}
        </div>
      </section>

      <section>
        <h3>Auto Save</h3>
        <div className="auto-save-options">
          <label>
            <input
              type="checkbox"
              checked={localPreferences.autoSave}
              onChange={() => handleToggle('autoSave')}
            />
            Enable Auto Save
          </label>
          {localPreferences.autoSave && (
            <label>
              Save Interval (seconds):
              <input
                type="number"
                min="5"
                max="300"
                value={localPreferences.autoSaveInterval}
                onChange={(e) => onPreferencesChange({ 
                  autoSaveInterval: Math.max(5, Math.min(300, parseInt(e.target.value, 10))) 
                })}
              />
            </label>
          )}
        </div>
      </section>

      {onClose && (
        <button 
          onClick={onClose}
          className="close-button"
          aria-label="Close preferences"
        >
          Close
        </button>
      )}
    </div>
  );
};

export default PreferencesPanel;