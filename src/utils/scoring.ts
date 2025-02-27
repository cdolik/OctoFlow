import { Stage, Question, StageDefinition, ScoreResult } from '../types';
import { stages } from '../data/stages';

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

  const normalizedScores: Record<string, number> = {};
  let totalWeight = 0;
  let weightedScore = 0;

  Object.entries(categoryScores).forEach(([category, score]) => {
    if (score.maxScore === 0) return;

    const normalized = (score.score / score.maxScore) * 100;
    normalizedScores[category] = normalized;

    const categoryWeight = stageConfig.benchmarks.expectedScores[category] || 1;
    totalWeight += categoryWeight;
    weightedScore += normalized * categoryWeight;
  });

  const overallScore = totalWeight > 0 ? weightedScore / totalWeight : 0;

  return {
    overallScore,
    categoryScores: normalizedScores,
    level: getScoreLevel(overallScore)
  };
}

export function getScoreLevel(score: number): 'Low' | 'Medium' | 'High' {
  if (score >= 75) return 'High';
  if (score >= 50) return 'Medium';
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

export function calculateStageScores(
  stage: Stage,
  responses: Record<string, number>
): { overallScore: number; categoryScores: Record<string, number> } {
  const stageConfig = stages.find(s => s.id === stage);
  if (!stageConfig) {
    throw new Error(`Invalid stage: ${stage}`);
  }

  const questions = getStageQuestions(stage);
  const scores = calculateScores(responses, questions, stage, stageConfig);

  return {
    overallScore: scores.overallScore,
    categoryScores: scores.categoryScores
  };
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

export function getStageQuestions(stage: Stage): Question[] {
  const stageConfig = stages.find(s => s.id === stage);
  if (!stageConfig) {
    throw new Error(`Invalid stage: ${stage}`);
  }
  return stageConfig.questions;
}
