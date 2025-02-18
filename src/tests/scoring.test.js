import { calculateWeightedScore, getScoreLevel, getRecommendations } from '../utils/scoring';
import { stages } from '../data/categories';

describe('Scoring System', () => {
  const mockResponses = {
    'codeowners': 3,
    'branch-protection': 4,
    'project-management': 2,
    'secret-scanning': 3,
    'dependabot': 4,
    'copilot-usage': 3,
    'deployment-automation': 4
  };

  describe('calculateWeightedScore', () => {
    test('calculates correct scores for pre-seed stage', () => {
      const scores = calculateWeightedScore(mockResponses, 'pre-seed');
      
      expect(scores.overallScore).toBeGreaterThan(0);
      expect(scores.overallScore).toBeLessThanOrEqual(4);
      expect(scores.categoryScores).toHaveProperty('github-ecosystem');
      expect(scores.categoryScores).toHaveProperty('security');
      expect(scores.completionRate).toBeDefined();
      expect(scores.gaps).toBeDefined();
    });

    test('handles invalid stage gracefully', () => {
      const scores = calculateWeightedScore(mockResponses, 'invalid-stage');
      expect(scores.benchmarks).toEqual(expect.objectContaining({
        'github-ecosystem': expect.any(Number),
        'security': expect.any(Number)
      }));
    });
  });

  describe('getScoreLevel', () => {
    test('returns correct assessment levels', () => {
      expect(getScoreLevel(3.8)).toEqual({
        level: 'Advanced',
        description: expect.any(String)
      });
      expect(getScoreLevel(2.7)).toEqual({
        level: 'Proactive',
        description: expect.any(String)
      });
      expect(getScoreLevel(1.8)).toEqual({
        level: 'Basic',
        description: expect.any(String)
      });
      expect(getScoreLevel(1.2)).toEqual({
        level: 'Initial',
        description: expect.any(String)
      });
    });
  });

  describe('getRecommendations', () => {
    test('provides stage-appropriate recommendations', () => {
      const scores = calculateWeightedScore(mockResponses, 'seed');
      const recommendations = getRecommendations(scores, 'seed');
      
      expect(recommendations).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            category: expect.any(String),
            priority: expect.stringMatching(/^(high|medium)$/),
            impact: expect.stringMatching(/^(High|Medium|Low)$/),
            effort: expect.stringMatching(/^(High|Medium|Low)$/),
            steps: expect.any(Array)
          })
        ])
      );
    });

    test('prioritizes recommendations correctly', () => {
      const scores = calculateWeightedScore(mockResponses, 'series-a');
      const recommendations = getRecommendations(scores, 'series-a');
      
      const highPriorityFirst = recommendations.length > 1 && 
        (recommendations[0].priority === 'high' || recommendations[0].impact === 'High');
      expect(highPriorityFirst).toBeTruthy();
    });
  });

  describe('stage-specific behavior', () => {
    test('filters questions appropriately by stage', () => {
      stages.forEach(stage => {
        const scores = calculateWeightedScore(mockResponses, stage.id);
        expect(scores.benchmarks).toMatchObject(stage.benchmarks.expectedScores);
      });
    });
  });
});