import React, { useState } from 'react';
import { StartupStage } from '../data/questions';
import { motion } from 'framer-motion';
import PersonalizationInputs, { PersonalizationData } from './PersonalizationInputs';

interface StageSelectorProps {
  onSelectStage: (stage: StartupStage, personalizationData?: PersonalizationData) => void;
  initialData?: PersonalizationData;
}

const StageSelector: React.FC<StageSelectorProps> = ({ onSelectStage, initialData }) => {
  const [selectedStage, setSelectedStage] = useState<StartupStage | null>(null);
  const [personalizationData, setPersonalizationData] = useState<PersonalizationData>(
    initialData || {
      teamSize: '',
      primaryLanguage: '',
      complianceNeeds: [],
    }
  );
  const [showPersonalization, setShowPersonalization] = useState(true); // Start with personalization visible
  const [showStages, setShowStages] = useState(false);

  const handleStageSelect = (stage: StartupStage) => {
    setSelectedStage(stage);
    if (personalizationData) {
      onSelectStage(stage, personalizationData);
    } else {
      onSelectStage(stage);
    }
  };

  const handlePersonalizationSubmit = (data: PersonalizationData) => {
    setPersonalizationData(data);
    setShowPersonalization(false);
    setShowStages(true);
  };

  const handleSkipPersonalization = () => {
    setShowPersonalization(false);
    setShowStages(true);
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.5,
        when: "beforeChildren",
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  if (showPersonalization) {
    return (
      <div className="stage-selector">
        <h1>OctoFlow GitHub Practices Assessment</h1>
        <p className="description">
          Evaluate your GitHub practices and get personalized recommendations based on your startup stage.
        </p>
        
        {/* Welcome message for first-time users */}
        <div className="welcome-message">
          <h3>👋 Welcome to OctoFlow!</h3>
          <p>
            This tool helps you assess your team's GitHub practices and provides actionable recommendations 
            tailored to your startup stage. Complete the assessment to receive:
          </p>
          <ul>
            <li>A visual maturity score across key GitHub practice areas</li>
            <li>Quick-win recommendations for immediate improvement</li>
            <li>A personalized improvement roadmap</li>
            <li>Access to curated GitHub documentation and resources</li>
          </ul>
        </div>
        
        <PersonalizationInputs 
          onSubmit={handlePersonalizationSubmit} 
          onSkip={handleSkipPersonalization}
          initialData={initialData}
        />
      </div>
    );
  }

  if (showStages) {
    return (
      <motion.div 
        className="stage-selector"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.h2 variants={itemVariants}>Select Your Assessment Stage</motion.h2>
        <motion.p variants={itemVariants} className="selector-description">
          Choose the stage that best matches your GitHub practices maturity level:
        </motion.p>
        
        <motion.div className="stage-buttons" variants={itemVariants}>
          {Object.values(StartupStage).map((stage) => (
            <motion.button
              key={stage}
              onClick={() => handleStageSelect(stage)}
              className={`stage-button ${selectedStage === stage ? 'selected' : ''}`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="stage-name">{stage}</div>
              <div className="stage-description">
                {stage === StartupStage.Beginner && 'Core GitHub features, basic collaboration, and setup'}
                {stage === StartupStage.Intermediate && 'Advanced Security, Copilot, Actions, and team scaling'}
                {stage === StartupStage.Advanced && 'Enterprise, Codespaces, AI, and cutting-edge features'}
              </div>
            </motion.button>
          ))}
        </motion.div>
        
        <motion.div variants={itemVariants} className="selector-description">
          <p>You can skip stages based on your current GitHub practices maturity.</p>
          <p>More advanced users might want to start at Stage 2 or 3.</p>
        </motion.div>
      </motion.div>
    );
  }

  return null;
};

export default StageSelector; 