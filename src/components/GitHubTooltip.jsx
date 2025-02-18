import React, { useState, useRef, useEffect } from 'react';
import { GITHUB_GLOSSARY } from '../data/GITHUB_GLOSSARY';
import { trackResourceClick } from '../utils/analytics';
import './styles.css';

const DEFAULT_TERM = {
  definition: 'Definition not found',
  learnMoreUrl: 'https://docs.github.com'
};

export default function GitHubTooltip({ term, children }) {
  const [isVisible, setVisible] = useState(false);
  const tooltipRef = useRef(null);
  const glossaryEntry = GITHUB_GLOSSARY[term] || DEFAULT_TERM;

  // Close tooltip on escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        setVisible(false);
      }
    };

    if (isVisible) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isVisible]);

  const handleLearnMoreClick = () => {
    trackResourceClick('github_docs', glossaryEntry.learnMoreUrl);
  };

  return (
    <div 
      className="tooltip-wrapper" 
      ref={tooltipRef}
      role="tooltip" 
      aria-label={glossaryEntry.definition}
    >
      <span
        className="tooltip-trigger"
        onMouseEnter={() => setVisible(true)}
        onMouseLeave={() => setVisible(false)}
        onFocus={() => setVisible(true)}
        onBlur={() => setVisible(false)}
        onClick={() => setVisible(!isVisible)}
        onKeyPress={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            setVisible(!isVisible);
          }
        }}
        tabIndex={0}
        role="button"
        aria-expanded={isVisible}
      >
        {children}
        <span className="tooltip-icon" aria-hidden="true">ℹ️</span>
      </span>
      {isVisible && (
        <div 
          className="github-tooltip"
          role="dialog"
          aria-label={`Definition for ${term}`}
        >
          <p className="tooltip-text">{glossaryEntry.definition}</p>
          <a 
            href={glossaryEntry.learnMoreUrl} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="tooltip-link"
            onClick={handleLearnMoreClick}
          >
            GitHub Docs →
          </a>
        </div>
      )}
    </div>
  );
}
