import React from 'react';
import { motion } from 'framer-motion';

interface ActionButtonsProps {
  onViewHistory: () => void;
  onReset: () => void;
}

const ActionButtons: React.FC<ActionButtonsProps> = ({ onViewHistory, onReset }) => {
  return (
    <motion.div 
      className="action-buttons"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut", delay: 0.6 }}
    >
      <button onClick={onViewHistory} className="secondary-button">
        View History
      </button>
      <button onClick={onReset} className="primary-button">
        Start Over
      </button>
    </motion.div>
  );
};

export default ActionButtons; 