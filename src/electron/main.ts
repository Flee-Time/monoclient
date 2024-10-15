import { app, BrowserWindow, session } from "electron";
import { ipcMainOn, isDev } from "./util.js";
import { getPreloadPath, getUIPath } from "./pathResolver.js";

// if you dont want to add your self signed cert to everyone using the app.
// do this to get your fingerprint and paste it down below.
// openssl dgst -sha256 -binary cert.der | openssl base64
const trustedFingerprint = "D+4CzSS6BEJUMPo4YP1PWnXzMJjiJEdpE/qhReM1Qmk=";

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

  // Override the default certificate verification procedure
  session.defaultSession.setCertificateVerifyProc((request, callback) => {
    const { hostname, certificate } = request;
    // Get the fingerprint of the incoming certificate
    const incomingFingerprint = certificate.fingerprint
      .replace("sha256/", "")
      .toLowerCase();

    // Compare the incoming fingerprint with the trusted one
    if (incomingFingerprint === trustedFingerprint.toLowerCase()) {
      console.log(`Certificate for ${hostname} is valid and trusted.`);
      callback(0); // 0 means trust this certificate
    } else {
      console.warn(
        `Certificate for ${hostname} does not match the trusted certificate.`
      );
      callback(-2); // -2 means use chrome's certificate verify procedure as a fallback.
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
});
