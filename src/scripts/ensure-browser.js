#!/usr/bin/env node
const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');
const os = require('os');

function getPlaywrightPath() {
  // Detecta la ruta según el SO
  if (process.platform === 'win32') {
    return path.join(os.homedir(), 'AppData', 'Local', 'ms-playwright');
  } else if (process.platform === 'darwin') {
    return path.join(os.homedir(), 'Library', 'Caches', 'ms-playwright');
  } else {
    // Linux
    return path.join(os.homedir(), '.cache', 'ms-playwright');
  }
}

function checkBrowserInstalled(browserName) {
  const playwrightPath = getPlaywrightPath();
  
  const browserPaths = {
    'chromium': ['chromium-', 'chromium_headless_shell-'],
    'firefox': ['firefox-'],
    'webkit': ['webkit-']
  };

  const patterns = browserPaths[browserName.toLowerCase()] || [];
  
  try {
    if (!fs.existsSync(playwrightPath)) {
      console.log(`📁 Carpeta Playwright no existe: ${playwrightPath}`);
      return false;
    }
    
    const dirs = fs.readdirSync(playwrightPath);
    const found = patterns.some(pattern => {
      return dirs.some(dir => dir.startsWith(pattern));
    });
    
    if (found) {
      console.log(`✓ Encontrado en: ${playwrightPath}`);
    }
    
    return found;
  } catch (e) {
    console.log(`⚠️ Error verificando: ${e.message}`);
    return false;
  }
}

function installBrowser(browserName) {
  console.log(`📦 Instalando ${browserName}...`);
  console.log(`📍 Sistema: ${process.platform}`);
  
  try {
    // En CI/Linux necesita deps del sistema
    const command = process.env.CI === 'true' 
      ? `npx playwright install --with-deps ${browserName}`
      : `npx playwright install ${browserName}`;
    
    execSync(command, { 
      stdio: 'inherit',
      cwd: path.resolve(__dirname, '..'),
      env: { ...process.env }
    });
    
    console.log(`✅ ${browserName} instalado correctamente`);
  } catch (error) {
    console.error(`❌ Error instalando ${browserName}:`, error.message);
    process.exit(1);
  }
}

function main() {
  const browserName = process.env.BROWSER || 'chromium';
  
  console.log(`🔍 Verificando ${browserName}...`);
  console.log(`💻 Plataforma: ${process.platform}`);
  console.log(`🏠 Home: ${os.homedir()}`);
  
  if (process.env.CI === 'true') {
    console.log(`🚀 Modo CI detectado`);
  }
  
  if (!checkBrowserInstalled(browserName)) {
    console.log(`⚠️  ${browserName} no está instalado`);
    installBrowser(browserName);
  } else {
    console.log(`✅ ${browserName} ya está instalado`);
  }
}

// Manejo de errores global
process.on('unhandledRejection', (error) => {
  console.error('❌ Error no manejado:', error);
  process.exit(1);
});

main();