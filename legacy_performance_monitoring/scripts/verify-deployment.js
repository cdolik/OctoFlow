const fetch = require('node-fetch');
const chalk = require('chalk');

const DEPLOYMENT_URL = 'https://yourusername.github.io/OctoFlow';
const CRITICAL_PATHS = [
  '/',
  '/assessment/pre-seed',
  '/preferences',
  '/manifest.json',
  '/static/js/main.js',
  '/static/css/main.css'
];

const HEALTH_CHECKS = [
  {
    name: 'Service Worker Registration',
    test: async () => {
      const response = await fetch(`${DEPLOYMENT_URL}/service-worker.js`);
      return response.status === 200;
    }
  },
  {
    name: 'Static Asset Caching',
    test: async () => {
      const response = await fetch(`${DEPLOYMENT_URL}/static/css/main.css`);
      return response.headers.get('cache-control')?.includes('max-age');
    }
  },
  {
    name: 'Security Headers',
    test: async () => {
      const response = await fetch(DEPLOYMENT_URL);
      return response.headers.get('x-frame-options') === 'DENY' &&
             response.headers.get('x-content-type-options') === 'nosniff';
    }
  }
];

async function verifyPath(path) {
  try {
    const response = await fetch(`${DEPLOYMENT_URL}${path}`);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    
    console.log(chalk.green(`✓ ${path} - ${response.status}`));
    return true;
  } catch (error) {
    console.error(chalk.red(`✗ ${path} - ${error.message}`));
    return false;
  }
}

async function runHealthCheck(check) {
  try {
    const passed = await check.test();
    if (passed) {
      console.log(chalk.green(`✓ ${check.name}`));
    } else {
      throw new Error('Check failed');
    }
    return passed;
  } catch (error) {
    console.error(chalk.red(`✗ ${check.name} - ${error.message}`));
    return false;
  }
}

async function main() {
  console.log(chalk.blue('Starting deployment verification...'));
  
  // Verify critical paths
  console.log(chalk.yellow('\nVerifying critical paths:'));
  const pathResults = await Promise.all(
    CRITICAL_PATHS.map(verifyPath)
  );

  // Run health checks
  console.log(chalk.yellow('\nRunning health checks:'));
  const healthResults = await Promise.all(
    HEALTH_CHECKS.map(runHealthCheck)
  );

  // Calculate success rate
  const totalChecks = pathResults.length + healthResults.length;
  const passedChecks = [
    ...pathResults,
    ...healthResults
  ].filter(Boolean).length;
  
  const successRate = (passedChecks / totalChecks) * 100;

  console.log(chalk.yellow('\nVerification Summary:'));
  console.log(`Success Rate: ${successRate.toFixed(1)}%`);
  console.log(`Passed: ${passedChecks}/${totalChecks} checks`);

  if (successRate < 100) {
    console.error(chalk.red('\n⚠️ Deployment verification failed'));
    process.exit(1);
  } else {
    console.log(chalk.green('\n✅ Deployment verification successful'));
  }
}

main().catch(error => {
  console.error(chalk.red('Verification script failed:'), error);
  process.exit(1);
});