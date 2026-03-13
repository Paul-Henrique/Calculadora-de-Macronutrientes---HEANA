const { app, BrowserWindow, dialog } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const fs = require('fs');
const isDev = process.env.NODE_ENV === 'development';

let mainWindow;
let pythonProcess;

// Configuração de Logging
const logPath = path.join(app.getPath('userData'), 'app.log');
function log(message) {
  const timestamp = new Date().toISOString();
  const formattedMessage = `[${timestamp}] ${message}\n`;
  fs.appendFileSync(logPath, formattedMessage);
  console.log(message);
}

function createWindow() {
  log('Iniciando janela principal...');
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
    icon: path.join(__dirname, 'frontend/public/favicon.svg'),
  });

  const startUrl = isDev 
    ? 'http://localhost:5173' 
    : `file://${path.join(__dirname, 'frontend/dist/index.html')}`;

  log(`Carregando URL: ${startUrl}`);
  mainWindow.loadURL(startUrl);

  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
    log(`Falha ao carregar: ${errorDescription} (${errorCode})`);
  });

  if (isDev) {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

function startPythonBackend() {
  if (isDev) {
    log('Modo desenvolvimento: backend deve ser iniciado manualmente.');
    return;
  }

  const pythonExe = process.platform === 'win32' ? 'backend.exe' : 'backend';
  const backendPath = path.join(process.resourcesPath, 'bin', pythonExe);

  log(`Tentando iniciar backend em: ${backendPath}`);

  if (!fs.existsSync(backendPath)) {
    log('ERRO: Binário do backend não encontrado!');
    dialog.showErrorBox('Erro de Inicialização', `O binário do servidor não foi encontrado em: ${backendPath}`);
    return;
  }

  pythonProcess = spawn(backendPath, {
    stdio: 'pipe'
  });

  pythonProcess.stdout.on('data', (data) => {
    log(`BACKEND STDOUT: ${data}`);
  });

  pythonProcess.stderr.on('data', (data) => {
    log(`BACKEND STDERR: ${data}`);
  });

  pythonProcess.on('error', (err) => {
    log(`Falha ao iniciar processo do backend: ${err.message}`);
    dialog.showErrorBox('Erro no Servidor', `Falha ao iniciar o servidor backend: ${err.message}`);
  });

  pythonProcess.on('exit', (code) => {
    log(`Processo do backend saiu com código: ${code}`);
  });
}

app.on('ready', () => {
  log('Aplicação pronta. Inicializando componentes...');
  startPythonBackend();
  createWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('will-quit', () => {
  if (pythonProcess) {
    pythonProcess.kill();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});
