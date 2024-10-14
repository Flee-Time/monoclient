import { app, BrowserWindow } from 'electron';
import path from 'path';

type text = string;

app.on("ready", () => {
    const mainWindow = new BrowserWindow({
        autoHideMenuBar: true,
    });
    mainWindow.loadFile(path.join(app.getAppPath() + '/dist-react/index.html'));
})