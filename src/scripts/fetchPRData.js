/**
 * Script to fetch PR data and save it to a file
 * Usage: node fetchPRData.js [owner] [repo]
 * If owner and repo are not provided, values from .env will be used
 */

import fs from 'fs';
import path from 'path';
import { fetchPRData } from '../data/github/fetchPRData.js';

const main = async () => {
  // Get command line arguments or use defaults from .env
  const owner = process.argv[2] || process.env.REPO_OWNER;
  const repo = process.argv[3] || process.env.REPO_NAME;
  const token = process.env.GITHUB_TOKEN;
  const useSample = process.env.USE_SAMPLE === 'true';
  
  console.error('Environment check:');
  console.error(`- USE_SAMPLE: ${process.env.USE_SAMPLE} (parsed as: ${useSample})`);
  console.error(`- Owner: ${owner}`);
  console.error(`- Repo: ${repo}`);
  console.error(`- Token present: ${token ? 'Yes' : 'No'}`);
  
  if (!owner || !repo) {
    console.error('Usage: node fetchPRData.js <owner> <repo>');
    console.error('Or set REPO_OWNER and REPO_NAME in .env file');
    process.exit(1);
  }
  
  if (!token && !useSample) {
    console.error('Error: GitHub token not found');
    console.error('Please set GITHUB_TOKEN in .env file or environment');
    process.exit(1);
  }
  
  try {
    let prData;
    
    if (useSample) {
      // Use sample data if requested or if token is invalid
      console.error('Using sample PR data for development (USE_SAMPLE=true)');
      prData = samplePrData();
    } else {
      // Fetch actual data from GitHub
      console.error(`Fetching PR data from GitHub API for ${owner}/${repo}...`);
      prData = await fetchPRData(owner, repo, token);
      
      if (prData.error) {
        console.error('Error fetching PR data:', prData.error);
        console.error('Falling back to sample data...');
        prData = samplePrData();
      }
    }
    
    console.log(JSON.stringify(prData, null, 2));
  } catch (error) {
    console.error('Error:', error);
    console.error('Falling back to sample data due to error...');
    console.log(JSON.stringify(samplePrData(), null, 2));
  }
};

// Sample PR data for testing when GitHub API can't be used
function samplePrData() {
  return [
    {
      id: 'sample-pr-1',
      title: 'Sample PR for Testing',
      body: 'This is a sample PR description to test the analysis pipeline.',
      state: 'OPEN',
      additions: 120,
      deletions: 30,
      changedFiles: 5,
      reviews: { nodes: [] },
      comments: { nodes: [] },
      commits: { nodes: [{ commit: { message: 'Sample commit message' } }] }
    },
    {
      id: 'sample-pr-2',
      title: 'feat: Sample feature PR',
      body: 'This PR adds a new feature.\n\nWhy:\nTo demonstrate the analysis pipeline.\n\nHow:\nBy creating a sample PR object.',
      state: 'OPEN',
      additions: 250,
      deletions: 50,
      changedFiles: 8,
      reviews: { nodes: [{ author: { login: 'reviewer' }, body: 'Looks good!', state: 'APPROVED' }] },
      comments: { nodes: [{ author: { login: 'commenter' }, body: 'Nice work!', createdAt: new Date().toISOString() }] },
      commits: { nodes: [{ commit: { message: 'feat: Add sample feature' } }] }
    }
  ];
}

main();