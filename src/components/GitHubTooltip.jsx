import React, { useState } from 'react';
import { GITHUB_GLOSSARY } from '../data/GITHUB_GLOSSARY';

export default function GitHubTooltip({ term, children }) {
  const [isVisible, setVisible] = useState(false);
  const glossaryEntry = GITHUB_GLOSSARY[term];

  return (
    <div className="tooltip-wrapper" style={{ display: 'inline-block', position: 'relative' }}>
      <span
        onMouseEnter={() => setVisible(true)}
        onMouseLeave={() => setVisible(false)}
      >
        {children}
      </span>
      {isVisible && glossaryEntry && (
        <div className="tooltip" style={{
          position: 'absolute',
          bottom: '125%',
          left: '50%',
          transform: 'translateX(-50%)',
          backgroundColor: '#333',
          color: 'white',
          padding: '0.5rem',
          borderRadius: '4px',
          zIndex: 1000,
          width: '200px',
          textAlign: 'center'
        }}>
          <p style={{ margin: '0', fontSize: '0.9rem' }}>{glossaryEntry.text}</p>
          <a href={glossaryEntry.link} target="_blank" rel="noopener noreferrer" style={{
            color: '#2DA44E',
            textDecoration: 'underline',
            fontSize: '0.85rem'
          }}>
            GitHub Docs →
          </a>
        </div>
      )}
    </div>
  );
}