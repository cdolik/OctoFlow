import { categories } from '../data/categories';

/**
 * Generates mock assessment responses for testing
 * @param {number} score - Score to use for all answers (1-5)
 * @returns {Object} Mock responses object
 */
export const generateMockResponses = (score = 3) => {
  const responses = {};
  categories.forEach(category => {
    category.questions.forEach((question, index) => {
      responses[`${category.id}_${index}`] = score;
    });
  });
  return responses;
};

/**
 * Simulates completing the assessment with given scores
 * @param {Object} screen - RTL screen object
 * @param {number} score - Score to use for answers
 */
export const completeAssessment = (screen, score = 3) => {
  categories.forEach(() => {
    const questions = screen.getAllByRole('radio');
    questions.forEach(question => {
      if (question.value === String(score)) {
        fireEvent.click(question);
      }
    });
    
    const nextButton = screen.getByText(/Next/i) || screen.getByText(/Submit/i);
    fireEvent.click(nextButton);
  });
};

/**
 * Verifies the assessment results are displayed correctly
 * @param {Object} screen - RTL screen object
 * @returns {boolean} Whether all expected elements are present
 */
export const verifyResults = (screen) => {
  const requiredElements = [
    /Your GitHub Engineering Health Score/i,
    /Priority Recommendations/i,
    /Your Score/i
  ];

  return requiredElements.every(element => 
    screen.getByText(element) !== null
  );
};