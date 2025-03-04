import React, { useState } from 'react';
import { Category } from '../data/questions';
import { calculateEligibility, EligibilityLevel, githubStartupsTiers } from '../utils/eligibility';

interface EligibilityModuleProps {
  categoryScores: Record<Category, number>;
  companyInfo?: {
    employeeCount?: number;
    devCount?: number;
    fundingStage?: string;
    usingGitHubEnterprise?: boolean;
    usingAdvancedSecurity?: boolean;
    timeWithGitHub?: string;
  };
}

const EligibilityModule: React.FC<EligibilityModuleProps> = ({ categoryScores, companyInfo }) => {
  const [expandedTier, setExpandedTier] = useState<string | null>(null);
  const [showEligibilityInfo, setShowEligibilityInfo] = useState(false);
  
  const { level, eligibleFor, improvements, isEligibleForProgram, ineligibilityReasons } = calculateEligibility(categoryScores, companyInfo);
  
  // Get color based on eligibility level
  const getLevelColor = (level: EligibilityLevel) => {
    switch (level) {
      case EligibilityLevel.NotEligible:
        return 'var(--color-danger)';
      case EligibilityLevel.Eligible:
        return 'var(--color-success)';
      default:
        return 'var(--color-text)';
    }
  };
  
  // Get GitHub for Startups program URL
  const getGitHubStartupsUrl = () => {
    return 'https://github.com/enterprise/startups';
  };
  
  // Get GitHub documentation URL for a specific category
  const getGitHubDocUrl = (category: Category) => {
    switch (category) {
      case Category.Security:
        return 'https://docs.github.com/en/code-security';
      case Category.Collaboration:
        return 'https://docs.github.com/en/pull-requests';
      case Category.Automation:
        return 'https://docs.github.com/en/actions';
      case Category.Testing:
        return 'https://docs.github.com/en/actions/automating-builds-and-tests';
      case Category.Compliance:
        return 'https://docs.github.com/en/github/site-policy';
      case Category.Documentation:
        return 'https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-readmes';
      default:
        return 'https://docs.github.com';
    }
  };
  
  // Toggle expanded tier
  const toggleTier = (tierName: string) => {
    if (expandedTier === tierName) {
      setExpandedTier(null);
    } else {
      setExpandedTier(tierName);
    }
  };
  
  return (
    <div className="eligibility-module">
      <div className="eligibility-header">
        <h2>GitHub for Startups Eligibility</h2>
        <div 
          className="info-icon" 
          onClick={() => setShowEligibilityInfo(!showEligibilityInfo)}
          title="Learn more about GitHub for Startups program"
        >
          <i className="fas fa-info-circle"></i>
        </div>
      </div>
      
      {showEligibilityInfo && (
        <div className="eligibility-info">
          <p>
            The GitHub for Startups program offers qualified startups up to 20 free seats on GitHub Enterprise for one year and 50% off year two.
            To qualify, startups must be less than 5 years old, have fewer than 100 employees, be funded (pre-seed to Series B), and not have previously received GitHub Enterprise credits.
          </p>
          <a 
            href={getGitHubStartupsUrl()} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="github-link"
          >
            Learn more about GitHub for Startups <i className="fas fa-external-link-alt"></i>
          </a>
        </div>
      )}
      
      <div className="eligibility-status">
        <div className="eligibility-level" style={{ color: getLevelColor(level) }}>
          <span className="level-label">Status:</span>
          <span className="level-value">{level}</span>
        </div>
        
        {!isEligibleForProgram && ineligibilityReasons.length > 0 && (
          <div className="eligibility-warning">
            <i className="fas fa-exclamation-triangle"></i>
            <div className="ineligibility-reasons">
              <p>Your company may not meet the requirements for the GitHub for Startups program:</p>
              <ul>
                {ineligibilityReasons.map((reason, index) => (
                  <li key={index}>{reason}</li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
      
      <div className="eligibility-tiers">
        <h3>Program Benefits</h3>
        {githubStartupsTiers.map((tier) => {
          const isEligible = eligibleFor.some(e => e.name === tier.name);
          
          return (
            <div 
              key={tier.name}
              className={`eligibility-tier ${isEligible ? 'eligible' : ''}`}
            >
              <div className="tier-header" onClick={() => toggleTier(tier.name)}>
                <div className="tier-status">
                  {isEligible ? (
                    <i className="fas fa-check-circle"></i>
                  ) : (
                    <i className="fas fa-times-circle"></i>
                  )}
                </div>
                <h4>{tier.name}</h4>
                <div className="tier-toggle">
                  <i className={`fas fa-chevron-${expandedTier === tier.name ? 'up' : 'down'}`}></i>
                </div>
              </div>
              
              {expandedTier === tier.name && (
                <div className="tier-details">
                  <p className="tier-description">{tier.description}</p>
                  
                  <div className="tier-benefits">
                    <h5>Benefits:</h5>
                    <ul>
                      {tier.benefits.map((benefit, index) => (
                        <li key={index}>{benefit}</li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="tier-requirements">
                    <h5>Requirements:</h5>
                    <ul>
                      <li>
                        Overall Score: {tier.overallMinimum.toFixed(1)}
                        {categoryScores && (
                          <span className={Object.values(categoryScores).reduce((sum, score) => sum + score, 0) / 
                            Object.values(categoryScores).length >= tier.overallMinimum ? 'met' : 'not-met'}>
                            {Object.values(categoryScores).reduce((sum, score) => sum + score, 0) / 
                              Object.values(categoryScores).length >= tier.overallMinimum ? ' ✓' : ' ✗'}
                          </span>
                        )}
                      </li>
                      {Object.entries(tier.minimumScores).map(([category, score]) => (
                        <li key={category}>
                          {category}: {score.toFixed(1)}
                          {categoryScores && (
                            <span className={categoryScores[category as Category] >= score ? 'met' : 'not-met'}>
                              {categoryScores[category as Category] >= score ? ' ✓' : ' ✗'}
                            </span>
                          )}
                          <a 
                            href={getGitHubDocUrl(category as Category)} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="doc-link"
                            title={`View GitHub documentation for ${category}`}
                          >
                            <i className="fas fa-book"></i>
                          </a>
                        </li>
                      ))}
                      <li>
                        Company Stage: Series B or earlier
                        {companyInfo && companyInfo.fundingStage && (
                          <span className={['pre-seed', 'seed', 'series a', 'series b', 'bootstrapped'].includes(companyInfo.fundingStage.toLowerCase()) ? 'met' : 'not-met'}>
                            {['pre-seed', 'seed', 'series a', 'series b', 'bootstrapped'].includes(companyInfo.fundingStage.toLowerCase()) ? ' ✓' : ' ✗'}
                          </span>
                        )}
                      </li>
                      <li>
                        Team Size: 100 employees or fewer
                        {companyInfo && companyInfo.employeeCount && (
                          <span className={companyInfo.employeeCount <= 100 ? 'met' : 'not-met'}>
                            {companyInfo.employeeCount <= 100 ? ' ✓' : ' ✗'}
                          </span>
                        )}
                      </li>
                      <li>
                        New to GitHub Enterprise/Advanced Security
                        {companyInfo && (
                          <span className={
                            (!companyInfo.usingGitHubEnterprise && !companyInfo.usingAdvancedSecurity) || 
                            (companyInfo.timeWithGitHub === 'less than 6 months') ? 'met' : 'not-met'
                          }>
                            {(!companyInfo.usingGitHubEnterprise && !companyInfo.usingAdvancedSecurity) || 
                              (companyInfo.timeWithGitHub === 'less than 6 months') ? ' ✓' : ' ✗'}
                          </span>
                        )}
                      </li>
                    </ul>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
      
      {improvements.length > 0 && (
        <div className="improvement-suggestions">
          <h3>Improvement Suggestions</h3>
          <ul>
            {improvements.map((improvement, index) => (
              <li key={index} className="improvement-item">
                <div className="improvement-category">
                  <span>{improvement.category}</span>
                  <a 
                    href={getGitHubDocUrl(improvement.category)} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="doc-link"
                    title={`View GitHub documentation for ${improvement.category}`}
                  >
                    <i className="fas fa-book"></i>
                  </a>
                </div>
                <div className="improvement-scores">
                  <span className="current-score">Current: {improvement.currentScore.toFixed(1)}</span>
                  <span className="required-score">Required: {improvement.requiredScore.toFixed(1)}</span>
                </div>
                <div className="improvement-tier">
                  For: {improvement.tier}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
      
      <div className="eligibility-footer">
        <div className="eligibility-cta">
          <h4>Ready to apply for GitHub for Startups?</h4>
          <p>
            If you're eligible, take the next step and apply for the GitHub for Startups program to access
            exclusive benefits for your startup.
          </p>
          <div className="cta-buttons">
            <a 
              href={getGitHubStartupsUrl()} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="apply-button"
            >
              Apply to GitHub for Startups <i className="fas fa-external-link-alt"></i>
            </a>
            <a 
              href="https://github.com/enterprise/startups#faq" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="learn-more-button"
            >
              Read FAQ <i className="fas fa-question-circle"></i>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EligibilityModule; 