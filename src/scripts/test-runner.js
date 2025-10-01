#!/usr/bin/env node
// Framework5/src/scripts/test-runner.js
const { spawn } = require('child_process');
const path = require('path');

// Parse arguments
const args = process.argv.slice(2);
const browser = args.find(a => a.includes('--browser='))?.split('=')[1] || 
                process.env.BROWSER || 
                'chromium';
const env = args.find(a => a.includes('--env='))?.split('=')[1] || 
            process.env.ENV || 
            'cert';

// Set environment
process.env.BROWSER = browser;
process.env.ENV = env;

console.log(`🎯 Config: browser=${browser}, env=${env}`);

// Ensure browser is installed
const ensureBrowser = spawn('node', [
  path.join(__dirname, 'ensure-browser.js')
], {
  env: process.env,
  stdio: 'inherit'
});

ensureBrowser.on('close', (code) => {
  if (code !== 0) {
    process.exit(code);
  }
  
  // Run cucumber with remaining args
  const cucumberArgs = args.filter(a => !a.includes('--browser=') && !a.includes('--env='));
  const cucumber = spawn('npx', ['cucumber-js', '-p', 'default', ...cucumberArgs], {
    cwd: process.cwd(),
    env: process.env,
    stdio: 'inherit',
    shell: true
  });
  
  cucumber.on('close', (code) => {
    process.exit(code);
  });
});