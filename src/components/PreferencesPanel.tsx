import React, { useState, useEffect } from 'react';
import { LiveRegion } from './LiveRegion';
import type { UserPreferences, ThemeMode, FontSize, KeyboardMode } from '../types/user';

interface PreferencesPanelProps {
  preferences: UserPreferences;
  onPreferencesChange: (preferences: Partial<UserPreferences>) => void;
  onClose?: () => void;
}

export const PreferencesPanel: React.FC<PreferencesPanelProps> = ({
  preferences,
  onPreferencesChange,
  onClose
}) => {
  const [localPreferences, setLocalPreferences] = useState<UserPreferences>(preferences);

  useEffect(() => {
    setLocalPreferences(preferences);
  }, [preferences]);

  const handleThemeChange = (theme: ThemeMode) => {
    setLocalPreferences(prev => ({ ...prev, theme }));
    onPreferencesChange({ theme });
  };

  const handleFontSizeChange = (fontSize: FontSize) => {
    setLocalPreferences(prev => ({ ...prev, fontSize }));
    onPreferencesChange({ fontSize });
  };

  const handleToggle = (key: keyof UserPreferences) => {
    const newValue = !localPreferences[key];
    setLocalPreferences(prev => ({ ...prev, [key]: newValue }));
    onPreferencesChange({ [key]: newValue });
  };

  const handleKeyboardModeChange = (keyboardMode: KeyboardMode) => {
    setLocalPreferences(prev => ({ ...prev, keyboardMode }));
    onPreferencesChange({ keyboardMode });
  };

  return (
    <div className="preferences-panel" role="dialog" aria-label="Preferences">
      <LiveRegion>
        <h2>Preferences</h2>
      </LiveRegion>
      
      <section>
        <h3>Theme</h3>
        <div className="theme-options">
          {(['light', 'dark', 'system'] as ThemeMode[]).map(theme => (
            <button
              key={theme}
              onClick={() => handleThemeChange(theme)}
              className={localPreferences.theme === theme ? 'active' : ''}
              aria-pressed={localPreferences.theme === theme}
            >
              {theme.charAt(0).toUpperCase() + theme.slice(1)}
            </button>
          ))}
        </div>
      </section>

      <section>
        <h3>Font Size</h3>
        <div className="font-size-options">
          {(['small', 'medium', 'large'] as FontSize[]).map(size => (
            <button
              key={size}
              onClick={() => handleFontSizeChange(size)}
              className={localPreferences.fontSize === size ? 'active' : ''}
              aria-pressed={localPreferences.fontSize === size}
            >
              {size.charAt(0).toUpperCase() + size.slice(1)}
            </button>
          ))}
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