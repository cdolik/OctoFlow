import { calculateWeightedScore, getScoreLevel, getRecommendations } from '../utils/scoring';
import { categories } from '../data/categories';

describe('Scoring System', () => {
  const mockResponses = {
    'eco-1': 3,
    'eco-2': 4,
    'sec-1': 2,
    'sec-2': 3,
    'auto-1': 4
  };

  test('calculateWeightedScore produces correct calculations', () => {
    const scores = calculateWeightedScore(mockResponses, categories);
    
    expect(scores.overallScore).toBeGreaterThan(0);
    expect(scores.overallScore).toBeLessThanOrEqual(4);
    expect(scores.categoryScores).toHaveProperty('github-ecosystem');
    expect(scores.categoryScores).toHaveProperty('security');
    expect(scores.categoryScores).toHaveProperty('automation');
  });

  test('getScoreLevel returns correct levels', () => {
    expect(getScoreLevel(3.8)).toBe('Advanced');
    expect(getScoreLevel(2.7)).toBe('Proactive');
    expect(getScoreLevel(1.8)).toBe('Basic');
    expect(getScoreLevel(1.2)).toBe('Initial');
  });

  test('getRecommendations provides relevant actions', () => {
    const scores = calculateWeightedScore(mockResponses, categories);
    const recommendations = getRecommendations(scores, 'pre-seed');
    
    expect(Array.isArray(recommendations)).toBe(true);
    recommendations.forEach(rec => {
      expect(rec).toHaveProperty('category');
      expect(rec).toHaveProperty('priority');
      expect(rec).toHaveProperty('actions');
      expect(Array.isArray(rec.actions)).toBe(true);
    });
  });
});