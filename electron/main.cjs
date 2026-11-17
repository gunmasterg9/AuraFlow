// electron/main.cjs
// AuraFlow AI - Electron Main Process

const { app, BrowserWindow, ipcMain, safeStorage, session } = require('electron');
const path = require('node:path');
const fs = require('node:fs');
const net = require('node:net');
const { bindSmartSpectraIpc } = require('@smartspectra/node-sdk/main');

function isDevServerReady(port = 5173, host = '127.0.0.1', timeout = 350) {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    let handled = false;
    socket.setTimeout(timeout);
    socket.on('connect', () => {
      if (!handled) {
        handled = true;
        socket.destroy();
        resolve(true);
      }
    });
    socket.on('timeout', () => {
      if (!handled) {
        handled = true;
        socket.destroy();
        resolve(false);
      }
    });
    socket.on('error', () => {
      if (!handled) {
        handled = true;
        socket.destroy();
        resolve(false);
      }
    });
    socket.connect(port, host);
  });
}

function getKeyPath() {
  return path.join(app.getPath('userData'), 'smartspectra-key.bin');
}

function readKey() {
  try {
    const keyPath = getKeyPath();
    if (fs.existsSync(keyPath)) {
      const buffer = fs.readFileSync(keyPath);
      if (safeStorage.isEncryptionAvailable()) {
        return safeStorage.decryptString(buffer);
      }
      return buffer.toString('utf8');
    }
  } catch (err) {
    console.error('[AuraFlow/main] Error reading stored key:', err);
  }

  // Development fallback from environment if file not present
  if (!app.isPackaged && process.env.SMARTSPECTRA_API_KEY) {
    return process.env.SMARTSPECTRA_API_KEY.trim();
  }
  return '';
}

function saveKey(key) {
  if (!key || typeof key !== 'string' || key.trim().length === 0) {
    throw new Error('API key cannot be empty');
  }
  const cleanKey = key.trim();
  if (cleanKey.length > 512) {
    throw new Error('API key length exceeds maximum allowed');
  }

  const encrypted = safeStorage.isEncryptionAvailable()
    ? safeStorage.encryptString(cleanKey)
    : Buffer.from(cleanKey, 'utf8');

  // Write file with user-only permissions (0o600)
  fs.writeFileSync(getKeyPath(), encrypted, { mode: 0o600 });
  return true;
}

function clearKey() {
  try {
    const keyPath = getKeyPath();
    if (fs.existsSync(keyPath)) {
      fs.unlinkSync(keyPath);
    }
  } catch (err) {
    console.error('[AuraFlow/main] Error clearing key:', err);
  }
  return true;
}

// IPC Handlers
ipcMain.handle('key:get', () => readKey());
ipcMain.handle('key:save', (_event, key) => saveKey(key));
ipcMain.handle('key:clear', () => clearKey());
ipcMain.handle('app:is-packaged', () => app.isPackaged);

function createWindow() {
  // Restrict camera permission requests strictly to trusted local origins
  session.defaultSession.setPermissionRequestHandler((webContents, permission, callback, details) => {
    const url = (details && details.requestingUrl) || (webContents && webContents.getURL()) || '';
    const isAllowedOrigin =
      url.startsWith('file://') ||
      url.startsWith('http://127.0.0.1:5173') ||
      url.startsWith('http://localhost:5173');

    callback(permission === 'media' && isAllowedOrigin);
  });

  const win = new BrowserWindow({
    width: 1440,
    height: 920,
    minWidth: 1050,
    minHeight: 720,
    backgroundColor: '#0b0e19',
    title: 'AuraFlow AI',
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      webSecurity: true,
    },
  });

  // Bind the SmartSpectra SDK main-process IPC handler to this window
  bindSmartSpectraIpc(win, {
    logger: (level, msg) => {
      if (level === 'error') console.error(`[AuraFlow/SmartSpectra] ${msg}`);
      else if (level === 'warn') console.warn(`[AuraFlow/SmartSpectra] ${msg}`);
      else console.log(`[AuraFlow/SmartSpectra] ${msg}`);
    },
  });

  // Deny all external window opens
  win.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));

  // Capture renderer console messages and load failures for diagnostics
  win.webContents.on('console-message', (_event, level, message, line, sourceId) => {
    const levelStr = level === 3 ? 'ERROR' : level === 2 ? 'WARN' : 'INFO';
    const logLine = `[Renderer ${levelStr}] ${message} (${sourceId}:${line})\n`;
    try { fs.appendFileSync(path.join(__dirname, '../renderer_debug.log'), logLine); } catch {}
    console.log(logLine.trim());
  });

  win.webContents.on('did-fail-load', (_event, errorCode, errorDescription, validatedURL) => {
    const failLine = `[Renderer Load Failed] code=${errorCode} desc=${errorDescription} url=${validatedURL}\n`;
    try { fs.appendFileSync(path.join(__dirname, '../renderer_debug.log'), failLine); } catch {}
    console.error(failLine.trim());

    // Fallback: If dev server URL failed to connect and dist/index.html exists, fallback to local build
    if (validatedURL.startsWith('http://127.0.0.1:5173') || validatedURL.startsWith('http://localhost:5173')) {
      const distIndex = path.join(__dirname, '../dist/index.html');
      if (fs.existsSync(distIndex)) {
        console.log('[AuraFlow/main] Dev server unavailable, falling back to dist/index.html');
        win.loadFile(distIndex);
      }
    }
  });

  // Prevent unexpected in-window navigation
  win.webContents.on('will-navigate', (event, url) => {
    const isAllowed =
      url.startsWith('file://') ||
      url.startsWith('http://127.0.0.1:5173') ||
      url.startsWith('http://localhost:5173');
    if (!isAllowed) {
      event.preventDefault();
    }
  });

  // Allow F12 to toggle DevTools during development
  if (!app.isPackaged) {
    win.webContents.on('before-input-event', (event, input) => {
      if (input.key === 'F12' && input.type === 'keyDown') {
        win.webContents.toggleDevTools();
        event.preventDefault();
      }
    });

    if (process.argv.includes('--screenshot')) {
      setTimeout(async () => {
        try {
          const image = await win.webContents.capturePage();
          const screenshotPath = 'C:\\Users\\GAUTAM\\.gemini\\antigravity\\brain\\915a0536-0e9e-4ea5-a4ce-d38b24401380\\orb_screenshot.png';
          fs.writeFileSync(screenshotPath, image.toPNG());
          console.log('[AuraFlow/main] Screenshot captured successfully to ' + screenshotPath);
          app.quit();
        } catch (err) {
          console.error('[AuraFlow/main] Screenshot capture error:', err);
          app.quit();
        }
      }, 4500);
    }
  }

  const distIndex = path.join(__dirname, '../dist/index.html');
  if (!app.isPackaged && process.env.NODE_ENV !== 'production') {
    isDevServerReady(5173, '127.0.0.1', 350).then((ready) => {
      if (ready) {
        win.loadURL('http://127.0.0.1:5173');
      } else if (fs.existsSync(distIndex)) {
        console.log('[AuraFlow/main] Dev server not active on 127.0.0.1:5173, loading production build dist/index.html');
        win.loadFile(distIndex);
      } else {
        win.loadURL('http://127.0.0.1:5173');
      }
    });
  } else {
    win.loadFile(distIndex);
  }
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
