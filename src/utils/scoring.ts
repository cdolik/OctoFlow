import { Stage, Question, StageDefinition, ScoreResult } from '../types';
import { stages } from '../data/stages';
import { categories } from '../data/categories';

export interface CategoryScore {
  score: number;
  questions: number;
  maxScore: number;
}

export function calculateScores(
  responses: Record<string, number>,
  questions: Question[],
  stage: Stage,
  stageConfig: StageDefinition
): ScoreResult {
  const categoryScores: Record<string, CategoryScore> = {};
  const validQuestions = questions.filter(q => q.stages.includes(stage));
  
  // Calculate raw scores
  validQuestions.forEach(question => {
    const response = responses[question.id];
    if (typeof response !== 'number') return;
    
    const category = categoryScores[question.category] || {
      score: 0,
      questions: 0,
      maxScore: 0
    };
    
    category.score += response * question.weight;
    category.questions += 1;
    category.maxScore += 4 * question.weight;
    categoryScores[question.category] = category;
  });

  // Normalize scores and calculate gaps
  const normalizedScores: Record<string, number> = {};
  const gaps: Record<string, number> = {};
  const benchmarks = stageConfig.benchmarks.expectedScores;
  let totalWeight = 0;
  let weightedScore = 0;
  let totalResponses = 0;
  let totalQuestions = validQuestions.length;

  Object.entries(categoryScores).forEach(([category, score]) => {
    if (score.maxScore === 0) return;
    
    const normalized = (score.score / score.maxScore) * 4; // Scale to 0-4
    normalizedScores[category] = normalized;
    
    const benchmark = benchmarks[category] || 0;
    if (normalized < benchmark) {
      gaps[category] = benchmark - normalized;
    }
    
    const categoryWeight = stageConfig.benchmarks.expectedScores[category] || 1;
    totalWeight += categoryWeight;
    weightedScore += normalized * categoryWeight;
    totalResponses += score.questions;
  });

  const overallScore = totalWeight > 0 ? (weightedScore / totalWeight) : 0;
  const completionRate = totalQuestions > 0 ? totalResponses / totalQuestions : 0;

  return {
    overallScore,
    categoryScores: normalizedScores,
    level: getScoreLevel(overallScore),
    gaps,
    benchmarks,
    completionRate
  };
}

export function getScoreLevel(score: number): 'Low' | 'Medium' | 'High' {
  if (score >= 3) return 'High';
  if (score >= 2) return 'Medium';
  return 'Low';
}

export function validateScore(
  score: number,
  stage: Stage,
  category: string,
  stageConfig: StageDefinition
): boolean {
  const benchmark = stageConfig.benchmarks.expectedScores[category];
  return score >= (benchmark || 0);
}

/**
 * Calculate scores for a specific stage based on user responses
 */
export function calculateStageScores(
  stage: Stage,
  responses: Record<string, number>
): ScoreResult {
  const stageConfig = stages.find(s => s.id === stage);
  if (!stageConfig) {
    throw new Error(`Invalid stage: ${stage}`);
  }

  const validResponses = Object.entries(responses).reduce((acc, [key, value]) => {
    if (typeof value === 'number' && value >= 0 && value <= 4) {
      acc[key] = value;
    }
    return acc;
  }, {} as Record<string, number>);

  return calculateScores(validResponses, stageConfig.questions, stage, stageConfig);
}

export function calculateMetrics(
  responses: Record<string, number>,
  questions: Question[]
): { averageResponseTime: number; completionRate: number } {
  const totalResponses = Object.keys(responses).length;
  const totalQuestions = questions.length;
  const totalTime = Object.values(responses).reduce((acc, response) => acc + response, 0);
  
  return {
    averageResponseTime: totalTime / totalResponses,
    completionRate: (totalResponses / totalQuestions) * 100
  };
}
