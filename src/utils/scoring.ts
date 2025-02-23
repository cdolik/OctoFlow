import { Stage, Question, StageDefinition, ScoreResult } from '../types';
import { categories } from '../data/categories';
import { getStageConfig } from '../data/StageConfig';
import { questions } from '../data/questions';
import { filterQuestionsByStage, getQuestionWeight } from './questionFiltering';

interface CategoryScore {
  score: number;
  weight: number;
  questionCount: number;
}

export const calculateStageScores = (
  stage: Stage,
  responses: Record<string, number>
): ScoreResult => {
  const stageConfig = getStageConfig(stage);
  const categoryScores: Record<string, number> = {};
  const categoryWeights: Record<string, CategoryScore> = {};

  // Initialize category weights and scores
  categories.forEach(category => {
    categoryWeights[category.id] = {
      score: 0,
      weight: category.weight || 1,
      questionCount: 0
    };
    categoryScores[category.id] = 0;
  });

  // Filter questions for this stage
  const stageQuestions = filterQuestionsByStage(questions, stage);

  // Calculate scores per category
  stageQuestions.forEach(question => {
    const response = responses[question.id];
    if (response && question.category) {
      const weight = getQuestionWeight(question, stage);
      categoryWeights[question.category].score += response * weight;
      categoryWeights[question.category].weight += weight;
      categoryWeights[question.category].questionCount++;
    }
  });

  // Calculate weighted averages and identify gaps
  const gaps: string[] = [];
  let totalScore = 0;
  let totalWeight = 0;

  Object.entries(categoryWeights).forEach(([category, data]) => {
    if (data.questionCount > 0) {
      const avgScore = data.score / data.weight;
      categoryScores[category] = avgScore;
      
      // Track gaps against benchmarks
      const benchmark = stageConfig.benchmarks.expectedScores[category];
      if (benchmark && avgScore < benchmark) {
        gaps.push(category);
      }

      totalScore += avgScore * data.weight;
      totalWeight += data.weight;
    }
  });

  const overallScore = totalWeight > 0 ? totalScore / totalWeight : 0;
  const answeredCount = Object.keys(responses).length;
  const totalQuestions = stageQuestions.length;

  return {
    overallScore,
    categoryScores,
    benchmarks: stageConfig.benchmarks.expectedScores,
    completionRate: totalQuestions > 0 ? answeredCount / totalQuestions : 0,
    gaps
  };
};

export const validateScore = (score: number): boolean => {
  return Number.isInteger(score) && score >= 1 && score <= 4;
};

export const getScoreLevel = (score: number): { level: string; description: string } => {
  if (score >= 3.5) {
    return { 
      level: 'Advanced',
      description: 'Your engineering practices are highly optimized'
    };
  }
  if (score >= 2.5) {
    return { 
      level: 'Proactive',
      description: 'Good practices in place with room for automation'
    };
  }
  if (score >= 1.5) {
    return { 
      level: 'Basic',
      description: 'Foundation set, focus on standardization'
    };
  }
  return { 
    level: 'Initial',
    description: 'Start implementing GitHub best practices'
  };
};