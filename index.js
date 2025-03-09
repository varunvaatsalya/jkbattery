// const { app, BrowserWindow, Menu } = require("electron");
// const path = require("path");
// const { ipcMain } = require("electron");
// const { saveUser } = require("./db/users");

// let mainWindow;

// app.on("ready", () => {
//   mainWindow = new BrowserWindow({
//     title: "JK Battery",
//     width: 1000,
//     height: 750,
//     minWidth: 600,
//     minHeight: 450,
//     // frame: false,
//     webPreferences: {
//       preload: path.join(__dirname, "preload.js"),
//       contextIsolation: true,
//       enableRemoteModule: false,
//       nodeIntegration: false, // Disable direct `require`
//     },
//   });
//   Menu.setApplicationMenu(null);

//   // mainWindow.loadFile(path.join(__dirname, "./app/build/index.html"));
//   mainWindow.loadURL("http://localhost:3000/");
// });

// const handlers = {
//   "save-user": saveUser,
//   // "save-order": saveOrder,
//   // "save-product": saveProduct,
// };

// // Common IPC Handler
// ipcMain.on("database-operation", (event, { action, data }) => {
//   if (handlers[action]) {
//     handlers[action](...Object.values(data), (err, id) => {
//       if (err) {
//         console.error(`DB Error in ${action}:`, err);
//         event.reply("database-operation-response", {
//           success: false,
//           error: err.message,
//         });
//       } else {
//         console.log(`${action} saved with ID: ${id}`);
//         event.reply("database-operation-response", { success: true, id });
//       }
//     });
//   } else {
//     event.reply("database-operation-response", {
//       success: false,
//       error: "Unknown action",
//     });
//   }
// });

// app.on("window-all-closed", () => {
//   if (process.platform !== "darwin") app.quit();
// });

// app.on("activate", () => {
//   if (BrowserWindow.getAllWindows().length === 0) {
//     mainWindow = new BrowserWindow();
//     mainWindow.webContents.openDevTools();
//   }
// });

const { app, BrowserWindow, ipcMain, Menu, screen } = require("electron");
const path = require("path");
const { handlers } = require("./handlers.js");
const { loginUser, isUserLoggedIn, logoutUser } = require("./db/auth.js");

let mainWindow;

app.whenReady().then(() => {
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;
  mainWindow = new BrowserWindow({
    width,
    height,
    minWidth: 1000,
    minHeight: 700,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false, // Better security
    },
  });
  Menu.setApplicationMenu(null);
  mainWindow.webContents.openDevTools();
  // mainWindow.loadFile(path.join(__dirname, "./app/build/index.html"));
  mainWindow.loadURL("http://localhost:3000/");
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

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
