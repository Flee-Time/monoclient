import { app, BrowserWindow, session } from "electron";
import { ipcMainOn, isDev } from "./util.js";
import { getPreloadPath, getUIPath } from "./pathResolver.js";

app.on("ready", () => {
  const mainWindow = new BrowserWindow({
    minWidth: 800,
    minHeight: 700,
    title: "Monolink",
    frame: false,
    vibrancy: "fullscreen-ui",
    backgroundMaterial: "none", // unless the fullscreen bug is fixed in electron, do not enable "mica" or "acrylic"
    webPreferences: {
      preload: getPreloadPath(),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  if (isDev()) {
    mainWindow.loadURL("http://localhost:5123");
  } else {
    mainWindow.loadFile(getUIPath());
  }

  ipcMainOn("sendFrameAction", (payload) => {
    switch (payload) {
      case "CLOSE":
        mainWindow.close();
        break;
      case "MAXIMIXE":
        if (!mainWindow.isMaximized()) {
          mainWindow.maximize();
        } else {
          mainWindow.restore();
        }
        break;
      case "MINIMIZE":
        mainWindow.minimize();
        break;
    }
  });
});
