import React, { useState } from 'react';
import { Category } from '../data/questions';

interface BadgeGeneratorProps {
  scores: Record<Category, number>;
  overallScore: number;
}

const BadgeGenerator: React.FC<BadgeGeneratorProps> = ({ scores, overallScore }) => {
  const [badgeType, setBadgeType] = useState<'shield' | 'flat' | 'plastic'>('shield');
  const [badgeColor, setBadgeColor] = useState<string>('blue');
  const [badgeSize, setBadgeSize] = useState<'small' | 'medium' | 'large'>('medium');
  const [showCopySuccess, setShowCopySuccess] = useState<boolean>(false);
  
  // Convert score to a 0-100 scale
  const displayScore = Math.round(overallScore * 25);
  
  // Get badge color based on score
  const getBadgeColor = (score: number): string => {
    if (score >= 80) return 'brightgreen';
    if (score >= 60) return 'green';
    if (score >= 40) return 'yellowgreen';
    if (score >= 20) return 'yellow';
    return 'orange';
  };
  
  // Generate badge URL
  const generateBadgeUrl = (): string => {
    const baseUrl = 'https://img.shields.io/badge';
    const label = 'GitHub%20Health';
    const message = `${displayScore}%25`;
    const color = badgeColor === 'auto' ? getBadgeColor(displayScore) : badgeColor;
    const style = badgeType === 'shield' ? '' : `?style=${badgeType}`;
    
    return `${baseUrl}/${label}-${message}-${color}${style}`;
  };
  
  // Generate markdown for badge
  const generateMarkdown = (): string => {
    const badgeUrl = generateBadgeUrl();
    return `[![GitHub Health](${badgeUrl})](https://github.com/cdolik/OctoFlow)`;
  };
  
  // Generate HTML for badge
  const generateHtml = (): string => {
    const badgeUrl = generateBadgeUrl();
    return `<a href="https://github.com/cdolik/OctoFlow"><img src="${badgeUrl}" alt="GitHub Health Score"></a>`;
  };
  
  // Copy to clipboard
  const copyToClipboard = (text: string): void => {
    navigator.clipboard.writeText(text).then(() => {
      setShowCopySuccess(true);
      setTimeout(() => setShowCopySuccess(false), 2000);
    });
  };
  
  return (
    <div className="badge-generator">
      <h3>Repository Badge</h3>
      <p>
        Show off your GitHub Health Score with a badge in your repository README.
      </p>
      
      <div className="badge-preview">
        <h4>Preview</h4>
        <img src={generateBadgeUrl()} alt="GitHub Health Score Badge" />
      </div>
      
      <div className="badge-options">
        <h4>Customize</h4>
        
        <div className="option-group">
          <label>
            Style:
            <select 
              value={badgeType} 
              onChange={(e) => setBadgeType(e.target.value as 'shield' | 'flat' | 'plastic')}
            >
              <option value="shield">Shield</option>
              <option value="flat">Flat</option>
              <option value="plastic">Plastic</option>
            </select>
          </label>
        </div>
        
        <div className="option-group">
          <label>
            Color:
            <select 
              value={badgeColor} 
              onChange={(e) => setBadgeColor(e.target.value)}
            >
              <option value="auto">Auto (based on score)</option>
              <option value="brightgreen">Bright Green</option>
              <option value="green">Green</option>
              <option value="yellowgreen">Yellow Green</option>
              <option value="yellow">Yellow</option>
              <option value="orange">Orange</option>
              <option value="red">Red</option>
              <option value="blue">Blue</option>
              <option value="blueviolet">Blue Violet</option>
              <option value="ff69b4">Pink</option>
            </select>
          </label>
        </div>
      </div>
      
      <div className="badge-code">
        <h4>Markdown</h4>
        <div className="code-block">
          <code>{generateMarkdown()}</code>
          <button 
            className="copy-button"
            onClick={() => copyToClipboard(generateMarkdown())}
          >
            Copy
          </button>
        </div>
        
        <h4>HTML</h4>
        <div className="code-block">
          <code>{generateHtml()}</code>
          <button 
            className="copy-button"
            onClick={() => copyToClipboard(generateHtml())}
          >
            Copy
          </button>
        </div>
      </div>
      
      {showCopySuccess && (
        <div className="copy-success">
          Copied to clipboard!
        </div>
      )}
      
      <div className="badge-instructions">
        <h4>How to Use</h4>
        <ol>
          <li>Copy the Markdown or HTML code above</li>
          <li>Paste it into your repository README.md file</li>
          <li>Commit and push the changes</li>
        </ol>
      </div>
    </div>
  );
};

export default BadgeGenerator; 