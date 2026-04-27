const { app, BrowserWindow, shell } = require('electron');
const serve = require('electron-serve');
const path = require('path');

const WEB_OUT_DIR = app.isPackaged 
  ? path.join(process.resourcesPath, 'app', 'out')
  : path.join(__dirname, '..', 'web', 'out');

// Serve the Next.js static export for production
const serveApp = serve({ directory: WEB_OUT_DIR });

const DEV_SERVER_URL = 'http://localhost:3000';

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 860,
    minWidth: 960,
    minHeight: 640,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
    },
    icon: path.resolve(__dirname, '..', 'web', 'public', 'icon.png'),
    autoHideMenuBar: true,
    title: 'ScribeCrop',
    backgroundColor: '#0d0d0d',
  });

  if (!app.isPackaged && process.env.ELECTRON_DEV === '1') {
    // Dev: connect to the Next.js hot-reload server
    win.loadURL(DEV_SERVER_URL);
    win.webContents.openDevTools();
  } else {
    // Production / electron:preview — serve the static export
    serveApp(win).then(() => {
      win.loadURL('app://-');
    });
  }

  // Open external links in the system browser, not inside Electron
  win.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
