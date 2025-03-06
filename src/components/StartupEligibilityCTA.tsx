import React, { useState, useEffect } from 'react';
import { getGitHubStartupsBenefits, getPartnersUrl } from '../utils/githubForStartups';
import { StartupStage } from '../data/questions';
import { User } from '../types/github';
import './EligibilityModule.css'; // We'll reuse the same styles

interface StartupEligibilityCTAProps {
  user?: User;
  stage: StartupStage;
}

const StartupEligibilityCTA: React.FC<StartupEligibilityCTAProps> = ({ user, stage }) => {
  const [expanded, setExpanded] = useState(false);
  const [isEligible, setIsEligible] = useState(false);
  
  // Determine eligibility based on user data
  useEffect(() => {
    if (user) {
      const eligible = 
        !user.isGitHubEnterpriseCustomer && // Not already on Enterprise
        user.seriesFundingStage !== 'Series C+' && // Series B or earlier
        user.isGitHubForStartupsPartner; // Affiliated with a partner
      
      setIsEligible(eligible);
    }
  }, [user]);
  
  // If we have user data but they're not eligible, don't show the badge
  if (user && !isEligible) {
    return null;
  }
  
  return (
    <div className="startup-eligibility-cta">
      <div className="cta-header" onClick={() => setExpanded(!expanded)}>
        <div className="cta-title">
          <i className="fas fa-rocket"></i>
          <h3>GitHub for Startups Benefits {stage && `(${stage})`}</h3>
          {isEligible && <span className="eligibility-badge">You may qualify!</span>}
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