import React, { useState } from 'react';
import { motion } from 'framer-motion';

interface PersonalizationInputsProps {
  onSubmit: (inputs: PersonalizationData) => void;
  onSkip?: () => void;
  initialData?: PersonalizationData;
}

export interface PersonalizationData {
  teamSize: string;
  primaryLanguage: string;
  complianceNeeds: string[];
}

const PersonalizationInputs: React.FC<PersonalizationInputsProps> = ({ onSubmit, onSkip, initialData }) => {
  const [teamSize, setTeamSize] = useState<string>(initialData?.teamSize || '');
  const [primaryLanguage, setPrimaryLanguage] = useState<string>(initialData?.primaryLanguage || '');
  const [complianceNeeds, setComplianceNeeds] = useState<string[]>(initialData?.complianceNeeds || []);

  // List of common programming languages
  const languages = [
    'JavaScript/TypeScript',
    'Python',
    'Java',
    'C#',
    'PHP',
    'Go',
    'Ruby',
    'Rust',
    'C/C++',
    'Other'
  ];

  // Common compliance frameworks
  const complianceFrameworks = [
    'SOC2',
    'HIPAA',
    'GDPR',
    'ISO 27001',
    'PCI DSS'
  ];

  const handleComplianceChange = (framework: string) => {
    if (complianceNeeds.includes(framework)) {
      setComplianceNeeds(complianceNeeds.filter(item => item !== framework));
    } else {
      setComplianceNeeds([...complianceNeeds, framework]);
    }
  };

  const handleSubmit = () => {
    onSubmit({
      teamSize,
      primaryLanguage,
      complianceNeeds
    });
  };

  return (
    <motion.div 
      className="personalization-inputs"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h3>Customize Your Assessment</h3>
      <p className="help-text">
        Providing this information will help us tailor recommendations to your specific needs.
      </p>

      <div className="input-group">
        <label htmlFor="team-size">Team Size</label>
        <select 
          id="team-size" 
          value={teamSize} 
          onChange={(e) => setTeamSize(e.target.value)}
          className="select-input"
        >
          <option value="">Select team size</option>
          <option value="small">Small (1-10 developers)</option>
          <option value="medium">Medium (11-50 developers)</option>
          <option value="large">Large (50+ developers)</option>
        </select>
      </div>

      <div className="input-group">
        <label htmlFor="primary-language">Primary Programming Language</label>
        <select 
          id="primary-language" 
          value={primaryLanguage} 
          onChange={(e) => setPrimaryLanguage(e.target.value)}
          className="select-input"
        >
          <option value="">Select primary language</option>
          {languages.map(lang => (
            <option key={lang} value={lang}>{lang}</option>
          ))}
        </select>
      </div>

      <div className="input-group">
        <label>Compliance Requirements</label>
        <div className="checkbox-group">
          {complianceFrameworks.map(framework => (
            <div key={framework} className="checkbox-item">
              <input 
                type="checkbox" 
                id={`compliance-${framework}`} 
                checked={complianceNeeds.includes(framework)}
                onChange={() => handleComplianceChange(framework)}
              />
              <label htmlFor={`compliance-${framework}`}>{framework}</label>
            </div>
          ))}
        </div>
      </div>

      <motion.button 
        className="continue-button"
        onClick={handleSubmit}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        Continue to Assessment
      </motion.button>
    </motion.div>
  );
};

export default PersonalizationInputs; 