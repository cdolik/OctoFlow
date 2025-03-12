#!/usr/bin/env node

/**
 * OctoFlow Security Audit Script
 * 
 * This script performs a basic security audit of the codebase to identify
 * potential security issues. It checks for:
 * 
 * 1. Hardcoded secrets and tokens
 * 2. Insecure patterns in code
 * 3. Outdated dependencies with known vulnerabilities
 * 4. Missing security headers
 * 5. Insecure localStorage usage
 * 
 * Usage:
 *   node scripts/security-audit.js
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const crypto = require('crypto');

// Configuration
const config = {
  // Directories to scan
  scanDirs: ['src', 'public'],
  
  // Files to exclude
  excludeFiles: [
    'node_modules',
    '.git',
    'build',
    'dist',
    '.env',
    '.env.local',
    '.env.development',
    '.env.test',
    '.env.production'
  ],
  
  // Patterns to check for
  patterns: {
    // Potential hardcoded secrets
    secrets: [
      /(['"])(?:api|jwt|token|key|secret|password|pw|auth)_?[a-z0-9_]*(['"])\s*[:=]\s*['"][a-zA-Z0-9_\-./+]{8,}['"](?!.*process\.env)/i,
      /(['"])(?:gh|github|gitlab|aws|azure|firebase)_?(?:token|key|secret)(['"])\s*[:=]\s*['"][a-zA-Z0-9_\-./+]{8,}['"](?!.*process\.env)/i,
      /(['"])access_?(?:token|key)(['"])\s*[:=]\s*['"][a-zA-Z0-9_\-./+]{8,}['"](?!.*process\.env)/i,
      /(['"])refresh_?token(['"])\s*[:=]\s*['"][a-zA-Z0-9_\-./+]{8,}['"](?!.*process\.env)/i,
      /(['"])private_?key(['"])\s*[:=]\s*['"]-----BEGIN(?:(?!-----END).)+['"](?!.*process\.env)/is,
      /(['"])client_?(?:id|secret)(['"])\s*[:=]\s*['"][a-zA-Z0-9_\-./+]{8,}['"](?!.*process\.env)/i
    ],
    
    // Insecure patterns
    insecure: [
      { pattern: /eval\s*\(/, description: 'Use of eval() is potentially dangerous' },
      { pattern: /document\.write\s*\(/, description: 'Use of document.write() is potentially dangerous' },
      { pattern: /innerHTML\s*=/, description: 'Use of innerHTML is potentially dangerous, prefer textContent' },
      { pattern: /dangerouslySetInnerHTML/, description: 'Use of dangerouslySetInnerHTML is potentially dangerous' },
      { pattern: /localStorage\.setItem\s*\(\s*(['"])(?!__storage_test__)[\w\-]+\1\s*,(?!.*secureStore)/, description: 'Direct use of localStorage without encryption' },
      { pattern: /sessionStorage\.setItem\s*\(\s*(['"])[\w\-]+\1\s*,(?!.*secureStore)/, description: 'Direct use of sessionStorage without encryption' },
      { pattern: /new\s+Function\s*\(/, description: 'Use of new Function() is potentially dangerous' },
      { pattern: /setTimeout\s*\(\s*['"]/, description: 'Use of setTimeout with string argument is potentially dangerous' },
      { pattern: /setInterval\s*\(\s*['"]/, description: 'Use of setInterval with string argument is potentially dangerous' },
      { pattern: /console\.log\s*\(.*password/i, description: 'Logging of sensitive data' },
      { pattern: /console\.log\s*\(.*token/i, description: 'Logging of sensitive data' },
      { pattern: /console\.log\s*\(.*secret/i, description: 'Logging of sensitive data' },
      { pattern: /console\.log\s*\(.*key/i, description: 'Logging of sensitive data' },
      { pattern: /Object\.assign\s*\(\s*{}\s*,/, description: 'Potential prototype pollution, use spread operator instead' },
      { pattern: /\.map\s*\(\s*eval\s*\)/, description: 'Use of eval in map is extremely dangerous' }
    ],
    
    // Missing security headers
    missingHeaders: [
      { pattern: /<meta\s+http-equiv=["']Content-Security-Policy["']/i, description: 'Content Security Policy header', required: true },
      { pattern: /<meta\s+http-equiv=["']X-Content-Type-Options["']/i, description: 'X-Content-Type-Options header', required: true },
      { pattern: /<meta\s+http-equiv=["']X-Frame-Options["']/i, description: 'X-Frame-Options header', required: true },
      { pattern: /<meta\s+http-equiv=["']X-XSS-Protection["']/i, description: 'X-XSS-Protection header', required: true },
      { pattern: /<meta\s+http-equiv=["']Referrer-Policy["']/i, description: 'Referrer-Policy header', required: false }
    ]
  }
};

// Results storage
const results = {
  secrets: [],
  insecure: [],
  missingHeaders: [],
  dependencies: [],
  summary: {
    filesScanned: 0,
    secretsFound: 0,
    insecurePatternsFound: 0,
    missingHeadersFound: 0,
    vulnerableDepsFound: 0
  }
};

// Color codes for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  bold: '\x1b[1m'
};

/**
 * Check if a file should be excluded from scanning
 */
