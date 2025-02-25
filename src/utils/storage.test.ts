import { getAssessmentState } from './storage';

test('getAssessmentState should be defined', () => {
  expect(getAssessmentState).toBeDefined();
  console.log(getAssessmentState());
});
