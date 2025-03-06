import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { StartupStage, Category } from '../data/questions';
import MaturityScoreCard from './MaturityScoreCard';
import QuickWinRecommendations from './QuickWinRecommendations';
import ResourceHub from './ResourceHub';
import ExportShare from './ExportShare';
import StartupEligibilityCTA from './StartupEligibilityCTA';
import ImprovementRoadmap from './ImprovementRoadmap';
import { User } from '../services/githubApi';
import { fetchCurrentUser } from '../services/githubApi';
import { saveAssessmentToHistory } from '../utils/historyUtils';
import { questions } from '../data/questions';
import { PersonalizationData } from './PersonalizationInputs';
import LoadingSkeleton from './LoadingSkeleton';
import { useNavigate } from 'react-router-dom';

// We'll use React.lazy to load the Chart.js components only when needed
const RadarChart = React.lazy(() => import('./RadarChart'));

interface ResultsDashboardProps {
  stage: StartupStage;
  allResponses: Record<StartupStage, Record<string, number>>;
  onReset: () => void;
  personalizationData?: PersonalizationData;
}

interface RecommendationItem {
  category: Category;
  text: string;
  docsUrl: string;
  priority: 'high' | 'medium' | 'low';
}

// Memoize the MaturityScoreCard component to prevent unnecessary re-renders
const MemoizedMaturityScoreCard = React.memo(MaturityScoreCard);

// Memoize the QuickWinRecommendations component to prevent unnecessary re-renders
const MemoizedQuickWinRecommendations = React.memo(QuickWinRecommendations);

// Memoize the ResourceHub component to prevent unnecessary re-renders
const MemoizedResourceHub = React.memo(ResourceHub);

