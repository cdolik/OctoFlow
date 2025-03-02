import { recommendations, getRecommendationsByScores } from './recommendations';

describe('Recommendations', () => {
  // Test that all recommendations have the required fields
  test('all recommendations have required fields', () => {
    recommendations.forEach(rec => {
      expect(rec).toHaveProperty('id');
      expect(rec).toHaveProperty('text');
      expect(rec).toHaveProperty('githubUrl');
      expect(rec).toHaveProperty('category');
      expect(rec).toHaveProperty('priority');
      expect(rec).toHaveProperty('applicableScores');
      
      // Check that URLs point to GitHub
      expect(rec.githubUrl).toMatch(/github\.com|docs\.github\.com/);
      
      // Check priority is valid
      expect(['low', 'medium', 'high']).toContain(rec.priority);
    });
  });

  // Test that the filtering logic works as expected
  test('getRecommendationsByScores returns matching recommendations', () => {
    // Mock scores with some categories
    const scores = {
      'cicd': 0,
      'security': 1,
      'testing': 3, // Not in the range for testing recommendations
      'irrelevant': 5 // Category that doesn't exist in recommendations
    };
    
    const result = getRecommendationsByScores(scores);
    
    // Should include recommendations for cicd and security
    expect(result.some(rec => rec.category === 'cicd')).toBe(true);
    expect(result.some(rec => rec.category === 'security')).toBe(true);
    
    // Should not include testing or categories not matching
    expect(result.every(rec => rec.category !== 'testing')).toBe(true);
    expect(result.every(rec => rec.category !== 'irrelevant')).toBe(true);
    
    // Check if specific IDs are included
    expect(result.some(rec => rec.id === 'cicd-1')).toBe(true);
    expect(result.some(rec => rec.id === 'security-1')).toBe(true);
  });

  // Test with empty scores
  test('getRecommendationsByScores returns empty array with empty scores', () => {
    const scores = {};
    const result = getRecommendationsByScores(scores);
    expect(result).toEqual([]);
  });

  // Test with scores that don't match any recommendations
  test('getRecommendationsByScores returns empty array with non-matching scores', () => {
    const scores = {
      'nonexistent': 5
    };
    const result = getRecommendationsByScores(scores);
    expect(result).toEqual([]);
  });
}); 