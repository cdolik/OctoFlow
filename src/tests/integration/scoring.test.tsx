import { Stage, Question } from '../../types';
import { calculateStageScores, getScoreLevel } from '../../utils/scoring';
import { getStageConfig } from '../../data/StageConfig';
import { categories } from '../../data/categories';

describe('Scoring System Integration', () => {
  const mockResponses: Record<string, number> = {
    'branch-strategy': 3,
    'pr-review': 4,
    'ci-practices': 2,
    'security-scanning': 3,
    'dependabot': 4,
    'copilot-usage': 3,
    'deployment-automation': 4
  };

  describe('Stage-specific Scoring', () => {
    const stages: Stage[] = ['pre-seed', 'seed', 'series-a', 'series-b'];

    it('applies correct weights per stage', () => {
      stages.forEach(stage => {
        const scores = calculateStageScores(stage, mockResponses);
        const config = getStageConfig(stage);

        // Verify focus area weights
        config.focus.forEach(focusArea => {
          const focusCategories = categories.filter(c => c.id === focusArea);
          focusCategories.forEach(category => {
            if (scores.categoryScores[category.id]) {
              // Focus areas should have higher average scores due to weight multiplier
              expect(scores.categoryScores[category.id]).toBeGreaterThanOrEqual(
                scores.categoryScores[Object.keys(scores.categoryScores).find(k => k !== category.id) || ''] || 0
              );
            }
          });
        });

        // Verify against benchmarks
        Object.entries(config.benchmarks.expectedScores).forEach(([category, benchmark]) => {
          const score = scores.categoryScores[category];
          if (score < benchmark) {
            expect(scores.gaps).toContain(category);
          }
        });
      });
    });

    it('calculates valid completion rates', () => {
      stages.forEach(stage => {
        const scores = calculateStageScores(stage, mockResponses);
        expect(scores.completionRate).toBeGreaterThanOrEqual(0);
        expect(scores.completionRate).toBeLessThanOrEqual(1);
      });
    });

    it('provides stage-appropriate score levels', () => {
      const levels = [
        { score: 3.8, expected: 'Advanced' },
        { score: 2.7, expected: 'Proactive' },
        { score: 1.8, expected: 'Basic' },
        { score: 1.2, expected: 'Initial' }
      ];

      levels.forEach(({ score, expected }) => {
        const { level } = getScoreLevel(score);
        expect(level).toBe(expected);
      });
    });

    it('handles incomplete responses gracefully', () => {
      const partialResponses = {
        'branch-strategy': 3,
        'pr-review': 4
      };

      stages.forEach(stage => {
        const scores = calculateStageScores(stage, partialResponses);
        expect(scores.overallScore).toBeGreaterThanOrEqual(0);
        expect(scores.overallScore).toBeLessThanOrEqual(4);
        expect(scores.completionRate).toBeLessThan(1);
      });
    });

    it('validates score ranges', () => {
      const invalidResponses = {
        'branch-strategy': 5, // Invalid score
        'pr-review': 0, // Invalid score
        'ci-practices': 3 // Valid score
      };

      stages.forEach(stage => {
        const scores = calculateStageScores(stage, invalidResponses);
        Object.values(scores.categoryScores).forEach(score => {
          expect(score).toBeGreaterThanOrEqual(0);
          expect(score).toBeLessThanOrEqual(4);
        });
      });
    });
  });
});