const ResultsDashboard: React.FC<ResultsDashboardProps> = ({ 
  stage, 
  allResponses,
  onReset,
  personalizationData 
}) => {
  const [currentStage, setCurrentStage] = useState<StartupStage>(stage);
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [showHistory, setShowHistory] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [categoryScores, setCategoryScores] = useState<Record<Category, number>>({} as Record<Category, number>);
  const [recommendations, setRecommendations] = useState<RecommendationItem[]>([]);
  const [isChartLoaded, setIsChartLoaded] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | undefined>(undefined);
  const [overallScore, setOverallScore] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

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

  // Track available stages (ones with responses)
  const availableStages = Object.entries(allResponses)
    .filter(([_, responses]) => Object.keys(responses).length > 0)
    .map(([stage, _]) => stage as StartupStage);
  
  useEffect(() => {
    // When props.stage changes, update the current stage
    setCurrentStage(stage);
  }, [stage]);
  
  // Get responses for current stage
  const currentResponses = allResponses[currentStage] || {};
  
  // Get stage display name
  const getStageDisplayName = (stage: StartupStage): string => {
    switch (stage) {
      case StartupStage.Beginner: return 'Beginner';
      case StartupStage.Intermediate: return 'Intermediate';
      case StartupStage.Advanced: return 'Advanced';
      default: return stage;
    }
  };
  
  // Use useCallback for functions to prevent unnecessary re-creation
  const handleStageChange = useCallback((newStage: StartupStage) => {
    setCurrentStage(newStage);
    // Reset active tab when changing stages
    setActiveTab('overview');
  }, []);
  
  // Calculate scores and generate recommendations when component mounts or stage changes
  useEffect(() => {
    setIsLoading(true);
    
    const currentResponses = allResponses[currentStage];
    if (!currentResponses || Object.keys(currentResponses).length === 0) {
      setIsLoading(false);
      return;
    }
    
    const scores = calculateCategoryScores(currentResponses);
    setCategoryScores(scores);
    
    // Calculate overall score
    const scoreValues = Object.values(scores);
    const avgScore = scoreValues.reduce((sum, score) => sum + score, 0) / scoreValues.length;
    setOverallScore(avgScore);
    
    // Generate recommendations based on lowest scoring categories
    const lowScoreThreshold = 2.5; // Scores below this will generate recommendations
    const newRecommendations: RecommendationItem[] = [];
    
    // Get low-scoring questions
    const stageQuestionList = questions[currentStage];
    stageQuestionList.forEach(question => {
      const score = currentResponses[question.id] || 0;
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
    
    // Simulate loading time for better UX
    setTimeout(() => {
      setIsLoading(false);
    }, 800);
    
    // Save assessment result to history
    saveAssessmentToHistory(currentStage, currentResponses, scores);
  }, [currentStage, allResponses]);
  
  // Fetch user data for eligibility check
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // In a real app, you would fetch this from your backend
        // This is a placeholder for demonstration
        const demoUser: User = {
          id: 'demo-user',
          login: 'demo-user',
          name: 'Demo User',
          email: 'demo@example.com',
          isGitHubEnterpriseCustomer: false,
          seriesFundingStage: 'Series A',
          isGitHubForStartupsPartner: true,
          employeeCount: 50,
          companyAgeYears: 2
        };
        
        setCurrentUser(demoUser);
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };
    
    fetchUserData();
  }, []);
  
  // Validate that we have actual responses to display
  useEffect(() => {
    // Check if we have any responses for any stage
    const hasAnyResponses = Object.values(allResponses).some(
      stageResponses => Object.keys(stageResponses).length > 0
    );
    
    if (!hasAnyResponses) {
      // No responses found, redirect to home
      navigate('/');
    }
  }, [allResponses, navigate]);
  
  // For the MVP, we'll render a simple placeholder while waiting for Chart.js
  const renderChartPlaceholder = () => (
    <div className="chart-placeholder">
      <p>Loading chart...</p>
    </div>
  );
  
  const handleViewHistory = useCallback(() => {
    setShowHistory(true);
  }, []);
  
  const handleCloseHistory = useCallback(() => {
    setShowHistory(false);
  }, []);
  
  const handleOpenSettings = useCallback(() => {
    setShowSettings(true);
  }, []);
  
  const handleCloseSettings = useCallback(() => {
    setShowSettings(false);
  }, []);

  // Use useMemo for expensive calculations
  const getLowScoringCategories = useMemo(() => {
    // Get categories with scores below 2.5
    const lowCategories: Category[] = [];
    Object.entries(categoryScores).forEach(([category, score]) => {
      if (score < 2.5) {
        lowCategories.push(category as Category);
      }
    });
    return lowCategories;
  }, [categoryScores]);

  return (
    <div className="results-dashboard">
      {/* Main disclaimer banner */}
      <div className="main-disclaimer-banner">
        <p><strong>Disclaimer:</strong> This is an unofficial GitHub OctoFlow application. Not affiliated with GitHub, Inc.</p>
      </div>
      
      {showSettings && (
        <Settings onClose={handleCloseSettings} />
      )}
      
      {showHistory && (
        <HistoryDashboard onClose={handleCloseHistory} />
      )}
      
      <div className="results-container">
        <motion.h2
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          Assessment Results
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
        
        {/* Add stage selector */}
        <div className="stage-selector">
          <h3>Assessment Stages</h3>
          <div className="stage-buttons">
            {availableStages.length === 0 ? (
              <p>No assessment data available. Please complete an assessment.</p>
            ) : (
              availableStages.map((stageOption) => (
                <button
                  key={stageOption}
                  className={`stage-button ${currentStage === stageOption ? 'active' : ''}`}
                  onClick={() => handleStageChange(stageOption)}
                >
                  {getStageDisplayName(stageOption)}
                  {currentStage === stageOption && <span className="current-indicator">✓</span>}
                </button>
              ))
            )}
          </div>
          
          {availableStages.length > 0 && (
            <div className="stage-navigation-hint">
              <p>
                <strong>Tip:</strong> You can view results for different completed stages by clicking the buttons above.
              </p>
            </div>
          )}
        </div>
        
        {/* Main dashboard content */}
        {Object.values(allResponses).every(responses => Object.keys(responses).length === 0) ? (
          <motion.div 
            className="no-assessment-data"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <h3>No Assessment Data Available</h3>
            <p>You haven't completed any assessments yet.</p>
            <p>Return to the home page to start an assessment for your GitHub practices.</p>
            <button 
              className="primary-button"
              onClick={() => {
                // Navigate to home page
                window.location.href = '/';
              }}
            >
              Start Assessment
            </button>
          </motion.div>
        ) : (
          <>
            {/* Loading skeletons */}
            {isLoading ? (
              <div className="results-content loading">
                <LoadingSkeleton type="chart" height="200px" />
                <div className="skeleton-row">
                  <LoadingSkeleton type="card" count={3} height="120px" width="32%" />
                </div>
                <LoadingSkeleton type="text" count={2} />
                <LoadingSkeleton type="card" height="300px" />
              </div>
            ) : (
              /* Results content - only show when loaded */
              <div className="results-content">
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
                      className={`tab-button ${activeTab === 'resources' ? 'active' : ''}`}
                      onClick={() => setActiveTab('resources')}
                    >
                      Resource Hub
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
                      {/* Stage name header */}
                      <h3 className="selected-stage-header">{currentStage} Stage Results</h3>
                      
                      {/* MaturityScoreCard - New component */}
                      <motion.div
                        variants={sectionVariants}
                        initial="hidden"
                        animate="visible"
                        transition={{ delay: 0.1 }}
                      >
                        <MemoizedMaturityScoreCard 
                          categoryScores={categoryScores} 
                          stage={currentStage}
                        />
                      </motion.div>
                      
                      {/* Quick Win Recommendations - New component */}
                      <motion.div
                        variants={sectionVariants}
                        initial="hidden"
                        animate="visible"
                        transition={{ delay: 0.2 }}
                      >
                        <MemoizedQuickWinRecommendations 
                          recommendations={recommendations}
                        />
                      </motion.div>
                      
                      <motion.div 
                        className="results-chart"
                        variants={sectionVariants}
                        initial="hidden"
                        animate="visible"
                        transition={{ delay: 0.3 }}
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
                      
                      {/* Add the ImprovementRoadmap component */}
                      <motion.div
                        variants={sectionVariants}
                        initial="hidden"
                        animate="visible"
                        transition={{ delay: 0.3 }}
                      >
                        <ImprovementRoadmap 
                          categoryScores={categoryScores} 
                        />
                      </motion.div>

                      {/* Add the StartupEligibilityCTA component */}
                      <motion.div
                        variants={sectionVariants}
                        initial="hidden"
                        animate="visible"
                        transition={{ delay: 0.4 }}
                      >
                        <StartupEligibilityCTA 
                          user={currentUser} 
                          stage={currentStage}
                        />
                      </motion.div>
                      
                      {/* Add the ExportShare component */}
                      <motion.div
                        variants={sectionVariants}
                        initial="hidden"
                        animate="visible"
                        transition={{ delay: 0.5 }}
                      >
                        <ExportShare 
                          stage={currentStage}
                          categoryScores={categoryScores}
                          recommendations={recommendations}
                          personalizationData={personalizationData}
                        />
                      </motion.div>
                      
                      {/* Add the ActionButtons component */}
                      <ActionButtons onReset={onReset} onViewHistory={handleViewHistory} />
                    </>
                  )}
                  
                  {activeTab === 'resources' && (
                    <motion.div
                      variants={sectionVariants}
                      initial="hidden"
                      animate="visible"
                    >
                      <MemoizedResourceHub />
                    </motion.div>
                  )}
                  
                  {activeTab === 'badge' && (
                    <motion.div
                      variants={sectionVariants}
                      initial="hidden"
                      animate="visible"
                    >
                      <BadgeGenerator 
                        scores={categoryScores}
                        overallScore={overallScore}
                      />
                    </motion.div>
                  )}
                </motion.div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ResultsDashboard; 