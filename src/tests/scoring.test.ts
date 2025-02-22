import { calculateStageScores, validateScore } from '../utils/scoring';
import { stages } from '../data/stages';
import { Stage } from '../types';

describe('Scoring System', () => {
  const mockResponses: Record<string, number> = {
    'codeowners': 3,
    'branch-protection': 4,
    'project-management': 2,
    'secret-scanning': 3,
    'dependabot': 4,
    'copilot-usage': 3,
    'deployment-automation': 4
  };

  describe('calculateStageScores', () => {
    test('calculates correct scores for pre-seed stage', () => {
      const scores = calculateStageScores('pre-seed' as Stage, mockResponses);
      
      expect(scores.overallScore).toBeGreaterThan(0);
      expect(scores.overallScore).toBeLessThanOrEqual(4);
      expect(scores.categoryScores).toHaveProperty('github-ecosystem');
      expect(scores.categoryScores).toHaveProperty('security');
      expect(Object.keys(scores.categoryScores).length).toBeGreaterThan(0);
      expect(scores.recommendations).toBeDefined();
    });

    test('handles all valid stages', () => {
      stages.forEach(stage => {
        const scores = calculateStageScores(stage.id, mockResponses);
        expect(scores).toEqual(expect.objectContaining({
          overallScore: expect.any(Number),
          categoryScores: expect.any(Object),
          recommendations: expect.any(Array)
        }));
      });
    });
  });

  describe('Score Validation', () => {
    test('validates score ranges correctly', () => {
      expect(validateScore(0)).toBeTruthy();
      expect(validateScore(2)).toBeTruthy();
      expect(validateScore(4)).toBeTruthy();
      expect(validateScore(-1)).toBeFalsy();
      expect(validateScore(5)).toBeFalsy();
    });
  });

  describe('Category Scoring', () => {
    test('provides stage-appropriate scores', () => {
      const scores = calculateStageScores('seed' as Stage, mockResponses);
      
      // Check category scores are in valid range
      Object.values(scores.categoryScores).forEach(score => {
        expect(score).toBeGreaterThanOrEqual(0);
        expect(score).toBeLessThanOrEqual(4);
      });
    });

    test('generates recommendations for low scores', () => {
      const lowScores: Record<string, number> = {
        'codeowners': 1,
        'branch-protection': 1,
        'project-management': 1
      };

      const scores = calculateStageScores('pre-seed' as Stage, lowScores);
      expect(scores.recommendations.length).toBeGreaterThan(0);
    });
  });

  describe('Stage-specific scoring', () => {
    test('applies stage-specific benchmarks', () => {
      stages.forEach(stage => {
        const scores = calculateStageScores(stage.id, mockResponses);
        const recommendations = new Set(scores.recommendations);

        Object.entries(stage.benchmarks.expectedScores).forEach(([category, benchmark]) => {
          const categoryScore = scores.categoryScores[category];
          const benchmarkRecommendation = `Improve ${category} practices to reach the expected benchmark of ${benchmark}`;
          
          if (categoryScore < benchmark) {
            expect(recommendations.has(benchmarkRecommendation)).toBeTruthy();
          } else {
            expect(recommendations.has(benchmarkRecommendation)).toBeFalsy();
          }
        });
      });
    });
  });
});