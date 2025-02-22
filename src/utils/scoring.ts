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
  recommendations: string[];
}

export const calculateStageScores = (
  stage: Stage,
  responses: Record<string, number>
): StageScores => {
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

  // Calculate weighted averages
  const finalScores: Record<string, number> = {};
  let totalWeight = 0;
  let weightedSum = 0;

  Object.entries(categoryScores).forEach(([categoryId, data]) => {
    if (data.questionCount > 0) {
      const avgScore = data.score / data.questionCount;
      finalScores[categoryId] = avgScore;
      weightedSum += avgScore * data.weight;
      totalWeight += data.weight;
    }
  });

  const overallScore = totalWeight > 0 ? weightedSum / totalWeight : 0;

  // Generate recommendations based on scores
  const recommendations = generateRecommendations(stage, finalScores);

  return {
    overallScore,
    categoryScores: finalScores,
    recommendations
  };
};

const findQuestionById = (id: string): Question | undefined => {
  return questions.find(q => q.id === id);
};

const generateRecommendations = (
  stage: Stage,
  scores: Record<string, number>
): string[] => {
  const recommendations: string[] = [];
  const stageBenchmarks = stages.find(s => s.id === stage)?.benchmarks;
  
  if (!stageBenchmarks) return recommendations;

  const validScores = (scores as Record<keyof typeof stageBenchmarks.expectedScores, number>);
  Object.entries(stageBenchmarks.expectedScores).forEach(([category, benchmark]) => {
    const score = validScores[category as keyof typeof stageBenchmarks.expectedScores];
    if (score !== undefined && score < benchmark) {
      recommendations.push(
        `Improve ${category} practices to reach the expected benchmark of ${benchmark}`
      );
    }
  });

  return recommendations;
};

export const validateScore = (score: number): boolean => {
  return score >= 0 && score <= 4;
};