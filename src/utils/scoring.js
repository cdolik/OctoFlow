import { categories, questions, getCategoryWeight, stages } from '../data/questions';
import { RECOMMENDATIONS } from '../data/recommendations';

const STAGE_BENCHMARKS = {
  'pre-seed': {
    'github-ecosystem': 2.0,
    'security': 1.5,
    'ai-adoption': 1.0,
    'automation': 1.5,
    overall: 1.5
  },
  'seed': {
    'github-ecosystem': 2.5,
    'security': 2.5,
    'ai-adoption': 2.0,
    'automation': 2.5,
    overall: 2.5
  },
  'series-a': {
    'github-ecosystem': 3.5,
    'security': 3.0,
    'ai-adoption': 2.5,
    'automation': 3.0,
    overall: 3.0
  }
};

const validateStage = (stage) => {
  if (!stages.find(s => s.id === stage)) {
    console.error(`Invalid stage: ${stage}`);
    return 'pre-seed'; // Default fallback
  }
  return stage;
};

export const calculateWeightedScore = (responses, stage) => {
  stage = validateStage(stage);
  const categoryScores = {};
  let totalWeightedScore = 0;
  let totalWeight = 0;

  // Calculate scores for each category
  Object.values(categories).forEach(category => {
    const categoryResponses = Object.entries(responses)
      .filter(([questionId, _]) => questions.find(q => q.id === questionId)?.category === category.id);
    
    if (categoryResponses.length > 0) {
      const categoryTotal = categoryResponses.reduce((sum, [_, value]) => sum + value, 0);
      const categoryAverage = categoryTotal / categoryResponses.length;
      const categoryWeight = getCategoryWeight(category.id);
      
      categoryScores[category.id] = categoryAverage;
      totalWeightedScore += categoryAverage * categoryWeight;
      totalWeight += categoryWeight;
    }
  });

  const overallScore = totalWeight > 0 ? totalWeightedScore / totalWeight : 0;
  const benchmarks = STAGE_BENCHMARKS[stage] || STAGE_BENCHMARKS['pre-seed'];

  return {
    categoryScores,
    overallScore,
    benchmarks,
    completionRate: calculateCompletionRate(responses),
    gaps: calculateScoreGaps(categoryScores, benchmarks)
  };
};

const calculateScoreGaps = (scores, benchmarks) => {
  const gaps = {};
  Object.entries(benchmarks).forEach(([category, benchmark]) => {
    if (category !== 'overall') {
      gaps[category] = benchmark - (scores[category] || 0);
    }
  });
  return gaps;
};

const calculateCompletionRate = (responses) => {
  const answeredQuestions = Object.keys(responses).length;
  const totalQuestions = questions.length;
  return answeredQuestions / totalQuestions;
};

export const getScoreLevel = (score) => {
  if (score >= 3.5) return { level: 'Advanced', description: 'Your engineering practices are highly optimized' };
  if (score >= 2.5) return { level: 'Proactive', description: 'Good practices in place with room for automation' };
  if (score >= 1.5) return { level: 'Basic', description: 'Foundation set, focus on standardization' };
  return { level: 'Initial', description: 'Start implementing GitHub best practices' };
};

export const getRecommendations = (scores, stage) => {
  const recommendations = [];
  const benchmarks = STAGE_BENCHMARKS[stage] || STAGE_BENCHMARKS['pre-seed'];

  // Get recommendations based on score gaps
  Object.entries(scores.categoryScores).forEach(([categoryId, score]) => {
    if (score < benchmarks[categoryId]) {
      const categoryRecs = getRecommendationKeys(categoryId, score, benchmarks[categoryId]);
      const detailedRecs = categoryRecs.map(key => ({
        ...RECOMMENDATIONS[key],
        category: categoryId,
        priority: score < benchmarks[categoryId] - 1 ? 'high' : 'medium',
        currentScore: score,
        targetScore: benchmarks[categoryId]
      }));
      recommendations.push(...detailedRecs);
    }
  });

  // Sort recommendations by priority and impact
  return recommendations.sort((a, b) => {
    if (a.priority === 'high' && b.priority !== 'high') return -1;
    if (b.priority === 'high' && a.priority !== 'high') return 1;
    return a.impact === 'High' ? -1 : 1;
  });
};

const getRecommendationKeys = (categoryId, currentScore, targetScore) => {
  const gap = targetScore - currentScore;
  const categoryRecommendations = {
    'github-ecosystem': ['CODEOWNERS', 'BRANCH_PROTECTION', 'ISSUE_TEMPLATES'],
    'security': ['SECRET_SCANNING', 'DEPENDABOT', 'CODE_SCANNING'],
    'ai-adoption': ['COPILOT'],
    'automation': ['ACTIONS_WORKFLOW', 'AUTO_ASSIGN']
  };
  
  // Return more recommendations for larger gaps
  const recs = categoryRecommendations[categoryId] || [];
  return gap > 1.5 ? recs : recs.slice(0, Math.ceil(gap * 2));
};
