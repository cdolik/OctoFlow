import React, { useState } from 'react';
import { User } from '../types/github';
import { 
  getEligibilityCriteria, 
  getGitHubStartupsBenefits, 
  getPartnersUrl, 
  getDisclaimerMessage 
} from '../utils/githubForStartups';
import './EligibilityModule.css';

interface EligibilityModuleProps {
  user?: User;
}

// Steps in the eligibility wizard
enum WizardStep {
  Intro,
  FundingStage,
  EnterpriseStatus,
  PartnerAffiliation,
  Results
}

const EligibilityModule: React.FC<EligibilityModuleProps> = ({ user }) => {
  const [currentStep, setCurrentStep] = useState<WizardStep>(WizardStep.Intro);
  const [fundingStage, setFundingStage] = useState<string>('');
  const [isEnterpriseCustomer, setIsEnterpriseCustomer] = useState<boolean | null>(null);
  const [hasPartnerAffiliation, setHasPartnerAffiliation] = useState<boolean | null>(null);
  const [showBenefits, setShowBenefits] = useState<boolean>(false);

  // Pre-filled answers if user data is available
  React.useEffect(() => {
    if (user) {
      setFundingStage(user.seriesFundingStage);
      setIsEnterpriseCustomer(user.isGitHubEnterpriseCustomer);
      setHasPartnerAffiliation(user.isGitHubForStartupsPartner);
    }
  }, [user]);

  // Check if eligible based on current answers
  const isEligible = () => {
    return (
      fundingStage !== 'Series C+' &&
      isEnterpriseCustomer === false &&
      hasPartnerAffiliation === true
    );
  };

  // Get ineligibility reasons based on current answers
  const getIneligibilityReasonsFromAnswers = () => {
    const reasons: string[] = [];
    
    if (fundingStage === 'Series C+') {
      reasons.push("Series C or later companies are not eligible (must be Series B or earlier)");
    }
    
    if (isEnterpriseCustomer === true) {
      reasons.push("Already using GitHub Enterprise or GitHub Advanced Security");
    }
    
    if (hasPartnerAffiliation === false) {
      reasons.push("Not affiliated with an approved GitHub for Startups partner");
    }
    
    return reasons;
  };

  // Progress to the next step
  const nextStep = () => {
    setCurrentStep(prev => prev + 1);
  };

  // Go back to the previous step
  const prevStep = () => {
    setCurrentStep(prev => prev - 1);
  };

  // Reset the wizard
  const resetWizard = () => {
    setCurrentStep(WizardStep.Intro);
    setFundingStage('');
    setIsEnterpriseCustomer(null);
    setHasPartnerAffiliation(null);
  };

  // Render the current step
  const renderStep = () => {
    switch (currentStep) {
      case WizardStep.Intro:
        return renderIntroStep();
      case WizardStep.FundingStage:
        return renderFundingStageStep();
      case WizardStep.EnterpriseStatus:
        return renderEnterpriseStatusStep();
      case WizardStep.PartnerAffiliation:
        return renderPartnerAffiliationStep();
      case WizardStep.Results:
        return renderResultsStep();
      default:
        return renderIntroStep();
    }
  };

  // Step 1: Introduction
  const renderIntroStep = () => (
    <div className="wizard-step">
      <h3>GitHub for Startups Eligibility Checker</h3>
      <p>
        Find out if your startup qualifies for GitHub for Startups to receive benefits 
        including free GitHub Enterprise seats and discounted GitHub Advanced Security.
      </p>
      <p>
        <strong>Quick check:</strong> To qualify, you need to meet all these criteria:
      </p>
      <ul className="eligibility-criteria-list">
        {getEligibilityCriteria().map((criteria, index) => (
          <li key={index}>{criteria}</li>
        ))}
      </ul>
      <div className="benefits-toggle">
        <button 
          onClick={() => setShowBenefits(!showBenefits)}
          className="text-button"
        >
          {showBenefits ? 'Hide benefits' : 'Show benefits'} ↓
        </button>
      </div>
      
      {showBenefits && (
        <div className="benefits-section">
          <h4>Benefits</h4>
          <ul className="benefits-list">
            {getGitHubStartupsBenefits().map((benefit, index) => (
              <li key={index}>{benefit}</li>
            ))}
            <li><strong>Note:</strong> For more than 20 seats, you pay full price for the additional seats.</li>
          </ul>
        </div>
      )}
      
      <div className="wizard-nav">
        <button onClick={nextStep} className="primary-button">
          Start Eligibility Check
        </button>
      </div>
    </div>
  );

  // Step 2: Funding Stage
  const renderFundingStageStep = () => (
    <div className="wizard-step">
      <h3>Step 1: Funding Stage</h3>
      <p>What is your startup&apos;s current funding stage?</p>
      
      <div className="option-group">
        <div 
          className={`wizard-option ${fundingStage === 'Pre-seed' ? 'selected' : ''}`}
          onClick={() => setFundingStage('Pre-seed')}
        >
          <div className="option-label">Pre-seed</div>
        </div>
        <div 
          className={`wizard-option ${fundingStage === 'Seed' ? 'selected' : ''}`}
          onClick={() => setFundingStage('Seed')}
        >
          <div className="option-label">Seed</div>
        </div>
        <div 
          className={`wizard-option ${fundingStage === 'Series A' ? 'selected' : ''}`}
          onClick={() => setFundingStage('Series A')}
        >
          <div className="option-label">Series A</div>
        </div>
        <div 
          className={`wizard-option ${fundingStage === 'Series B' ? 'selected' : ''}`}
          onClick={() => setFundingStage('Series B')}
        >
          <div className="option-label">Series B</div>
        </div>
        <div 
          className={`wizard-option ${fundingStage === 'Series C+' ? 'selected' : ''}`}
          onClick={() => setFundingStage('Series C+')}
        >
          <div className="option-label">Series C or later</div>
        </div>
      </div>
      
      <div className="wizard-nav">
        <button onClick={prevStep} className="secondary-button">
          Back
        </button>
        <button 
          onClick={nextStep} 
          className="primary-button"
          disabled={!fundingStage}
        >
          Next
        </button>
      </div>
    </div>
  );

  // Step 3: GitHub Enterprise Status
  const renderEnterpriseStatusStep = () => (
    <div className="wizard-step">
      <h3>Step 2: GitHub Enterprise Status</h3>
      <p>Are you currently using GitHub Enterprise or GitHub Advanced Security?</p>
      
      <div className="option-group">
        <div 
          className={`wizard-option ${isEnterpriseCustomer === true ? 'selected' : ''}`}
          onClick={() => setIsEnterpriseCustomer(true)}
        >
          <div className="option-label">Yes, we&apos;re currently using it</div>
        </div>
        <div 
          className={`wizard-option ${isEnterpriseCustomer === false ? 'selected' : ''}`}
          onClick={() => setIsEnterpriseCustomer(false)}
        >
          <div className="option-label">No, we&apos;re not using it yet</div>
        </div>
      </div>
      
      <div className="wizard-nav">
        <button onClick={prevStep} className="secondary-button">
          Back
        </button>
        <button 
          onClick={nextStep} 
          className="primary-button"
          disabled={isEnterpriseCustomer === null}
        >
          Next
        </button>
      </div>
    </div>
  );

  // Step 4: Partner Affiliation
  const renderPartnerAffiliationStep = () => (
    <div className="wizard-step">
      <h3>Step 3: Partner Affiliation</h3>
      <p>
        Are you affiliated with a GitHub for Startups partner? 
        (incubator, accelerator, or VC firm on the partners list)
      </p>
      
      <div className="partner-info">
        <a 
          href={getPartnersUrl()} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="partner-link"
        >
          Check the GitHub for Startups partners list <i className="fas fa-external-link-alt"></i>
        </a>
      </div>
      
      <div className="option-group">
        <div 
          className={`wizard-option ${hasPartnerAffiliation === true ? 'selected' : ''}`}
          onClick={() => setHasPartnerAffiliation(true)}
        >
          <div className="option-label">Yes, we&apos;re affiliated with a partner</div>
        </div>
        <div 
          className={`wizard-option ${hasPartnerAffiliation === false ? 'selected' : ''}`}
          onClick={() => setHasPartnerAffiliation(false)}
        >
          <div className="option-label">No, we&apos;re not affiliated with any partner</div>
        </div>
      </div>
      
      <div className="wizard-nav">
        <button onClick={prevStep} className="secondary-button">
          Back
        </button>
        <button 
          onClick={nextStep} 
          className="primary-button"
          disabled={hasPartnerAffiliation === null}
        >
          See Results
        </button>
      </div>
    </div>
  );

  // Step 5: Results
  const renderResultsStep = () => {
    const eligible = isEligible();
    const ineligibilityReasons = getIneligibilityReasonsFromAnswers();
    
    return (
      <div className="eligibility-results">
        <h3>GitHub for Startups Status</h3>
        
        <div className="eligibility-status">
          {eligible ? (
            <>
              <div className="eligibility-level">
                <div className="level-label">Status:</div>
                <div className="level-value eligible">Eligible</div>
              </div>
              <p>
                Based on your answers, your startup qualifies for the GitHub for Startups program.
                Complete your application to receive benefits.
              </p>
            </>
          ) : (
            <>
              <div className="eligibility-level">
                <div className="level-label">Status:</div>
                <div className="level-value not-eligible">Not Currently Eligible</div>
              </div>
              <div className="eligibility-warning">
                <i className="fas fa-info-circle"></i>
                <p>
                  Based on your answers, your startup may not qualify for the GitHub for Startups program at this time.
                </p>
              </div>
            </>
          )}
        </div>
        
        {!eligible && ineligibilityReasons.length > 0 && (
          <div className="ineligibility-reasons">
            <h4>Reason{ineligibilityReasons.length > 1 ? 's' : ''}:</h4>
            <ul>
              {ineligibilityReasons.map((reason, index) => (
                <li key={index}>{reason}</li>
              ))}
            </ul>
            <p>
              Note that you can still use GitHub and all of its features. 
              The GitHub for Startups program offers specific benefits for qualifying startups.
            </p>
          </div>
        )}
        
        {eligible && (
          <div className="eligibility-cta">
            <h4>Next Steps</h4>
            <p>
              Complete your application on the GitHub for Startups portal to receive your benefits.
            </p>
            <div className="cta-buttons">
              <a 
                href={getPartnersUrl()} 
                target="_blank" 
                rel="noopener noreferrer"
                className="apply-button"
              >
                <i className="fas fa-external-link-alt"></i>
                Apply Now
              </a>
              
              <button 
                onClick={resetWizard}
                className="learn-more-button"
              >
                <i className="fas fa-redo"></i>
                Start Over
              </button>
            </div>
          </div>
        )}
        
        {!eligible && (
          <div className="eligibility-cta">
            <h4>Other GitHub Options</h4>
            <p>
              While you may not qualify for the GitHub for Startups program, 
              GitHub offers many features for teams of all sizes.
            </p>
            <div className="cta-buttons">
              <a 
                href="https://github.com/pricing" 
                target="_blank" 
                rel="noopener noreferrer"
                className="apply-button"
              >
                <i className="fas fa-external-link-alt"></i>
                Explore GitHub Plans
              </a>
              
              <button 
                onClick={resetWizard}
                className="learn-more-button"
              >
                <i className="fas fa-redo"></i>
                Start Over
              </button>
            </div>
          </div>
        )}
        
        <div className="eligibility-disclaimer">
          <p>
            <small>
              {getDisclaimerMessage()}
            </small>
          </p>
        </div>
      </div>
    );
  };

  return (
    <div className="eligibility-module">
      <div className="disclaimer">
        <p><strong>Disclaimer:</strong> {getDisclaimerMessage()}</p>
      </div>
      
      <div className="eligibility-wizard">
        {renderStep()}
      </div>
    </div>
  );
};

export default EligibilityModule; 