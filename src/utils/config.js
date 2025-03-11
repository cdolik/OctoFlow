/**
 * Configuration utility to load environment variables
 */
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// Get the directory name in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from .env file
const envPath = path.resolve(process.cwd(), '.env');
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
}

export const github = {
  token: process.env.GITHUB_TOKEN,
  defaultOwner: process.env.REPO_OWNER || 'cdolik',
  defaultRepo: process.env.REPO_NAME || 'OctoFlow',
};

export const validateEnv = () => {
  const requiredVars = ['GITHUB_TOKEN'];
  const missing = requiredVars.filter(varName => !process.env[varName]);
  
  if (missing.length > 0) {
    console.error(`Error: Missing required environment variables: ${missing.join(', ')}`);
    console.error('Please create a .env file with these variables or set them in your environment.');
    return false;
  }
  return true;
}; 