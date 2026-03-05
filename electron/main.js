const { app, BrowserWindow, dialog } = require('electron');
const { spawn, execSync } = require('child_process');
const path = require('path');
const http = require('http');
const fs = require('fs');

let mainWindow = null;
let apiProcess = null;
const API_PORT = 5196;
const API_URL = `http://localhost:${API_PORT}`;

// Log file for debugging
const logFile = path.join(app.getPath('userData'), 'bikehaus.log');
function log(msg) {
  const line = `[${new Date().toISOString()}] ${msg}\n`;
  console.log(msg);
  try { fs.appendFileSync(logFile, line); } catch (e) {}
}

function getApiPath() {
  // In production (packaged), the API is in resources/publish
  // In development, use the published output
  if (app.isPackaged) {
    return path.join(process.resourcesPath, 'publish');
  }
  return path.join(__dirname, '..', 'publish');
}

function startApi() {
  return new Promise((resolve, reject) => {
    const apiDir = getApiPath();
    const exeName = process.platform === 'win32' ? 'BikeHaus.API.exe' : 'BikeHaus.API';
    const apiExe = path.join(apiDir, exeName);

    log(`API path: ${apiExe}`);
    log(`API dir: ${apiDir}`);
    log(`API exists: ${fs.existsSync(apiExe)}`);
    log(`isPackaged: ${app.isPackaged}`);

    if (!fs.existsSync(apiExe)) {
      reject(new Error(`API not found: ${apiExe}`));
      return;
    }

    // Kill any lingering API process on the same port
    try {
      if (process.platform === 'win32') {
        execSync(`netstat -ano | findstr :${API_PORT}`, { encoding: 'utf8' });
        // Port is in use, try to kill it
        log(`Port ${API_PORT} is in use, attempting to free it...`);
      }
    } catch (e) {
      // Port is free, good
    }

    apiProcess = spawn(apiExe, [], {
      cwd: apiDir,
      env: {
        ...process.env,
        ASPNETCORE_ENVIRONMENT: 'Production',
        ASPNETCORE_URLS: API_URL,
        ConnectionStrings__DefaultConnection: `Data Source=${path.join(apiDir, 'BikeHausFreiburg.db')}`,
        FileStorage__BasePath: path.join(apiDir, 'uploads')
      },
      stdio: ['pipe', 'pipe', 'pipe']
    });

    apiProcess.stdout.on('data', (data) => {
      log(`API: ${data}`);
    });

    apiProcess.stderr.on('data', (data) => {
      log(`API Error: ${data}`);
    });

    apiProcess.on('error', (err) => {
      log(`Failed to start API: ${err.message}`);
      reject(err);
    });

    apiProcess.on('exit', (code) => {
      log(`API process exited with code ${code}`);
      if (code !== 0 && code !== null) {
        log(`API crashed with code ${code}`);
      }
    });

    // Wait for API to be ready
    waitForApi(30000)
      .then(resolve)
      .catch(reject);
  });
}

function waitForApi(timeout) {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();

    function check() {
      if (Date.now() - startTime > timeout) {
        reject(new Error('API startup timeout'));
        return;
      }

      const req = http.get(`${API_URL}/api/settings`, (res) => {
        if (res.statusCode === 200 || res.statusCode === 401) {
          resolve();
        } else {
          setTimeout(check, 500);
        }
      });

      req.on('error', () => {
        setTimeout(check, 500);
      });

      req.setTimeout(2000, () => {
        req.destroy();
        setTimeout(check, 500);
      });
    }

    setTimeout(check, 1000);
  });
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1024,
    minHeight: 700,
    title: 'Bike Haus Freiburg',
    icon: path.join(__dirname, 'icon.ico'),
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  mainWindow.loadURL(API_URL);

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Remove menu bar
  mainWindow.setMenuBarVisibility(false);
}

function stopApi() {
  if (apiProcess) {
    console.log('Stopping API...');
    if (process.platform === 'win32') {
      spawn('taskkill', ['/pid', apiProcess.pid.toString(), '/f', '/t']);
    } else {
      apiProcess.kill('SIGTERM');
    }
    apiProcess = null;
  }
}

app.whenReady().then(async () => {
  try {
    await startApi();
    createWindow();
  } catch (err) {
    console.error('Failed to start:', err);
    dialog.showErrorBox(
      'Startfehler',
      `Die Anwendung konnte nicht gestartet werden.\n\n${err.message}`
    );
    app.quit();
  }
});

app.on('window-all-closed', () => {
  stopApi();
  app.quit();
});

app.on('before-quit', () => {
  stopApi();
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});
