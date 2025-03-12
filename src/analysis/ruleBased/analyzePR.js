/**
 * Rule-based PR analysis
 * Analyzes PR data using predefined rules and returns a score and recommendations
 */

// Categories based on GitHub's Well-Architected Framework
const CATEGORIES = {
  FUNDAMENTALS: 'GitHub Fundamentals',
  COLLABORATION: 'Code Collaboration & Quality',
  VELOCITY: 'Engineering Velocity'
};

/**
 * Analyze a PR using rule-based analysis
 * @param {Object} prData - The PR data to analyze
 * @returns {Object} Analysis results including score, ratings, recommendations, and strengths
 */
export function analyzePR(prData) {
  // Extract relevant information from PR data
  const {
    title = '',
    body: description = '',
    changedFiles = 0,
    additions = 0,
    deletions = 0,
    reviews = [],
    comments = [],
    createdAt,
    mergedAt,
    state,
    labels = []
  } = prData;

  // Initialize score and ratings
  let score = 0;
  const ratings = {};
  const recommendations = [];
  const strengths = [];
  
  // Categorized recommendations and strengths
  const categorizedRecommendations = {
    fundamentals: [],
    collaboration: [],
    velocity: []
  };
  
  const categorizedStrengths = {
    fundamentals: [],
    collaboration: [],
    velocity: []
  };

  // 1. Analyze title quality (GitHub Fundamentals)
  const titleQuality = analyzeTitleQuality(title);
  ratings.titleQuality = titleQuality.score;
  score += titleQuality.score * 0.15; // 15% weight
  
  if (titleQuality.score < 0.7) {
    categorizedRecommendations.fundamentals.push(
      `Improve PR title: "${title}" - ${titleQuality.recommendation}`
    );
  } else if (titleQuality.score > 0.8) {
    categorizedStrengths.fundamentals.push(
      `Clear and descriptive PR title that follows best practices`
    );
  }

  // 2. Analyze description quality (GitHub Fundamentals)
  const descriptionQuality = analyzeDescriptionQuality(description);
  ratings.descriptionQuality = descriptionQuality.score;
  score += descriptionQuality.score * 0.25; // 25% weight
  
  if (descriptionQuality.score < 0.7) {
    categorizedRecommendations.fundamentals.push(
      `Enhance PR description: ${descriptionQuality.recommendation}`
    );
  } else if (descriptionQuality.score > 0.8) {
    categorizedStrengths.fundamentals.push(
      `Comprehensive PR description that explains the changes and purpose`
    );
  }

  // 3. Analyze PR size and complexity (Code Collaboration & Quality)
  const sizeComplexity = analyzeSizeComplexity(changedFiles, additions, deletions);
  ratings.sizeComplexity = sizeComplexity.score;
  score += sizeComplexity.score * 0.25; // 25% weight
  
  if (sizeComplexity.score < 0.7) {
    categorizedRecommendations.collaboration.push(
      `Consider breaking down this PR: ${sizeComplexity.recommendation}`
    );
  } else if (sizeComplexity.score > 0.8) {
    categorizedStrengths.collaboration.push(
      `Well-sized PR that's easy to review (${changedFiles} files, ${additions + deletions} lines)`
    );
  }

  // 4. Analyze review quality (Code Collaboration & Quality)
  const reviewQuality = analyzeReviewQuality(reviews, comments);
  ratings.reviewQuality = reviewQuality.score;
  score += reviewQuality.score * 0.20; // 20% weight
  
  if (reviewQuality.score < 0.7) {
    categorizedRecommendations.collaboration.push(
      `Improve review process: ${reviewQuality.recommendation}`
    );
  } else if (reviewQuality.score > 0.8) {
    categorizedStrengths.collaboration.push(
      `Strong review culture with meaningful feedback`
    );
  }
  
  // 5. Analyze engineering velocity (Engineering Velocity)
  const velocityMetrics = analyzeVelocity(createdAt, mergedAt, reviews);
  ratings.velocityScore = velocityMetrics.score;
  score += velocityMetrics.score * 0.15; // 15% weight
  
  if (velocityMetrics.score < 0.7) {
    categorizedRecommendations.velocity.push(
      `Improve engineering velocity: ${velocityMetrics.recommendation}`
    );
  } else if (velocityMetrics.score > 0.8) {
    categorizedStrengths.velocity.push(
      `Efficient PR lifecycle with quick feedback and resolution`
    );
  }
  
  // Add categorized recommendations to the main recommendations array
  Object.entries(categorizedRecommendations).forEach(([category, recs]) => {
    recommendations.push(...recs);
  });
  
  // Add categorized strengths to the main strengths array
  Object.entries(categorizedStrengths).forEach(([category, strs]) => {
    strengths.push(...strs);
  });
  
  // Add investor readiness recommendations if score is low
  if (score < 0.6) {
    recommendations.push(
      `Consider implementing GitHub best practices to improve investor readiness`
    );
  }
  
  // Add startup scaling recommendations
  if (changedFiles > 10 && reviews.length < 2) {
    recommendations.push(
      `As your startup scales, implement mandatory code reviews to maintain quality`
    );
  }
  
  // Add GitHub Well-Architected Framework recommendation
  if (score < 0.7) {
    recommendations.push(
      `Review GitHub's Well-Architected Framework for startup best practices`
    );
  }

  return {
    score: Math.min(1, Math.max(0, score)), // Ensure score is between 0 and 1
    ratings,
    recommendations,
    strengths,
    categories: {
      fundamentals: categorizedRecommendations.fundamentals,
      collaboration: categorizedRecommendations.collaboration,
      velocity: categorizedRecommendations.velocity
    },
    categoryStrengths: {
      fundamentals: categorizedStrengths.fundamentals,
      collaboration: categorizedStrengths.collaboration,
      velocity: categorizedStrengths.velocity
    }
  };
}

