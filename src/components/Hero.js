import React from 'react';
import { useNavigate } from 'react-router-dom';
import './styles.css';

const ValueStack = () => (
  <div className="value-stack">
    <div className="value-stack-item">
      <h3>🚀 2x Deployment Speed</h3>
      <p>Ship faster with optimized GitHub workflows</p>
    </div>
    <div className="value-stack-item">
      <h3>🔒 Enterprise Security</h3>
      <p>Bank-grade security at startup costs</p>
    </div>
    <div className="value-stack-item">
      <h3>💰 Cost Optimization</h3>
      <p>Save 40%+ on infrastructure costs</p>
    </div>
  </div>
);

const Hero = () => {
  const navigate = useNavigate();

  return (
    <section className="hero">
      <div className="hero-content">
        <h1>🚀 Ship Like a GitHub Pro</h1>
        <h2>Benchmark Your Engineering Health</h2>
        <ValueStack />
        <button 
          className="cta-button"
          onClick={() => navigate('/assessment')}
        >
          Start Assessment
        </button>
      </div>
    </section>
  );
};

export default Hero;