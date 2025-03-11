/**
 * Rule-based PR analysis without requiring OpenAI
 */

/**
 * Analyzes PR data using predefined rules
 * @param {Object} prData - Pull request data from GitHub API
 * @returns {Object} Analysis results
 */
export function analyzePR(prData) {
  // Extract relevant PR data
  const title = prData.title || '';
  const description = prData.body || '';
  const changedFiles = prData.changedFiles || 0;
  const additions = prData.additions || 0;
  const deletions = prData.deletions || 0;
  const reviewCount = (prData.reviews?.nodes || []).length;
  const commentCount = (prData.comments?.nodes || []).length;
  
  // Initialize score components
  let score = 70; // Start with a neutral score
  const titleQuality = analyzeTitleQuality(title);
  const descriptionQuality = analyzeDescriptionQuality(description);
  const sizeComplexity = analyzeSizeComplexity(additions, deletions, changedFiles);
  const reviewQuality = analyzeReviewQuality(reviewCount, commentCount);
  
  // Calculate overall score
  score += titleQuality.score;
  score += descriptionQuality.score;
  score += sizeComplexity.score;
  score += reviewQuality.score;
  
  // Cap score between 0-100
  score = Math.max(0, Math.min(100, score));
  
  // Generate recommendations based on findings
  const recommendations = [
    ...titleQuality.recommendations,
    ...descriptionQuality.recommendations,
    ...sizeComplexity.recommendations,
    ...reviewQuality.recommendations
  ].filter(Boolean);
  
  // Identify positive aspects
  const positiveAspects = [
    ...titleQuality.positives,
    ...descriptionQuality.positives,
    ...sizeComplexity.positives,
    ...reviewQuality.positives
  ].filter(Boolean);
  
  return {
    score: Math.round(score),
    titleQuality: titleQuality.rating,
    descriptionQuality: descriptionQuality.rating,
    recommendations: recommendations.slice(0, 3), // Limit to top 3 recommendations
    positiveAspects: positiveAspects.slice(0, 3)  // Limit to top 3 positive aspects
  };
}

/**
 * Analyzes PR title quality
 */
function analyzeTitleQuality(title) {
  const result = { score: 0, rating: 'Poor', recommendations: [], positives: [] };
  
  if (!title) {
    result.recommendations.push('Add a descriptive title to your PR.');
    return result;
  }
  
  // Check title length (not too short, not too long)
  if (title.length < 10) {
    result.recommendations.push('Use a more descriptive PR title (aim for 10+ characters).');
    result.score -= 5;
  } else if (title.length > 10 && title.length < 100) {
    result.score += 5;
    result.positives.push('PR title has good length.');
  }
  
  // Check for common prefixes like "feat:", "fix:", etc.
  if (/^(feat|fix|docs|style|refactor|test|chore):/i.test(title)) {
    result.score += 5;
    result.positives.push('PR title follows conventional commit format.');
  } else {
    result.recommendations.push('Consider using conventional commit prefixes in your title (e.g., "feat:", "fix:").');
  }
  
  // Update rating based on score
  if (result.score >= 5) result.rating = 'Good';
  if (result.score >= 8) result.rating = 'Excellent';
  
  return result;
}

/**
 * Analyzes PR description quality
 */
function analyzeDescriptionQuality(description) {
  const result = { score: 0, rating: 'Poor', recommendations: [], positives: [] };
  
  if (!description) {
    result.recommendations.push('Add a description to your PR explaining the changes.');
    return result;
  }
  
  // Check description length
  if (description.length < 50) {
    result.recommendations.push('Provide a more detailed description of your changes (aim for 50+ characters).');
    result.score -= 5;
  } else if (description.length >= 50 && description.length < 500) {
    result.score += 5;
    result.positives.push('PR has a reasonably detailed description.');
  } else if (description.length >= 500) {
    result.score += 10;
    result.positives.push('PR has a very detailed description.');
  }
  
  // Check for common sections like "Why", "How", "Testing"
  if (/why|reason|background|context/i.test(description)) {
    result.score += 3;
    result.positives.push('Description explains the context/reason for changes.');
  } else {
    result.recommendations.push('Consider explaining WHY this change is needed in the description.');
  }
  
  if (/how|implementation|approach/i.test(description)) {
    result.score += 3;
    result.positives.push('Description explains the implementation approach.');
  }
  
  if (/test|testing|tested|validation/i.test(description)) {
    result.score += 3;
    result.positives.push('Description mentions testing/validation.');
  } else {
    result.recommendations.push('Consider explaining how you tested these changes.');
  }
  
  // Update rating based on score
  if (result.score >= 5) result.rating = 'Good';
  if (result.score >= 10) result.rating = 'Excellent';
  
  return result;
}

/**
 * Analyzes PR size and complexity
 */
function analyzeSizeComplexity(additions, deletions, changedFiles) {
  const result = { score: 0, rating: 'Good', recommendations: [], positives: [] };
  
  // Check PR size
  const totalChanges = additions + deletions;
  
  if (changedFiles > 10) {
    result.score -= 5;
    result.recommendations.push('Consider breaking this PR into smaller ones (10+ files changed).');
  } else if (changedFiles <= 5) {
    result.score += 3;
    result.positives.push('PR changes a manageable number of files.');
  }
  
  if (totalChanges > 500) {
    result.score -= 5;
    result.recommendations.push('This PR is quite large. Consider breaking it into smaller PRs.');
  } else if (totalChanges <= 200) {
    result.score += 5;
    result.positives.push('PR has a reasonable number of code changes.');
  }
  
  // Update rating based on score
  if (result.score < 0) result.rating = 'Poor';
  if (result.score > 3) result.rating = 'Excellent';
  
  return result;
}

/**
 * Analyzes PR review quality
 */
function analyzeReviewQuality(reviewCount, commentCount) {
  const result = { score: 0, rating: 'Poor', recommendations: [], positives: [] };
  
  if (reviewCount === 0) {
    result.recommendations.push('This PR has no reviews. Consider requesting a review.');
    result.score -= 5;
  } else {
    result.score += 5;
    result.positives.push(`PR has ${reviewCount} review(s).`);
  }
  
  if (commentCount === 0 && reviewCount > 0) {
    result.recommendations.push('This PR has reviews but no comments. Consider asking for more detailed feedback.');
  } else if (commentCount > 0) {
    result.score += Math.min(5, commentCount); // Up to +5 for comments
    result.positives.push(`PR has ${commentCount} comment(s).`);
  }
  
  // Update rating based on score
  if (result.score >= 5) result.rating = 'Good';
  if (result.score >= 8) result.rating = 'Excellent';
  
  return result;
} 