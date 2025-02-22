import React from 'react';
import { Stage } from '../types';
import './styles.css';

interface ShortcutProps {
  stage: Stage;
  showAdvanced?: boolean;
}

interface ShortcutInfo {
  key: string;
  description: string;
}

const KeyboardShortcutHelper: React.FC<ShortcutProps> = ({ stage, showAdvanced = false }) => {
  const getStageShortcuts = () => {
    const common: ShortcutInfo[] = [
      { key: '→', description: 'Next question/section' },
      { key: '←', description: 'Previous question/section' },
      { key: 'Esc', description: 'Open menu / Exit current view' }
    ];

    const stageSpecific: Record<Stage, ShortcutInfo[]> = {
      'pre-seed': [
        { key: '1-4', description: 'Select answer option' },
        { key: 'S', description: 'Save progress' }
      ],
      'seed': [
        { key: '1-4', description: 'Select answer option' },
        { key: 'R', description: 'Review previous answers' }
      ],
      'series-a': [
        { key: '1-4', description: 'Select answer option' },
        { key: 'C', description: 'Compare with benchmarks' }
      ]
    };

    const advanced: ShortcutInfo[] = [
      { key: 'Ctrl+B', description: 'Toggle benchmarks view' },
      { key: 'Ctrl+H', description: 'Show/hide help' },
      { key: 'Ctrl+S', description: 'Force save' }
    ];

    return [
      ...common,
      ...stageSpecific[stage],
      ...(showAdvanced ? advanced : [])
    ];
  };

  return (
    <div className="keyboard-shortcuts" role="complementary" aria-label="Keyboard shortcuts">
      <div className="shortcuts-grid">
        {getStageShortcuts().map(({ key, description }) => (
          <div key={key} className="shortcut-row">
            <kbd className="shortcut-key">{key}</kbd>
            <span className="shortcut-description">{description}</span>
          </div>
        ))}
      </div>
      {!showAdvanced && (
        <button 
          className="show-advanced-shortcuts"
          onClick={() => window.dispatchEvent(new CustomEvent('toggleAdvancedShortcuts'))}
        >
          Show Advanced Shortcuts
        </button>
      )}
    </div>
  );
};

export default KeyboardShortcutHelper;