// Framework5/src/cucumber/cucumber.base.js
const path = require('path');

function createConfig(customOptions = {}) {
  const browser = process.env.BROWSER || customOptions.browser || 'chromium';
  const env = process.env.ENV || customOptions.env || 'cert';
  
  return {
    default: {
      requireModule: ['ts-node/register/transpile-only'],
      require: [
        'support/world.ts',
        'support/hooks.ts',
        'features/steps/**/*.ts'
      ],
      format: ['progress', 'json:reports/cucumber.json'],
      publishQuiet: true,
      parallel: 1,
      worldParameters: { 
        env: env,
        browser: browser
      },
      ...customOptions
    }
  };
}

module.exports = { createConfig };