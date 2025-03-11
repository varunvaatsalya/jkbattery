// const { contextBridge, ipcRenderer } = require("electron");

// contextBridge.exposeInMainWorld("electron", {
//     send: (channel, data) => ipcRenderer.send(channel, data),
//     receive: (channel, func) => ipcRenderer.on(channel, (event, ...args) => func(...args)),
//     once: (channel, callback) => ipcRenderer.once(channel, (event, ...args) => callback(...args)),
// });

const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electron", {
  invoke: (channel, data) => ipcRenderer.invoke(channel, data),
  fileInvoke: (channel, action, ...data) =>
    ipcRenderer.invoke(channel, action, ...data),
});

contextBridge.exposeInMainWorld("auth", {
  login: (username, password) =>
    ipcRenderer.invoke("login", { username, password }),
  checkLogin: () => ipcRenderer.invoke("check-login"),
  logout: () => ipcRenderer.invoke("logout"),
});

contextBridge.exposeInMainWorld("db", {
  import: () => ipcRenderer.invoke("import-data-from-file"),
  export: () => ipcRenderer.invoke("create-export-file"),
  open: () => ipcRenderer.invoke("fileOpen"),
});
