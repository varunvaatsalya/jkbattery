const {
  app,
  BrowserWindow,
  ipcMain,
  Menu,
  screen,
  shell,
} = require("electron");
const path = require("path");
const { handlers } = require("./handlers.js");
const { loginUser, isUserLoggedIn, logoutUser } = require("./db/auth.js");
const {
  openDb,
  dbFolder,
  createZip,
  importDatafromZip,
} = require("./db/db.js");

let mainWindow;

app.whenReady().then(() => {
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;
  mainWindow = new BrowserWindow({
    width,
    height,
    minWidth: 1000,
    minHeight: 700,
    icon: path.join(__dirname, "assets", "jkbattery.ico"),
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false, // Better security
    },
  });
  Menu.setApplicationMenu(null);
  // mainWindow.webContents.openDevTools();
  mainWindow.loadFile(path.join(__dirname, "app/build/index.html"));
  // mainWindow.loadURL("http://localhost:3000/");

  mainWindow.once("ready-to-show", () => {
    mainWindow.show(); // Show window only after content is loaded
  });
});

ipcMain.handle("database-operation", async (event, { action, data }) => {
  try {
    if (handlers[action]) {
      return await handlers[action](data);
    } else {
      return { success: false, error: "Invalid action" };
    }
  } catch (err) {
    return { success: false, error: err.message };
  }
});

ipcMain.handle("database-file-operation", async (event, action, ...data) => {
  try {
    if (handlers[action]) {
      return await handlers[action](...data);
    } else {
      return { success: false, error: "Invalid action" };
    }
  } catch (err) {
    return { success: false, error: err.message };
  }
});

ipcMain.handle("login", async (event, { username, password }) => {
  try {
    return await loginUser(username, password);
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle("check-login", () => {
  return isUserLoggedIn();
});

ipcMain.handle("logout", () => {
  logoutUser();
  return { success: true };
});

ipcMain.handle("fileOpen", () => {
  shell.openPath(dbFolder);
  return { success: true };
});
ipcMain.handle("create-export-file", () => {
  return createZip();
});
ipcMain.handle("import-data-from-file", async () => {
  let result = await importDatafromZip();
  if (result.success) {
    app.relaunch();
    app.exit(0);
  }

  return result;
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
