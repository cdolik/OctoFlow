import React, { useState } from 'react';
import { GITHUB_GLOSSARY } from '../data/GITHUB_GLOSSARY';
import './styles.css';

export default function GitHubTooltip({ term, children }) {
  const [isVisible, setVisible] = useState(false);
  const glossaryEntry = GITHUB_GLOSSARY[term];

  if (!glossaryEntry) return children;

  return (
    <div className="tooltip-wrapper">
      <span
        className="tooltip-trigger"
        onMouseEnter={() => setVisible(true)}
        onMouseLeave={() => setVisible(false)}
      >
        {children}
        <span className="tooltip-icon">ℹ️</span>
      </span>
      {isVisible && (
        <div className="github-tooltip">
          <p className="tooltip-text">{glossaryEntry.text}</p>
          <a 
            href={glossaryEntry.link} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="tooltip-link"
          >
            GitHub Docs →
          </a>
        </div>
      )}
    </div>
  );
}