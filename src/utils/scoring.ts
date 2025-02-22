import { Stage, Question, StageDefinition } from '../types';
import { categories } from '../data/categories';
import { stages } from '../data/stages';
import { questions } from '../data/questions';

interface CategoryScore {
  score: number;
  weight: number;
  questionCount: number;
}

interface StageScores {
  overallScore: number;
  categoryScores: Record<string, number>;
  benchmarks: Record<string, number>;
  completionRate: number;
  gaps: string[];
}

export const calculateStageScores = (
  stage: Stage,
  responses: Record<string, number>
): StageScores => {
  const stageConfig = stages.find(s => s.id === stage);
  if (!stageConfig) {
    throw new Error(`Invalid stage: ${stage}`);
  }

  const categoryScores: Record<string, CategoryScore> = {};
  
  // Initialize category scores
  categories.forEach(category => {
    categoryScores[category.id] = {
      score: 0,
      weight: category.weight || 1,
      questionCount: 0
    };
  });

  // Calculate scores per category
  Object.entries(responses).forEach(([questionId, value]) => {
    const question = findQuestionById(questionId);
    if (question && question.category) {
      const categoryScore = categoryScores[question.category];
      categoryScore.score += value;
      categoryScore.questionCount++;
    }
  });

  // Calculate weighted averages and identify gaps
  const finalScores: Record<string, number> = {};
  const gaps: string[] = [];
  
  Object.entries(categoryScores).forEach(([category, score]) => {
    if (score.questionCount > 0) {
      const avgScore = score.score / score.questionCount;
      finalScores[category] = avgScore;
      
      // Check for gaps against stage benchmarks
      const benchmark = stageConfig.benchmarks.expectedScores[category];
      if (benchmark && avgScore < benchmark) {
        gaps.push(category);
      }
    }
  });

  const overallScore = Object.entries(finalScores).reduce(
    (acc, [category, score]) => acc + (score * categoryScores[category].weight),
    0
  ) / Object.values(categoryScores).reduce((acc, score) => acc + score.weight, 0);

  const answeredCount = Object.keys(responses).length;
  const totalQuestions = questions.filter(q => q.stages.includes(stage)).length;
  
  return {
    overallScore,
    categoryScores: finalScores,
    benchmarks: stageConfig.benchmarks.expectedScores,
    completionRate: totalQuestions > 0 ? answeredCount / totalQuestions : 0,
    gaps
  };
};

const findQuestionById = (id: string): Question | undefined =>
  questions.find(q => q.id === id);

export const validateScore = (score: number): boolean => {
  return score >= 0 && score <= 4;
};