/**
 * Analyze title quality
 * @param {string} title - The PR title
 * @returns {Object} Analysis results including score and recommendation
 */
function analyzeTitleQuality(title) {
  if (!title) {
    return {
      score: 0,
      recommendation: 'Add a descriptive title that summarizes the changes'
    };
  }

  let score = 0.5; // Start with a base score
  let recommendation = '';

  // Check title length (not too short, not too long)
  if (title.length < 10) {
    score -= 0.2;
    recommendation += 'Use a more descriptive title. ';
  } else if (title.length > 100) {
    score -= 0.1;
    recommendation += 'Consider a more concise title. ';
  } else {
    score += 0.2;
  }

  // Check if title starts with a type prefix (feat:, fix:, etc.)
  const hasTypePrefix = /^(feat|fix|docs|style|refactor|test|chore|perf)(\(.+\))?:\s/.test(title);
  if (hasTypePrefix) {
    score += 0.2;
  } else {
    recommendation += 'Consider using conventional commit prefixes (feat:, fix:, etc.). ';
  }

  // Check if title is properly capitalized
  const isProperlyCapitalized = /^[A-Z]/.test(title.replace(/^(feat|fix|docs|style|refactor|test|chore|perf)(\(.+\))?:\s/, ''));
  if (isProperlyCapitalized) {
    score += 0.1;
  } else {
    recommendation += 'Capitalize the first word of the description. ';
  }

  // If no recommendations, it's a good title
  if (!recommendation) {
    recommendation = 'Title follows best practices';
  }

  return {
    score: Math.min(1, Math.max(0, score)), // Ensure score is between 0 and 1
    recommendation: recommendation.trim()
  };
}

/**
 * Analyze description quality
 * @param {string} description - The PR description
 * @returns {Object} Analysis results including score and recommendation
 */
function analyzeDescriptionQuality(description) {
  if (!description) {
    return {
      score: 0,
      recommendation: 'Add a description that explains the purpose and context of the changes'
    };
  }

  let score = 0.3; // Start with a base score
  let recommendation = '';

  // Check description length
  if (description.length < 50) {
    score -= 0.1;
    recommendation += 'Provide a more detailed description. ';
  } else if (description.length > 100) {
    score += 0.2;
  }

  // Check for sections (e.g., ## Summary, ## Changes, etc.)
  const hasSections = /##\s+\w+/i.test(description);
  if (hasSections) {
    score += 0.2;
  } else {
    recommendation += 'Consider using markdown sections (## Summary, ## Changes) for better organization. ';
  }

  // Check for links to issues or other references
  const hasLinks = /#\d+|https?:\/\/\S+/i.test(description);
  if (hasLinks) {
    score += 0.2;
  } else {
    recommendation += 'Link to related issues or external resources. ';
  }

  // Check for bullet points or numbered lists
  const hasList = /(\n\s*[-*]\s|\n\s*\d+\.\s)/i.test(description);
  if (hasList) {
    score += 0.1;
  } else {
    recommendation += 'Use bullet points or numbered lists to detail changes. ';
  }

  // If no recommendations, it's a good description
  if (!recommendation) {
    recommendation = 'Description follows best practices';
  }

  return {
    score: Math.min(1, Math.max(0, score)), // Ensure score is between 0 and 1
    recommendation: recommendation.trim()
  };
}

/**
 * Analyze PR size and complexity
 * @param {number} changedFiles - Number of files changed
 * @param {number} additions - Number of lines added
 * @param {number} deletions - Number of lines deleted
 * @returns {Object} Analysis results including score and recommendation
 */
