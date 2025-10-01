// Framework5/src/cucumber/cucumber.base.js
const path = require('path');

function createConfig(customOptions = {}) {
  const browser = process.env.BROWSER || customOptions.browser || 'chromium';
  const env = process.env.ENV || customOptions.env || 'cert';
  
  // Estructura por defecto (puede ser sobrescrita)
  const defaultPaths = {
    world: 'support/world.ts',
    hooks: 'support/hooks.ts',
    steps: 'features/steps/**/*.ts'
  };
  
  // Permite custom paths
  const paths = customOptions.paths || defaultPaths;
  
  // Construye el array de require
  const requirePaths = [];
  if (paths.world) requirePaths.push(paths.world);
  if (paths.hooks) requirePaths.push(paths.hooks);
  if (paths.steps) {
    // Si steps es un array, añade todos
    if (Array.isArray(paths.steps)) {
      requirePaths.push(...paths.steps);
    } else {
      requirePaths.push(paths.steps);
    }
  }
  
  // Añade paths adicionales si existen
  if (customOptions.additionalPaths) {
    requirePaths.push(...customOptions.additionalPaths);
  }
  
  return {
    default: {
      requireModule: customOptions.requireModule || ['ts-node/register/transpile-only'],
      require: requirePaths,
      format: customOptions.format || ['progress', 'json:reports/cucumber.json'],
      publishQuiet: customOptions.publishQuiet !== false,
      parallel: customOptions.parallel || 1,
      worldParameters: { 
        env: env,
        browser: browser,
        ...customOptions.worldParameters
      }
    }
  };
}

module.exports = { createConfig };