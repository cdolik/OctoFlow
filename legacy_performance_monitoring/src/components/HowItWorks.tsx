import React from 'react';
import './styles.css';

interface HowItWorksProps {
  isOpen: boolean;
  onClose: () => void;
}

const HowItWorks: React.FC<HowItWorksProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <h2>How OctoFlow Works</h2>
        
        <section className="process-section">
          <h3>1. Choose Your Stage</h3>
          <ul>
            <li><strong>Pre-Seed:</strong> 1-5 developers, focus on basic automation and security</li>
            <li><strong>Seed:</strong> 5-15 developers, emphasis on team collaboration and CI/CD</li>
            <li><strong>Series A:</strong> 15+ developers, advanced security and scalability focus</li>
          </ul>
        </section>

        <section className="process-section">
          <h3>2. Assessment Process</h3>
          <ul>
            <li>Stage-specific questions based on GitHub best practices</li>
            <li>Auto-save feature preserves your progress</li>
            <li>Summary review before final submission</li>
          </ul>
        </section>

        <section className="process-section">
          <h3>3. Scoring System</h3>
          <ul>
            <li>Scores range from 1-4 for each question</li>
            <li>Category weights vary by startup stage</li>
            <li>Benchmarks derived from successful GitHub implementations</li>
          </ul>
        </section>

        <section className="process-section">
          <h3>4. Recommendations</h3>
          <ul>
            <li>Prioritized action items based on score gaps</li>
            <li>Stage-appropriate implementation steps</li>
            <li>Links to relevant GitHub documentation</li>
          </ul>
        </section>

        <button className="close-button" onClick={onClose}>Got it!</button>
      </div>
    </div>
  );
};

export default HowItWorks;