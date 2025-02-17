// Scoring utilities for weighted calculations
export const calculateWeightedScore = (responses, categories) => {
  const categoryScores = {};
  let totalWeightedScore = 0;
  let totalWeight = 0;

  // Calculate scores for each category
  categories.forEach(category => {
    const categoryQuestions = category.questions;
    const answeredQuestions = categoryQuestions.filter(q => responses[q.id]);
    
    if (answeredQuestions.length > 0) {
      const categoryTotal = answeredQuestions.reduce((sum, q) => sum + responses[q.id], 0);
      const categoryAverage = categoryTotal / answeredQuestions.length;
      categoryScores[category.id] = categoryAverage;
      
      // Add to weighted total
      totalWeightedScore += categoryAverage * category.weight;
      totalWeight += category.weight;
    }
  });

  // Calculate stage-specific benchmarks
  const stageScores = calculateStageBenchmarks(categoryScores, responses.stage);

  return {
    categoryScores,
    overallScore: totalWeightedScore / totalWeight,
    maxScore: 4,
    stageBenchmarks: stageScores,
    completionRate: calculateCompletionRate(responses, categories)
  };
};

const calculateStageBenchmarks = (scores, stage) => {
  const stageBenchmarks = stageConfiguration[stage] || stageConfiguration['pre-seed'];
  return {
    current: scores,
    expected: stageBenchmarks.benchmarks,
    gap: calculateBenchmarkGap(scores, stageBenchmarks.benchmarks)
  };
};

const calculateBenchmarkGap = (current, expected) => {
  const gaps = {};
  Object.keys(expected).forEach(metric => {
    gaps[metric] = expected[metric] - (current[metric] || 0);
  });
  return gaps;
};

const calculateCompletionRate = (responses, categories) => {
  const totalQuestions = categories.reduce((sum, cat) => sum + cat.questions.length, 0);
  const answeredQuestions = Object.keys(responses).length;
  return answeredQuestions / totalQuestions;
};

export const getScoreLevel = (score) => {
  if (score >= 3.5) return { level: 'Advanced', description: 'Your engineering practices are highly optimized' };
  if (score >= 2.5) return { level: 'Proactive', description: 'Good practices in place with room for automation' };
  if (score >= 1.5) return { level: 'Basic', description: 'Foundation set, focus on standardization' };
  return { level: 'Initial', description: 'Start implementing GitHub best practices' };
};

export const getRecommendations = (scores, stage) => {
  const stageConfig = stageConfiguration[stage] || stageConfiguration['pre-seed'];
  const recommendations = [];

  // Add category-specific recommendations
  Object.entries(scores.categoryScores).forEach(([categoryId, score]) => {
    const category = categories.find(c => c.id === categoryId);
    if (score < stageConfig.benchmarks[`${categoryId}Score`] || score < 3) {
      recommendations.push({
        category: categoryId,
        priority: score < 2 ? 'high' : 'medium',
        actions: getActionsByCategory(categoryId, stage),
        currentScore: score,
        targetScore: stageConfig.benchmarks[`${categoryId}Score`]
      });
    }
  });

  // Sort by priority and gap to benchmark
  return recommendations.sort((a, b) => {
    if (a.priority === 'high' && b.priority !== 'high') return -1;
    if (b.priority === 'high' && a.priority !== 'high') return 1;
    return (b.targetScore - b.currentScore) - (a.targetScore - a.currentScore);
  });
};

const getActionsByCategory = (categoryId, stage) => {
  const actionMap = {
    'github-ecosystem': [
      'Enable CODEOWNERS for critical directories',
      'Set up GitHub Actions for CI/CD',
      'Implement branch protection rules'
    ],
    'security': [
      'Enable Dependabot alerts',
      'Configure CodeQL scanning',
      'Set up secret scanning'
    ],
    'automation': [
      'Implement automated testing',
      'Set up deployment workflows',
      'Configure environment protection rules'
    ]
  };

  return actionMap[categoryId] || [];
};