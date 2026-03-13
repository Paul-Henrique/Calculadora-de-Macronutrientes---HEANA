const { contextBridge, ipcRenderer } = require('electron');

// Exponha APIs seguras para o frontend, se necessário.
contextBridge.exposeInMainWorld('electronAPI', {
  // Exemplo: getAppVersion: () => ipcRenderer.invoke('get-app-version')
});
