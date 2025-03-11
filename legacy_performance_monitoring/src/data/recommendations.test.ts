import { recommendations, getRecommendationsByScores } from './recommendations';

describe('Recommendations', () => {
  // Test that all recommendations have the required fields
  test('all recommendations have required fields', () => {
    recommendations.forEach(rec => {
      expect(rec).toHaveProperty('id');
      expect(rec).toHaveProperty('title');
      expect(rec).toHaveProperty('githubUrl');
      expect(rec).toHaveProperty('impact');
      expect(rec).toHaveProperty('priority');
      expect(rec).toHaveProperty('effort');
      expect(rec).toHaveProperty('steps');
      
      // Check that URLs point to GitHub
      expect(rec.githubUrl).toMatch(/github\.com|docs\.github\.com/);
      
      // Check priority is valid
      expect(['low', 'medium', 'high']).toContain(rec.priority);
      
      // Check effort is valid
      expect(['low', 'medium', 'high']).toContain(rec.effort);
      
      // Check steps is an array with content
      expect(Array.isArray(rec.steps)).toBe(true);
      expect(rec.steps.length).toBeGreaterThan(0);
    });
  });

  // Test that the filtering logic works as expected
  test('getRecommendationsByScores returns matching recommendations', () => {
    // Mock scores with some categories
    const scores = {
      'cicd': 0,
      'security': 1,
      'testing': 5 // Outside the range for testing recommendations
    };
    
    const result = getRecommendationsByScores(scores);
    
    // Should include recommendations for cicd and security
    expect(result.some(rec => rec.impact === 'cicd')).toBe(true);
    expect(result.some(rec => rec.impact === 'security')).toBe(true);
    
    // Should not include testing or categories not matching
    expect(result.every(rec => rec.impact !== 'testing')).toBe(true);
    
    // Check if specific IDs are included
    expect(result.some(rec => rec.id === 'seed-cicd-1')).toBe(true);
    expect(result.some(rec => rec.id === 'seed-security-1')).toBe(true);
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

  // Test stage-specific filtering
  test('getRecommendationsByScores filters by stage when provided', () => {
    const scores = {
      'cicd': 2,
      'security': 2
    };

    // Test Series A stage recommendations
    const seriesAResult = getRecommendationsByScores(scores, 'series-a');
    expect(seriesAResult.every(rec => rec.stage === 'series-a')).toBe(true);
    expect(seriesAResult.some(rec => rec.id === 'series-a-cicd-1')).toBe(true);

    // Test Seed stage recommendations
    const seedResult = getRecommendationsByScores(scores, 'seed');
    expect(seedResult.every(rec => rec.stage === 'seed')).toBe(true);
    expect(seedResult.some(rec => rec.id === 'seed-cicd-1')).toBe(true);
  });
  
  // Test recommendations have appropriate number per stage
  test('each stage has sufficient recommendations', () => {
    const stageRecommendations = {
      'seed': recommendations.filter(rec => rec.stage === 'seed'),
      'series-a': recommendations.filter(rec => rec.stage === 'series-a'),
      'series-b': recommendations.filter(rec => rec.stage === 'series-b')
    };
    
    // Each stage should have at least 5 recommendations
    expect(stageRecommendations['seed'].length).toBeGreaterThanOrEqual(5);
    expect(stageRecommendations['series-a'].length).toBeGreaterThanOrEqual(5);
    expect(stageRecommendations['series-b'].length).toBeGreaterThanOrEqual(5);
  });
});