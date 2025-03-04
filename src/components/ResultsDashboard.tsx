import React, { useState, useEffect } from 'react';
import { StartupStage, Category, calculateCategoryScores, questions } from '../data/questions';
import ExportShare from './ExportShare';
import HistoryDashboard from './HistoryDashboard';
import EligibilityModule from './EligibilityModule';
import ScoresSummary from './ScoresSummary';
import RecommendationsList from './RecommendationsList';
import ActionButtons from './ActionButtons';
import Settings from './Settings';
import { motion } from 'framer-motion';
import { saveAssessmentToHistory } from '../utils/storage';
import BadgeGenerator from './BadgeGenerator';
import ImprovementRoadmap from './ImprovementRoadmap';

// We'll use React.lazy to load the Chart.js components only when needed
const RadarChart = React.lazy(() => import('./RadarChart'));

interface ResultsDashboardProps {
  stage: StartupStage;
  responses: Record<string, number>;
  onReset: () => void;
}

interface RecommendationItem {
  category: Category;
  text: string;
  docsUrl: string;
  priority: 'high' | 'medium' | 'low';
}

const ResultsDashboard: React.FC<ResultsDashboardProps> = ({ stage, responses, onReset }) => {
  const [categoryScores, setCategoryScores] = useState<Record<Category, number>>({} as Record<Category, number>);
  const [recommendations, setRecommendations] = useState<RecommendationItem[]>([]);
  const [isChartLoaded, setIsChartLoaded] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [companyInfo, setCompanyInfo] = useState<{
    employeeCount?: number;
    devCount?: number;
    fundingStage?: string;
    usingGitHubEnterprise?: boolean;
    usingAdvancedSecurity?: boolean;
    timeWithGitHub?: string;
  }>({});
  const [activeTab, setActiveTab] = useState<'scores' | 'eligibility' | 'badge'>('scores');

  // Calculate scores and generate recommendations when component mounts
  useEffect(() => {
    const scores = calculateCategoryScores(responses);
    setCategoryScores(scores);
    
    // Generate recommendations based on lowest scoring categories
    const lowScoreThreshold = 2.5; // Scores below this will generate recommendations
    const newRecommendations: RecommendationItem[] = [];
    
    // Get low-scoring questions
    const stageQuestionList = questions[stage];
    stageQuestionList.forEach(question => {
      const score = responses[question.id] || 0;
      if (score <= lowScoreThreshold) {
        newRecommendations.push({
          category: question.category,
          text: `Improve: ${question.text}`,
          docsUrl: question.githubDocsUrl,
          priority: score <= 1 ? 'high' : score <= 2 ? 'medium' : 'low'
        });
      }
    });
    
    // Sort by priority
    newRecommendations.sort((a, b) => {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
    
    setRecommendations(newRecommendations);
    
    // Simulate chart loading (in a real app, this would be handled by React.Suspense)
    setTimeout(() => setIsChartLoaded(true), 500);
    
    // Save assessment result to history
    saveAssessmentToHistory(stage, responses, scores);
  }, [stage, responses]);
  
  // For the MVP, we'll render a simple placeholder while waiting for Chart.js
  const renderChartPlaceholder = () => (
    <div className="chart-placeholder">
      <p>Loading chart...</p>
    </div>
  );
  
  // Animation variants for sections
  const sectionVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.5,
        ease: "easeOut"
      }
    }
  };
  
  const handleViewHistory = () => {
    setShowHistory(true);
  };
  
  const handleCloseHistory = () => {
    setShowHistory(false);
  };
  
  const handleOpenSettings = () => {
    setShowSettings(true);
  };
  
  const handleCloseSettings = () => {
    setShowSettings(false);
  };

  // Handle company info update
  const handleCompanyInfoUpdate = (info: {
    employeeCount?: number;
    devCount?: number;
    fundingStage?: string;
    usingGitHubEnterprise?: boolean;
    usingAdvancedSecurity?: boolean;
    timeWithGitHub?: string;
  }) => {
    setCompanyInfo(info);
  };

  // Calculate overall score
  const calculateOverallScore = (): number => {
    const scores = Object.values(categoryScores);
    if (scores.length === 0) return 0;
    return scores.reduce((sum, score) => sum + score, 0) / scores.length;
  };

  return (
    <>
      <div className="results-dashboard">
        <motion.h2
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {stage} Assessment Results
        </motion.h2>
        
        <motion.div 
          className="results-summary"
          variants={sectionVariants}
          initial="hidden"
          animate="visible"
        >
          <p>
            Your assessment is complete! See how your GitHub practices measure up and 
            review your recommendations below.
          </p>
          
          <div className="settings-link">
            <button onClick={handleOpenSettings} className="settings-button">
              ⚙️ Settings
            </button>
          </div>
        </motion.div>
        
        <motion.div 
          className="results-tabs"
          variants={sectionVariants}
          initial="hidden"
          animate="visible"
        >
          <div className="tab-buttons">
            <button 
              className={`tab-button ${activeTab === 'scores' ? 'active' : ''}`}
              onClick={() => setActiveTab('scores')}
            >
              Scores & Recommendations
            </button>
            <button 
              className={`tab-button ${activeTab === 'eligibility' ? 'active' : ''}`}
              onClick={() => setActiveTab('eligibility')}
            >
              GitHub for Startups Eligibility
            </button>
            <button 
              className={`tab-button ${activeTab === 'badge' ? 'active' : ''}`}
              onClick={() => setActiveTab('badge')}
            >
              Repository Badge
            </button>
          </div>
          
          {activeTab === 'scores' && (
            <>
              <motion.div 
                className="results-chart"
                variants={sectionVariants}
                initial="hidden"
                animate="visible"
                transition={{ delay: 0.1 }}
              >
                {isChartLoaded ? (
                  <React.Suspense fallback={renderChartPlaceholder()}>
                    <RadarChart categoryScores={categoryScores} />
                  </React.Suspense>
                ) : (
                  renderChartPlaceholder()
                )}
              </motion.div>
              
              {/* Use the ScoresSummary component */}
              <ScoresSummary categoryScores={categoryScores} />
              
              {/* Use the RecommendationsList component */}
              <RecommendationsList recommendations={recommendations} />
              
              {/* Add the ExportShare component */}
              <motion.div
                variants={sectionVariants}
                initial="hidden"
                animate="visible"
                transition={{ delay: 0.5 }}
              >
                <ExportShare 
                  stage={stage}
                  categoryScores={categoryScores}
                  recommendations={recommendations}
                />
              </motion.div>
            </>
          )}
          
          {activeTab === 'eligibility' && (
            <>
              <motion.div
                variants={sectionVariants}
                initial="hidden"
                animate="visible"
                transition={{ delay: 0.1 }}
              >
                <EligibilityModule categoryScores={categoryScores} companyInfo={companyInfo} />
              </motion.div>
              
              <motion.div
                variants={sectionVariants}
                initial="hidden"
                animate="visible"
                transition={{ delay: 0.2 }}
              >
                <ImprovementRoadmap categoryScores={categoryScores} companyInfo={companyInfo} />
              </motion.div>
            </>
          )}
          
          {activeTab === 'badge' && (
            <motion.div
              variants={sectionVariants}
              initial="hidden"
              animate="visible"
              transition={{ delay: 0.1 }}
            >
              <BadgeGenerator scores={categoryScores} overallScore={calculateOverallScore()} />
            </motion.div>
          )}
        </motion.div>
        
        {/* Use the ActionButtons component */}
        <ActionButtons 
          onViewHistory={handleViewHistory} 
          onReset={onReset} 
        />
      </div>
      
      {showHistory && <HistoryDashboard onClose={handleCloseHistory} />}
      {showSettings && <Settings onClose={handleCloseSettings} onCompanyInfoUpdate={handleCompanyInfoUpdate} companyInfo={companyInfo} />}
    </>
  );
};

export default ResultsDashboard; 