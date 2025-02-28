#!/usr/bin/env node

const { execSync } = require('child_process');
const argv = require('yargs')
  .option('type', {
    alias: 't',
    describe: 'Test type to run',
    choices: ['unit', 'integration', 'property', 'stress', 'e2e', 'all']
  })
  .option('watch', {
    alias: 'w',
    describe: 'Watch mode',
    type: 'boolean'
  })
  .option('coverage', {
    alias: 'c',
    describe: 'Collect coverage',
    type: 'boolean'
  })
  .option('debug', {
    alias: 'd',
    describe: 'Run with Node inspector',
    type: 'boolean'
  })
  .argv;

function runTests() {
  const testType = argv.type || 'unit';
  const watch = argv.watch ? '--watch' : '';
  const coverage = argv.coverage ? '--coverage' : '';
  const debug = argv.debug ? '--inspect-brk' : '';

  const command = [
    'jest',
    testType !== 'all' ? `--selectProjects ${testType}` : '',
    watch,
    coverage,
    debug,
    '--colors',
    '--verbose'
  ].filter(Boolean).join(' ');

  try {
    execSync(command, { stdio: 'inherit' });
  } catch (error) {
    process.exit(1);
  }
}

// Run stress tests with proper Node flags
if (argv.type === 'stress') {
  process.env.NODE_OPTIONS = '--max-old-space-size=4096 --expose-gc';
}

runTests();