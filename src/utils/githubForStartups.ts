import { User } from '../types/github';

/**
 * Check if a user is eligible for GitHub for Startups program
 * Eligibility criteria:
 * - Series B or earlier
 * - New to GitHub Enterprise or GitHub Advanced Security
 * - Affiliated with an approved GitHub for Startups partner
 * 
 * @param user User object with eligibility information
 * @returns boolean indicating eligibility status
 */
export function checkEligibility(user: User): boolean {
  return (
    // Series B or earlier
    user.seriesFundingStage !== 'Series C+' &&
    // New to GitHub Enterprise or GitHub Advanced Security
    user.isGitHubEnterpriseCustomer === false &&
    // Affiliated with an approved GitHub for Startups partner
    user.isGitHubForStartupsPartner === true
  );
}

/**
 * Get reasons why a user is not eligible for GitHub for Startups
 * 
 * @param user User object with eligibility information
 * @returns Array of strings with ineligibility reasons
 */
export function getIneligibilityReasons(user: User): string[] {
  const reasons: string[] = [];
  
  if (user.seriesFundingStage === 'Series C+') {
    reasons.push("Series C or later companies are not eligible (must be Series B or earlier)");
  }
  
  if (user.isGitHubEnterpriseCustomer) {
    reasons.push("Already using GitHub Enterprise or GitHub Advanced Security");
  }
  
  if (!user.isGitHubForStartupsPartner) {
    reasons.push("Not affiliated with an approved GitHub for Startups partner");
  }
  
  return reasons;
}

/**
 * Get list of eligibility criteria as formatted strings
 * 
 * @returns Array of eligibility criteria strings
 */
export function getEligibilityCriteria(): string[] {
  return [
    "Series B or earlier",
    "New to GitHub Enterprise or GitHub Advanced Security",
    "Affiliated with an approved GitHub for Startups partner"
  ];
}

/**
 * Get GitHub for Startups benefits as formatted strings
 * 
 * @returns Array of benefits strings
 */
export function getGitHubStartupsBenefits(): string[] {
  return [
    "GitHub Enterprise: 20 seats free for the first year, 50% off in year two",
    "GitHub Advanced Security: 20 seats at 50% off in year one, 25% off in year two"
  ];
}

/**
 * Get GitHub partners URL
 * 
 * @returns GitHub for Startups partners page URL
 */
export function getPartnersUrl(): string {
  return "https://github.com/enterprise/startups";
}

/**
 * Get disclaimer message for unofficial application
 * 
 * @returns Disclaimer message string
 */
export function getDisclaimerMessage(): string {
  return "This is an unofficial GitHub OctoFlow application. Not affiliated with GitHub, Inc.";
} 