function analyzeSizeComplexity(changedFiles, additions, deletions) {
  let score = 0.5; // Start with a base score
  let recommendation = '';

  const totalChanges = additions + deletions;

  // Analyze based on number of files changed
  if (changedFiles > 20) {
    score -= 0.3;
    recommendation += 'PR changes too many files (>20). Consider breaking it down. ';
  } else if (changedFiles > 10) {
    score -= 0.2;
    recommendation += 'PR changes a significant number of files (>10). Consider if it can be smaller. ';
  } else if (changedFiles <= 5) {
    score += 0.2;
  }

  // Analyze based on total lines changed
  if (totalChanges > 1000) {
    score -= 0.3;
    recommendation += 'PR is too large (>1000 lines). Break it into smaller, focused PRs. ';
  } else if (totalChanges > 500) {
    score -= 0.2;
    recommendation += 'PR is large (>500 lines). Consider breaking it down if possible. ';
  } else if (totalChanges > 200) {
    score -= 0.1;
    recommendation += 'PR is medium-sized (>200 lines). Smaller PRs are easier to review. ';
  } else if (totalChanges <= 100) {
    score += 0.3;
  }

  // If no recommendations, it's a good size
  if (!recommendation) {
    recommendation = 'PR size is appropriate for effective review';
  }

  return {
    score: Math.min(1, Math.max(0, score)), // Ensure score is between 0 and 1
    recommendation: recommendation.trim()
  };
}

/**
 * Analyze review quality
 * @param {Array} reviews - Array of reviews
 * @param {Array} comments - Array of comments
 * @returns {Object} Analysis results including score and recommendation
 */
function analyzeReviewQuality(reviews, comments) {
  let score = 0.3; // Start with a base score
  let recommendation = '';

  // Check if there are any reviews
  if (!reviews || reviews.length === 0) {
    score = 0.1;
    recommendation += 'No reviews yet. Request reviews from team members. ';
    return {
      score,
      recommendation: recommendation.trim()
    };
  }

  // Analyze number of reviewers
  if (reviews.length >= 2) {
    score += 0.3;
  } else {
    recommendation += 'Consider getting reviews from at least 2 team members. ';
  }

  // Analyze review comments
  const reviewComments = comments ? comments.length : 0;
  if (reviewComments > 5) {
    score += 0.2;
  } else if (reviewComments === 0) {
    score -= 0.1;
    recommendation += 'No review comments. Encourage more detailed feedback. ';
  }

  // Analyze approval state
  const approvedReviews = reviews.filter(review => review.state === 'APPROVED').length;
  if (approvedReviews > 0) {
    score += 0.2;
  } else {
    recommendation += 'No approvals yet. Address review comments and seek approval. ';
  }

  // If no recommendations, it's a good review process
  if (!recommendation) {
    recommendation = 'Good review process with appropriate feedback';
  }

  return {
    score: Math.min(1, Math.max(0, score)), // Ensure score is between 0 and 1
    recommendation: recommendation.trim()
  };
}

/**
 * Analyze engineering velocity
 * @param {string} createdAt - PR creation timestamp
 * @param {string} mergedAt - PR merge timestamp
 * @param {Array} reviews - Array of reviews
 * @returns {Object} Analysis results including score and recommendation
 */
function analyzeVelocity(createdAt, mergedAt, reviews) {
  let score = 0.5; // Start with a base score
  let recommendation = '';
  
  // If PR isn't merged yet, we can't fully analyze velocity
  if (!mergedAt) {
    // Check if PR has been open for too long
    const createdDate = new Date(createdAt);
    const now = new Date();
    const daysOpen = (now - createdDate) / (1000 * 60 * 60 * 24);
    
    if (daysOpen > 14) {
      score -= 0.3;
      recommendation += 'PR has been open for over 2 weeks. Consider resolving or closing. ';
    } else if (daysOpen > 7) {
      score -= 0.2;
      recommendation += 'PR has been open for over a week. Try to resolve it soon. ';
    }
    
    return {
      score: Math.min(1, Math.max(0, score)),
      recommendation: recommendation || 'PR is still in progress'
    };
  }
  
  // Calculate time to merge
  const createdDate = new Date(createdAt);
  const mergedDate = new Date(mergedAt);
  const daysToMerge = (mergedDate - createdDate) / (1000 * 60 * 60 * 24);
  
  // Analyze time to merge
  if (daysToMerge < 1) {
    score += 0.3; // Quick merge is good
  } else if (daysToMerge > 7) {
    score -= 0.2;
    recommendation += 'PR took over a week to merge. Consider ways to speed up the review process. ';
  } else if (daysToMerge > 3) {
    score -= 0.1;
    recommendation += 'PR took several days to merge. Aim for faster turnaround when possible. ';
  }
  
  // Analyze time to first review (if reviews exist)
  if (reviews && reviews.length > 0) {
    const firstReviewDate = new Date(reviews[0].submittedAt);
    const hoursToFirstReview = (firstReviewDate - createdDate) / (1000 * 60 * 60);
    
    if (hoursToFirstReview < 4) {
      score += 0.2; // Quick first review is good
    } else if (hoursToFirstReview > 48) {
      score -= 0.2;
      recommendation += 'First review took over 2 days. Aim for faster initial feedback. ';
    } else if (hoursToFirstReview > 24) {
      score -= 0.1;
      recommendation += 'First review took over a day. Consider setting up review SLAs. ';
    }
  }
  
  // If no recommendations, velocity is good
  if (!recommendation) {
    recommendation = 'Good engineering velocity with timely reviews and merges';
  }
  
  return {
    score: Math.min(1, Math.max(0, score)),
    recommendation: recommendation.trim()
  };
} 