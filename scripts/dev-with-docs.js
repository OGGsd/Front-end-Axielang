#!/usr/bin/env node

/**
 * Development script to run Axie Studio frontend with documentation
 * This script starts both the frontend dev server and documentation server concurrently
 */

const { spawn } = require('child_process');
const path = require('path');

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(color, prefix, message) {
  console.log(`${color}${colors.bright}[${prefix}]${colors.reset} ${message}`);
}

function startProcess(name, command, args, cwd, color) {
  const process = spawn(command, args, {
    cwd,
    stdio: 'pipe',
    shell: true
  });

  process.stdout.on('data', (data) => {
    const lines = data.toString().split('\n').filter(line => line.trim());
    lines.forEach(line => log(color, name, line));
  });

  process.stderr.on('data', (data) => {
    const lines = data.toString().split('\n').filter(line => line.trim());
    lines.forEach(line => log(colors.red, name, line));
  });

  process.on('close', (code) => {
    log(colors.red, name, `Process exited with code ${code}`);
  });

  return process;
}

async function main() {
  console.log(`${colors.cyan}${colors.bright}🚀 Starting Axie Studio Development Environment${colors.reset}\n`);

  const frontendDir = __dirname + '/..';
  const docsDir = path.resolve(frontendDir, '../axie-studio-docs');

  // Check if documentation directory exists
  const fs = require('fs');
  if (!fs.existsSync(docsDir)) {
    log(colors.red, 'ERROR', `Documentation directory not found: ${docsDir}`);
    log(colors.yellow, 'INFO', 'Make sure axie-studio-docs is in the parent directory');
    process.exit(1);
  }

  log(colors.green, 'INFO', 'Starting documentation server...');
  const docsProcess = startProcess(
    'DOCS',
    'npm',
    ['run', 'start', '--', '--port', '3001'],
    docsDir,
    colors.blue
  );

  // Wait a bit for docs server to start
  setTimeout(() => {
    log(colors.green, 'INFO', 'Starting frontend development server...');
    const frontendProcess = startProcess(
      'FRONTEND',
      'npm',
      ['run', 'dev'],
      frontendDir,
      colors.magenta
    );

    // Handle process cleanup
    process.on('SIGINT', () => {
      log(colors.yellow, 'INFO', 'Shutting down development servers...');
      docsProcess.kill();
      frontendProcess.kill();
      process.exit(0);
    });

    process.on('SIGTERM', () => {
      docsProcess.kill();
      frontendProcess.kill();
      process.exit(0);
    });

  }, 2000);

  // Keep the main process alive
  process.stdin.resume();
}

main().catch(error => {
  console.error('Failed to start development environment:', error);
  process.exit(1);
});
