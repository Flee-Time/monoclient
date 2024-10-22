import { app, BrowserWindow, Notification, session } from "electron";
import electronUpdater, { type AppUpdater } from "electron-updater";
import path from "path";
import fs from "fs";
import { ipcMainOn, ipcWebContentsSend, isDev } from "./util.js";
import { getAssetsPath, getPreloadPath, getUIPath } from "./pathResolver.js";

export function getAutoUpdater(): AppUpdater {
  // Using destructuring to access autoUpdater due to the CommonJS module of 'electron-updater'.
  // It is a workaround for ESM compatibility issues, see https://github.com/electron-userland/electron-builder/issues/7976.
  const { autoUpdater } = electronUpdater;
  return autoUpdater;
}

let retryCount = 0;
let countdownInterval: NodeJS.Timeout;
const BASE_RETRY_DELAY = 3;

app.on("ready", () => {
  const autoUpdater = getAutoUpdater();

  const mainWindow = new BrowserWindow({
    minWidth: 600,
    minHeight: 600,
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

  if (process.platform === "win32") {
    app.setAppUserModelId(app.name);
  }

  autoUpdater.on("checking-for-update", () => {
    ipcWebContentsSend("updateStatus", mainWindow.webContents, "Checking for updates...");
  });

  autoUpdater.on("update-available", () => {
    ipcWebContentsSend("updateStatus", mainWindow.webContents, "Update available. Downloading...");
  });

  autoUpdater.on("update-not-available", () => {
    ipcWebContentsSend("updateStatus", mainWindow.webContents, "No update available.");
    retryCount = 0; // Reset retry count on success
  });

  autoUpdater.on("error", (err) => {
    ipcWebContentsSend("updateStatus", mainWindow.webContents, "Error: " + err.message);
    retryCheckForUpdates(); // Retry on error
  });

  autoUpdater.on("download-progress", (progressObj) => {
    ipcWebContentsSend("downloadProgress", mainWindow.webContents, progressObj);
  });

  autoUpdater.on("update-downloaded", () => {
    autoUpdater.quitAndInstall();
  });

  function startRetryCountdown(retryDelayInSeconds: number) {
    let remainingTime = retryDelayInSeconds;
  
    // Send the initial status with the full delay
    ipcWebContentsSend(
      "updateStatus",
      mainWindow.webContents,
      `Retrying in ${remainingTime} seconds...`
    );
  
    // Clear any existing countdown interval
    if (countdownInterval) {
      clearInterval(countdownInterval);
    }
  
    // Start a new interval to update the countdown every second
    countdownInterval = setInterval(() => {
      remainingTime -= 1;
      ipcWebContentsSend(
        "updateStatus",
        mainWindow.webContents,
        `Retrying in ${remainingTime} seconds...`
      );
  
      // When the countdown reaches zero, stop the interval and check for updates
      if (remainingTime <= 0) {
        clearInterval(countdownInterval); // Clear the countdown
        autoUpdater.checkForUpdatesAndNotify(); // Perform the update check after countdown
      }
    }, 1000); // Update every second
  }
  
  function retryCheckForUpdates() {
    // Calculate the delay based on exponential backoff
    const retryDelayInSeconds = BASE_RETRY_DELAY * Math.pow(2, retryCount);
    retryCount++;
  
    // Start the countdown and check for updates when it ends
    startRetryCountdown(retryDelayInSeconds);
  }

  ipcMainOn("rendererInitialized", () => {
    if (isDev()) {
      ipcWebContentsSend(
        "updateStatus",
        mainWindow.webContents,
        "No update available."
      );
    } else {
      autoUpdater.checkForUpdatesAndNotify();
    }
  });

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

  function base64ToImageFile(base64Data: string, filename: string) {
    const base64Image = base64Data.split(";base64,").pop() || "";
    const imagePath = path.join(app.getPath("temp"), filename);

    fs.writeFileSync(imagePath, base64Image, { encoding: "base64" });
    return imagePath;
  }

  function showNotification(title: string, body: string, icon: string) {
    if (icon === "fallback") {
      new Notification({ title, body, silent: true }).show();
    } else {
      new Notification({ title, body, icon, silent: true }).show();
    }
  }

  function shouldSendNotification(mainBrowserWindow: Electron.BrowserWindow) {
    return !mainBrowserWindow.isFocused() || !mainBrowserWindow.isVisible();
  }

  ipcMainOn("sendNotification", (payload) => {
    let iconPath = payload.icon;
    // If it's a base64 string, save it as an image file
    if (payload.icon.startsWith("data:image/")) {
      iconPath = base64ToImageFile(
        payload.icon,
        `profile-${payload.title}.jpeg`
      );
    }

    if (payload.sameRoom) {
      if (shouldSendNotification(mainWindow)) {
        showNotification(payload.title, payload.body, iconPath);
      }
    } else {
      showNotification(payload.title, payload.body, iconPath);
    }
  });
});
