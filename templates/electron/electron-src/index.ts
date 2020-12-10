// Native
import { join } from 'path';
import { BrowserWindow, app, ipcMain, IpcMainEvent } from 'electron';
import isDev from 'electron-is-dev';

import prepareNext from './prepareNext';

app.disableHardwareAcceleration();

// Prepare the renderer once the app is ready
app.on('ready', async () => {
  await prepareNext('./renderer');

  const mainWindow = new BrowserWindow({
    webPreferences: {
      preload: join(__dirname, 'preload.js'),
    },
    fullscreen: true,
  });

  mainWindow.loadURL('http://localhost:8000/');

  if (isDev) {
    mainWindow.webContents.openDevTools({ mode: 'bottom' });
  }
});

// Quit the app once all windows are closed
app.on('window-all-closed', app.quit);

// listen the channel `message` and resend the received message to the renderer process
ipcMain.on('message', (event: IpcMainEvent, message: any) => {
  event.sender.send('message', message);
});
