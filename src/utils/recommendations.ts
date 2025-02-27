import { Stage, Recommendation, ScoreResult } from '../types';
import { recommendations } from '../data/recommendations';

/**
 * Get recommendations based on a user's assessment scores
 * 
 * @param stage The current assessment stage
 * @param scores The calculated scores from the assessment
 * @returns An array of recommendations prioritized by relevance
 */
export function getRecommendations(stage: Stage, scores: ScoreResult): Recommendation[] {
  // Get all recommendations for the current stage
  const stageRecommendations = recommendations[stage] || [];
  
  // Identify weakest categories (those with scores below 2.5)
  const weakCategories = Object.entries(scores.categoryScores)
    .filter(([_, score]) => score < 2.5)
    .map(([category]) => category);
  
  // If there are weak categories, prioritize recommendations for those areas
  if (weakCategories.length > 0) {
    const prioritizedRecommendations = stageRecommendations
      .filter(rec => weakCategories.includes(rec.category))
      .sort((a, b) => b.impact - a.impact); // Sort by impact (highest first)
      
    // If we have prioritized recommendations, return those first, then add others
    if (prioritizedRecommendations.length > 0) {
      const otherRecommendations = stageRecommendations
        .filter(rec => !weakCategories.includes(rec.category))
        .sort((a, b) => b.impact - a.impact);
        
      return [...prioritizedRecommendations, ...otherRecommendations];
    }
  }
  
  // Default sorting by impact if no weak categories identified
  return [...stageRecommendations].sort((a, b) => b.impact - a.impact);
}

/**
 * Get a single recommendation most relevant to the user's weakest area
 * 
 * @param stage The current assessment stage
 * @param scores The calculated scores from the assessment
 * @returns The most impactful recommendation for the user's weakest area
 */
export function getTopRecommendation(stage: Stage, scores: ScoreResult): Recommendation | null {
  // Find the weakest category
  const categories = Object.entries(scores.categoryScores);
  if (categories.length === 0) return null;
  
  categories.sort(([_, scoreA], [__, scoreB]) => scoreA - scoreB);
  const [weakestCategory] = categories[0];
  
  // Find recommendations for that category
  const categoryRecommendations = recommendations[stage]
    .filter(rec => rec.category === weakestCategory)
    .sort((a, b) => b.impact - a.impact);
    
  return categoryRecommendations.length > 0 ? categoryRecommendations[0] : null;
}