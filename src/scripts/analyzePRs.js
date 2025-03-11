/**
 * Script to analyze PRs using rule-based analysis
 * Usage: node analyzePRs.js <pr-data-file>
 */

import fs from 'fs';
import path from 'path';
// Import rule-based analysis instead of OpenAI
import { analyzePR } from '../analysis/ruleBased/analyzePR.js';

const main = async () => {
  // Get command line arguments - we don't need API key anymore
  const [prDataFile] = process.argv.slice(2);
  
  if (!prDataFile) {
    console.error('Usage: node analyzePRs.js <pr-data-file>');
    process.exit(1);
  }
  
  try {
    // Read PR data from file
    const prData = JSON.parse(fs.readFileSync(prDataFile, 'utf8'));
    
    // Analyze all PRs (no limit now since we aren't using paid API)
    const insights = [];
    
    for (const pr of prData) {
      console.error(`Analyzing PR: ${pr.title}`);
      const analysis = analyzePR(pr);
      insights.push({
        prId: pr.id,
        prTitle: pr.title,
        analysis
      });
    }
    
    const today = new Date().toISOString().split('T')[0];
    const insightsDir = path.join('data', 'insights', today);
    if (!fs.existsSync(insightsDir)) fs.mkdirSync(insightsDir, { recursive: true });

    const outputFile = path.join(insightsDir, 'pr-insights.json');
    
    // Make sure to write the entire object as valid JSON
    fs.writeFileSync(outputFile, JSON.stringify(insights, null, 2));
    
    // Print success message to stderr so it doesn't pollute stdout
    console.error(`PR insights saved to ${outputFile}`);
    
    // Print the insights to stdout for piping
    console.log(JSON.stringify(insights, null, 2));
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

main();