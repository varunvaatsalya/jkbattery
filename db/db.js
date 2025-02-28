const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const dbPath = path.join(__dirname, "data", "database.db"); // DB stored in `db/data/`
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) console.error("DB Connection Error:", err);
    else console.log("Database Connected at", dbPath);
});

module.exports = db;

// const sqlite3 = require("sqlite3").verbose();
// const path = require("path");
// const fs = require("fs");

// // Get User's Home Directory
// const homeDir = process.env.HOME || process.env.USERPROFILE;

// // Define Folder & Database Path
// const dbFolder = path.join(homeDir, "JkBattery");
// const dbPath = path.join(dbFolder, "database.db");

// // Check & Create Folder If Not Exists
// if (!fs.existsSync(dbFolder)) {
//     fs.mkdirSync(dbFolder, { recursive: true });
//     console.log("Folder Created:", dbFolder);
// }

// // Connect to Database
// const db = new sqlite3.Database(dbPath, (err) => {
//     if (err) console.error("DB Connection Error:", err);
//     else console.log("Database Connected at", dbPath);
// });

// module.exports = db;
