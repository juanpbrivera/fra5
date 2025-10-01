#!/usr/bin/env node
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
const frameworkDir = path.join(__dirname, '..');
const ensureBrowserPath = path.join(__dirname, 'ensure-browser.js');

const ensureBrowser = spawn('node', [ensureBrowserPath], {
  cwd: frameworkDir,
  env: process.env,
  stdio: 'inherit',
  shell: true
});

ensureBrowser.on('close', (code) => {
  if (code !== 0) {
    process.exit(code);
  }
  
  // Run cucumber from the original working directory
  const cucumberArgs = args.filter(a => !a.includes('--browser=') && !a.includes('--env='));
  
  // Windows necesita .cmd para npx
  const npxCmd = process.platform === 'win32' ? 'npx.cmd' : 'npx';
  
  const cucumber = spawn(npxCmd, ['cucumber-js', '-p', 'default', ...cucumberArgs], {
    cwd: process.cwd(),
    env: process.env,
    stdio: 'inherit',
    shell: true
  });
  
  cucumber.on('close', (code) => {
    process.exit(code);
  });
});