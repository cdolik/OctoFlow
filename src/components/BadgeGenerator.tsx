import React, { useState, useEffect } from 'react';
import { Category } from '../data/questions';
import { calculateEligibility, EligibilityLevel } from '../utils/eligibility';

interface BadgeGeneratorProps {
  scores: Record<Category, number>;
  overallScore: number;
}

const BadgeGenerator: React.FC<BadgeGeneratorProps> = ({ scores, overallScore }) => {
  const [copySuccess, setCopySuccess] = useState<string | null>(null);
  const [badgeType, setBadgeType] = useState<'flat' | 'plastic' | 'flat-square' | 'for-the-badge'>('flat');
  const [badgeVariant, setBadgeVariant] = useState<'standard' | 'github-startups'>('standard');
  
  // Reset copy success message after 3 seconds
  useEffect(() => {
    if (copySuccess) {
      const timer = setTimeout(() => {
        setCopySuccess(null);
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [copySuccess]);
  
  // Generate badge color based on score
  const getBadgeColor = (score: number): string => {
    if (score >= 3.5) return 'brightgreen';
    if (score >= 3.0) return 'green';
    if (score >= 2.5) return 'yellowgreen';
    if (score >= 2.0) return 'yellow';
    if (score >= 1.5) return 'orange';
    return 'red';
  };
  
  // Get eligibility level color
  const getEligibilityColor = (level: EligibilityLevel): string => {
    switch (level) {
      case EligibilityLevel.Eligible:
        return 'green';
      case EligibilityLevel.NotEligible:
        return 'red';
      default:
        return 'lightgrey';
    }
  };
  
  // Calculate eligibility
  const { level } = calculateEligibility(scores);
  
  // Generate badge URL
  const generateBadgeUrl = (label: string, message: string, color: string): string => {
    return `https://img.shields.io/badge/${encodeURIComponent(label)}-${encodeURIComponent(message)}-${color}?style=${badgeType}`;
  };
  
  // Generate badge markdown
  const generateMarkdown = (): string => {
    if (badgeVariant === 'github-startups') {
      const url = generateBadgeUrl('GitHub for Startups', level, getEligibilityColor(level));
      return `[![GitHub for Startups Eligibility](${url})](https://github.com/enterprise/startups)`;
    } else {
      const url = generateBadgeUrl('OctoFlow', 'Verified', getBadgeColor(overallScore));
      return `[![OctoFlow Verified](${url})](https://github.com/octoflow)`;
    }
  };
  
  // Generate badge HTML
  const generateHtml = (): string => {
    if (badgeVariant === 'github-startups') {
      const url = generateBadgeUrl('GitHub for Startups', level, getEligibilityColor(level));
      return `<a href="https://github.com/enterprise/startups"><img src="${url}" alt="GitHub for Startups Eligibility"></a>`;
    } else {
      const url = generateBadgeUrl('OctoFlow', 'Verified', getBadgeColor(overallScore));
      return `<a href="https://github.com/octoflow"><img src="${url}" alt="OctoFlow Verified"></a>`;
    }
  };
  
  // Copy to clipboard
  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopySuccess(`${type} copied!`);
    } catch (err) {
      setCopySuccess('Failed to copy!');
    }
  };
  
  return (
    <div className="badge-generator">
      <h3>GitHub Repository Badge</h3>
      
      <p className="badge-description">
        Show that your repository has been verified with OctoFlow. Choose between a standard badge
        or a GitHub for Startups eligibility badge to display on your repository.
      </p>
      
      <div className="badge-options">
        <div className="badge-option-group">
          <label htmlFor="badge-variant">Badge Type:</label>
          <select 
            id="badge-variant" 
            value={badgeVariant} 
            onChange={(e) => setBadgeVariant(e.target.value as 'standard' | 'github-startups')}
          >
            <option value="standard">Standard OctoFlow Badge</option>
            <option value="github-startups">GitHub for Startups Eligibility</option>
          </select>
        </div>
        
        <div className="badge-option-group">
          <label htmlFor="badge-style">Badge Style:</label>
          <select 
            id="badge-style" 
            value={badgeType} 
            onChange={(e) => setBadgeType(e.target.value as 'flat' | 'plastic' | 'flat-square' | 'for-the-badge')}
          >
            <option value="flat">Flat</option>
            <option value="plastic">Plastic</option>
            <option value="flat-square">Flat Square</option>
            <option value="for-the-badge">For The Badge</option>
          </select>
        </div>
      </div>
      
      <div className="badge-preview">
        <h4>Preview</h4>
        {badgeVariant === 'github-startups' ? (
          <img 
            src={generateBadgeUrl('GitHub for Startups', level, getEligibilityColor(level))} 
            alt="GitHub for Startups Eligibility Badge" 
          />
        ) : (
          <img 
            src={generateBadgeUrl('OctoFlow', 'Verified', getBadgeColor(overallScore))} 
            alt="OctoFlow Verified Badge" 
          />
        )}
      </div>
      
      <div className="badge-code-sections">
        <div className="badge-code-section">
          <h4>Markdown</h4>
          <div className="code-block">
            <pre>{generateMarkdown()}</pre>
            <button 
              className="copy-button"
              onClick={() => copyToClipboard(generateMarkdown(), 'Markdown')}
              aria-label="Copy markdown code"
            >
              <i className="fas fa-copy"></i>
            </button>
          </div>
        </div>
        
        <div className="badge-code-section">
          <h4>HTML</h4>
          <div className="code-block">
            <pre>{generateHtml()}</pre>
            <button 
              className="copy-button"
              onClick={() => copyToClipboard(generateHtml(), 'HTML')}
              aria-label="Copy HTML code"
            >
              <i className="fas fa-copy"></i>
            </button>
          </div>
        </div>
      </div>
      
      {copySuccess && (
        <div className="copy-success">
          <i className="fas fa-check-circle"></i> {copySuccess}
        </div>
      )}
      
      <div className="badge-info">
        <h4>About This Badge</h4>
        {badgeVariant === 'github-startups' ? (
          <>
            <p>
              This badge displays your eligibility status for the GitHub for Startups program.
              It shows potential collaborators and users that you&apos;ve been assessed for the program
              and your current eligibility level.
            </p>
            <p>
              Add this badge to your README.md file to showcase your GitHub for Startups eligibility
              and demonstrate your commitment to GitHub best practices.
            </p>
          </>
        ) : (
          <>
            <p>
              This badge indicates that your repository has been assessed using OctoFlow&apos;s GitHub workflow evaluation.
              It doesn&apos;t display specific scores but serves as a reference that you&apos;ve completed the assessment and
              are working on implementing GitHub best practices.
            </p>
            <p>
              Add this badge to your README.md file to show your commitment to maintaining high-quality
              GitHub workflows and practices.
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default BadgeGenerator; 