function shouldExcludeFile(filePath) {
  return config.excludeFiles.some(exclude => filePath.includes(exclude));
}

/**
 * Scan a file for security issues
 */
function scanFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const fileExt = path.extname(filePath).toLowerCase();
    results.summary.filesScanned++;
    
    // Check for hardcoded secrets
    config.patterns.secrets.forEach(pattern => {
      const matches = content.match(pattern);
      if (matches) {
        results.summary.secretsFound++;
        results.secrets.push({
          file: filePath,
          match: matches[0],
          line: findLineNumber(content, matches[0])
        });
      }
    });
    
    // Check for insecure patterns
    config.patterns.insecure.forEach(({ pattern, description }) => {
      const matches = content.match(pattern);
      if (matches) {
        results.summary.insecurePatternsFound++;
        results.insecure.push({
          file: filePath,
          pattern: pattern.toString(),
          description,
          match: matches[0],
          line: findLineNumber(content, matches[0])
        });
      }
    });
    
    // Check for missing security headers in HTML files
    if (fileExt === '.html') {
      config.patterns.missingHeaders.forEach(({ pattern, description, required }) => {
        if (!content.match(pattern)) {
          results.summary.missingHeadersFound++;
          results.missingHeaders.push({
            file: filePath,
            description,
            required
          });
        }
      });
    }
  } catch (error) {
    console.error(`Error scanning file ${filePath}:`, error.message);
  }
}

/**
 * Find the line number of a match in a string
 */
function findLineNumber(content, match) {
  const lines = content.split('\n');
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes(match)) {
      return i + 1;
    }
  }
  return -1;
}

/**
 * Recursively scan a directory for files
 */
function scanDirectory(dir) {
  try {
    const files = fs.readdirSync(dir);
    
    files.forEach(file => {
      const filePath = path.join(dir, file);
      
      if (shouldExcludeFile(filePath)) {
        return;
      }
      
      const stats = fs.statSync(filePath);
      
      if (stats.isDirectory()) {
        scanDirectory(filePath);
      } else if (stats.isFile()) {
        scanFile(filePath);
      }
    });
  } catch (error) {
    console.error(`Error scanning directory ${dir}:`, error.message);
  }
}

/**
 * Check for vulnerable dependencies using npm audit
 */
function checkDependencies() {
  try {
    console.log(`${colors.blue}Checking for vulnerable dependencies...${colors.reset}`);
    
    const output = execSync('npm audit --json', { encoding: 'utf8' });
    const auditData = JSON.parse(output);
    
    if (auditData.vulnerabilities) {
      const vulnerabilities = Object.values(auditData.vulnerabilities);
      
      vulnerabilities.forEach(vuln => {
        results.summary.vulnerableDepsFound++;
        results.dependencies.push({
          name: vuln.name,
          severity: vuln.severity,
          via: Array.isArray(vuln.via) ? vuln.via.map(v => typeof v === 'string' ? v : v.name).join(', ') : vuln.via,
          fixAvailable: vuln.fixAvailable
        });
      });
    }
  } catch (error) {
    console.error('Error checking dependencies:', error.message);
  }
}

/**
 * Print the results of the security audit
 */
