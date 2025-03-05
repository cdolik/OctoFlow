import React, { useState } from 'react';
import { getGitHubStartupsBenefits, getPartnersUrl } from '../utils/githubForStartups';
import './EligibilityModule.css'; // We'll reuse the same styles

const StartupEligibilityCTA: React.FC = () => {
  const [expanded, setExpanded] = useState(false);
  
  return (
    <div className="startup-eligibility-cta">
      <div className="cta-header" onClick={() => setExpanded(!expanded)}>
        <div className="cta-title">
          <i className="fas fa-rocket"></i>
          <h3>GitHub for Startups Benefits</h3>
        </div>
        <div className="cta-toggle">
          <i className={`fas fa-chevron-${expanded ? 'up' : 'down'}`}></i>
        </div>
      </div>
      
      {expanded && (
        <div className="cta-content">
          <div className="cta-description">
            <p>
              GitHub for Startups offers qualified startups exclusive benefits:
            </p>
            <ul className="benefits-list">
              {getGitHubStartupsBenefits().map((benefit, index) => (
                <li key={index}>{benefit}</li>
              ))}
            </ul>
          </div>
          
          <div className="cta-eligibility">
            <h4>Eligibility Requirements:</h4>
            <ul>
              <li>Series B or earlier</li>
              <li>New to GitHub Enterprise or GitHub Advanced Security</li>
              <li>Affiliated with an approved GitHub for Startups partner</li>
            </ul>
          </div>
          
          <div className="cta-actions">
            <a 
              href={getPartnersUrl()} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="secondary-button"
            >
              View Partners <i className="fas fa-external-link-alt"></i>
            </a>
            <a 
              href="https://github.com/enterprise/startups" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="primary-button"
            >
              Learn More <i className="fas fa-external-link-alt"></i>
            </a>
          </div>
        </div>
      )}
    </div>
  );
};

export default StartupEligibilityCTA; 