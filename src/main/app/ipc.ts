import { ipcMain } from 'electron';

import '../modules/videoPlayer/ipcHandlers';
import '../modules/libraryManager/ipcHandlers';

ipcMain.on('ipc-example', async (event, arg) => {
  const msgTemplate = (pingPong: string) => `IPC test: ${pingPong}`;
  console.log(msgTemplate(arg));
  event.reply('ipc-example', msgTemplate('pong'));
});