function printResults() {
  console.log('\n' + '='.repeat(80));
  console.log(`${colors.bold}${colors.cyan}OctoFlow Security Audit Results${colors.reset}`);
  console.log('='.repeat(80));
  
  // Print summary
  console.log(`\n${colors.bold}Summary:${colors.reset}`);
  console.log(`Files scanned: ${results.summary.filesScanned}`);
  console.log(`Potential secrets found: ${results.summary.secretsFound > 0 ? colors.red : colors.green}${results.summary.secretsFound}${colors.reset}`);
  console.log(`Insecure patterns found: ${results.summary.insecurePatternsFound > 0 ? colors.yellow : colors.green}${results.summary.insecurePatternsFound}${colors.reset}`);
  console.log(`Missing security headers: ${results.summary.missingHeadersFound > 0 ? colors.yellow : colors.green}${results.summary.missingHeadersFound}${colors.reset}`);
  console.log(`Vulnerable dependencies: ${results.summary.vulnerableDepsFound > 0 ? colors.red : colors.green}${results.summary.vulnerableDepsFound}${colors.reset}`);
  
  // Print potential secrets
  if (results.secrets.length > 0) {
    console.log(`\n${colors.bold}${colors.red}Potential Secrets Found:${colors.reset}`);
    results.secrets.forEach(({ file, match, line }) => {
      console.log(`${colors.cyan}${file}:${line}${colors.reset}`);
      console.log(`  ${colors.red}${match}${colors.reset}`);
    });
    console.log(`\n${colors.yellow}Warning: These may be false positives. Please review manually.${colors.reset}`);
  }
  
  // Print insecure patterns
  if (results.insecure.length > 0) {
    console.log(`\n${colors.bold}${colors.yellow}Insecure Patterns Found:${colors.reset}`);
    results.insecure.forEach(({ file, description, match, line }) => {
      console.log(`${colors.cyan}${file}:${line}${colors.reset}`);
      console.log(`  ${colors.yellow}${description}${colors.reset}`);
      console.log(`  ${match}`);
    });
  }
  
  // Print missing security headers
  if (results.missingHeaders.length > 0) {
    console.log(`\n${colors.bold}${colors.yellow}Missing Security Headers:${colors.reset}`);
    results.missingHeaders.forEach(({ file, description, required }) => {
      console.log(`${colors.cyan}${file}${colors.reset}`);
      console.log(`  ${required ? colors.red : colors.yellow}Missing: ${description}${colors.reset}`);
    });
  }
  
  // Print vulnerable dependencies
  if (results.dependencies.length > 0) {
    console.log(`\n${colors.bold}${colors.red}Vulnerable Dependencies:${colors.reset}`);
    results.dependencies.forEach(({ name, severity, via, fixAvailable }) => {
      const severityColor = severity === 'critical' || severity === 'high' ? colors.red : 
                           severity === 'moderate' ? colors.yellow : colors.blue;
      
      console.log(`${colors.cyan}${name}${colors.reset}`);
      console.log(`  Severity: ${severityColor}${severity}${colors.reset}`);
      console.log(`  Via: ${via}`);
      console.log(`  Fix available: ${fixAvailable ? colors.green + 'Yes' : colors.red + 'No'}${colors.reset}`);
    });
  }
  
  // Print recommendations
  console.log('\n' + '='.repeat(80));
  console.log(`${colors.bold}${colors.cyan}Recommendations:${colors.reset}`);
  console.log('='.repeat(80));
  
  if (results.summary.secretsFound > 0) {
    console.log(`\n${colors.red}• Remove hardcoded secrets and use environment variables instead.${colors.reset}`);
    console.log(`  Use the secureStore functions in securityUtils.ts for sensitive data.`);
  }
  
  if (results.summary.insecurePatternsFound > 0) {
    console.log(`\n${colors.yellow}• Replace insecure patterns with safer alternatives:${colors.reset}`);
    console.log(`  - Use DOMPurify for sanitizing HTML content`);
    console.log(`  - Use secureStore/secureRetrieve for localStorage operations`);
    console.log(`  - Avoid eval(), innerHTML, and other dangerous functions`);
  }
  
  if (results.summary.missingHeadersFound > 0) {
    console.log(`\n${colors.yellow}• Add missing security headers to your HTML files.${colors.reset}`);
    console.log(`  Ensure Content-Security-Policy is properly configured.`);
  }
  
  if (results.summary.vulnerableDepsFound > 0) {
    console.log(`\n${colors.red}• Update vulnerable dependencies:${colors.reset}`);
    console.log(`  Run 'npm audit fix' to automatically fix issues.`);
    console.log(`  For major updates, review changes before updating.`);
  }
  
  console.log('\n' + '='.repeat(80));
}

// Main function
function main() {
  console.log(`${colors.bold}${colors.cyan}Starting OctoFlow Security Audit...${colors.reset}\n`);
  
  // Scan directories
  config.scanDirs.forEach(dir => {
    console.log(`${colors.blue}Scanning ${dir}...${colors.reset}`);
    scanDirectory(dir);
  });
  
  // Check dependencies
  checkDependencies();
  
  // Print results
  printResults();
}

// Run the script
main(); 