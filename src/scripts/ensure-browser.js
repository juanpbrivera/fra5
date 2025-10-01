#!/usr/bin/env node
const { execSync } = require('child_process');
const path = require('path');

function checkBrowserInstalled(browserName) {
  try {
    // Intenta listar los navegadores instalados
    const output = execSync('npx playwright show-browsers', { 
      encoding: 'utf-8',
      stdio: 'pipe' 
    });
    
    const browserMap = {
      'chromium': 'chromium',
      'chrome': 'chromium',
      'firefox': 'firefox',
      'webkit': 'webkit',
      'safari': 'webkit'
    };
    
    const normalizedBrowser = browserMap[browserName.toLowerCase()] || browserName;
    return output.toLowerCase().includes(normalizedBrowser);
  } catch (e) {
    return false;
  }
}

function installBrowser(browserName) {
  console.log(`📦 Instalando ${browserName}...`);
  try {
    execSync(`npx playwright install ${browserName}`, { 
      stdio: 'inherit',
      cwd: path.resolve(__dirname, '..')
    });
    console.log(`✅ ${browserName} instalado correctamente`);
  } catch (error) {
    console.error(`❌ Error instalando ${browserName}:`, error.message);
    process.exit(1);
  }
}

function main() {
  // Lee el browser del environment o usa chromium por defecto
  const browserName = process.env.BROWSER || 'chromium';
  
  console.log(`🔍 Verificando ${browserName}...`);
  
  if (!checkBrowserInstalled(browserName)) {
    console.log(`⚠️  ${browserName} no está instalado`);
    installBrowser(browserName);
  } else {
    console.log(`✅ ${browserName} ya está instalado`);
  }
}

main();