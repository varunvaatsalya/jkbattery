const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const dbPath = path.join(__dirname, "data", "database.db"); // DB stored in `db/data/`
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) console.error("DB Connection Error:", err);
    else console.log("Database Connected at", dbPath);
});

module.exports = db;
