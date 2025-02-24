import React, { useState } from 'react';
import { useUserPreferences, UserPreferences } from './UserPreferences';
import { useAudioFeedback } from './AudioFeedback';
import { LiveRegion } from './LiveRegion';

interface PreferencesPanelProps {
  onClose?: () => void;
}

export function PreferencesPanel({ onClose }: PreferencesPanelProps): JSX.Element {
  const { preferences, updatePreference } = useUserPreferences();
  const { playSound } = useAudioFeedback();
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  const handleChange = async <K extends keyof UserPreferences>(
    key: K,
    value: UserPreferences[K]
  ) => {
    setIsSaving(true);
    try {
      await updatePreference(key, value);
      setLastSaved(new Date());
      playSound('success');
    } catch (error) {
      playSound('error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div 
      role="dialog"
      aria-labelledby="preferences-title"
      className="preferences-panel"
    >
      <header className="panel-header">
        <h2 id="preferences-title">User Preferences</h2>
        <button
          onClick={() => {
            playSound('navigation');
            onClose?.();
          }}
          className="close-button"
          aria-label="Close preferences"
        >
          ×
        </button>
      </header>

      <div className="preferences-content">
        <section className="preference-group">
          <h3>Appearance</h3>
          <div className="preference-item">
            <label htmlFor="theme">Theme</label>
            <select
              id="theme"
              value={preferences.theme}
              onChange={(e) => handleChange('theme', e.target.value as UserPreferences['theme'])}
            >
              <option value="light">Light</option>
              <option value="dark">Dark</option>
              <option value="system">System</option>
            </select>
          </div>

          <div className="preference-item">
            <label htmlFor="fontSize">Font Size</label>
            <select
              id="fontSize"
              value={preferences.fontSize}
              onChange={(e) => handleChange('fontSize', e.target.value as UserPreferences['fontSize'])}
            >
              <option value="small">Small</option>
              <option value="medium">Medium</option>
              <option value="large">Large</option>
            </select>
          </div>
        </section>

        <section className="preference-group">
          <h3>Accessibility</h3>
          <div className="preference-item">
            <label htmlFor="soundEnabled">
              <input
                type="checkbox"
                id="soundEnabled"
                checked={preferences.soundEnabled}
                onChange={(e) => handleChange('soundEnabled', e.target.checked)}
              />
              Enable Sound Effects
            </label>
          </div>

          <div className="preference-item">
            <label htmlFor="highContrast">
              <input
                type="checkbox"
                id="highContrast"
                checked={preferences.highContrast}
                onChange={(e) => handleChange('highContrast', e.target.checked)}
              />
              High Contrast Mode
            </label>
          </div>

          <div className="preference-item">
            <label htmlFor="motionReduced">
              <input
                type="checkbox"
                id="motionReduced"
                checked={preferences.motionReduced}
                onChange={(e) => handleChange('motionReduced', e.target.checked)}
              />
              Reduce Motion
            </label>
          </div>
        </section>

        <section className="preference-group">
          <h3>Keyboard</h3>
          <div className="preference-item">
            <label htmlFor="keyboardMode">Keyboard Mode</label>
            <select
              id="keyboardMode"
              value={preferences.keyboardMode}
              onChange={(e) => handleChange('keyboardMode', e.target.value as UserPreferences['keyboardMode'])}
            >
              <option value="basic">Basic</option>
              <option value="vim">Vim</option>
              <option value="emacs">Emacs</option>
            </select>
          </div>
        </section>

        <section className="preference-group">
          <h3>Auto-Save</h3>
          <div className="preference-item">
            <label htmlFor="autoSave">
              <input
                type="checkbox"
                id="autoSave"
                checked={preferences.autoSave}
                onChange={(e) => handleChange('autoSave', e.target.checked)}
              />
              Enable Auto-Save
            </label>
          </div>

          {preferences.autoSave && (
            <div className="preference-item">
              <label htmlFor="autoSaveInterval">Save Interval (seconds)</label>
              <input
                type="number"
                id="autoSaveInterval"
                min="5"
                max="300"
                value={preferences.autoSaveInterval / 1000}
                onChange={(e) => handleChange('autoSaveInterval', parseInt(e.target.value) * 1000)}
              />
            </div>
          )}
        </section>
      </div>

      <footer className="panel-footer">
        {isSaving ? (
          <span role="status">Saving changes...</span>
        ) : lastSaved ? (
          <span role="status">
            Last saved: {lastSaved.toLocaleTimeString()}
          </span>
        ) : null}
      </footer>

      <LiveRegion>
        {isSaving ? 'Saving preferences...' : lastSaved ? 'Preferences saved successfully' : ''}
      </LiveRegion>

      <style jsx>{`
        .preferences-panel {
          background: var(--surface-background);
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          max-width: 600px;
          width: 100%;
          margin: 2rem auto;
        }

        .panel-header {
          padding: 1rem;
          border-bottom: 1px solid var(--border-color);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .close-button {
          background: transparent;
          border: none;
          font-size: 1.5rem;
          cursor: pointer;
          padding: 0.5rem;
          color: var(--text-secondary);
        }

        .preferences-content {
          padding: 1rem;
        }

        .preference-group {
          margin-bottom: 2rem;
        }

        .preference-group h3 {
          margin-bottom: 1rem;
          color: var(--text-primary);
        }

        .preference-item {
          margin-bottom: 1rem;
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .preference-item label {
          flex: 1;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        select,
        input[type="number"] {
          padding: 0.5rem;
          border: 1px solid var(--border-color);
          border-radius: 4px;
          background: var(--input-background);
          color: var(--text-primary);
        }

        input[type="checkbox"] {
          width: 1.2rem;
          height: 1.2rem;
        }

        .panel-footer {
          padding: 1rem;
          border-top: 1px solid var(--border-color);
          text-align: center;
          color: var(--text-secondary);
          font-size: 0.875rem;
        }

        @media (max-width: 768px) {
          .preferences-panel {
            margin: 1rem;
          }

          .preference-item {
            flex-direction: column;
            align-items: flex-start;
            gap: 0.5rem;
          }
        }
      `}</style>
    </div>
  );
}