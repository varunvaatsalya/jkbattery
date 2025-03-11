const { db } = require("./db");

db.run(`
  CREATE TABLE IF NOT EXISTS logins (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL,
    success BOOLEAN NOT NULL,
    message TEXT,
    time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )
`);

// Function to save new login entry
const saveLogin = (username, success, message) => {
  return new Promise((resolve, reject) => {
    db.run(
      `INSERT INTO logins (username, success, message) VALUES (?, ?, ?)`,
      [username, success, message],
      function (err) {
        if (err) {
          reject({ message: err.message, success: false });
        } else {
          // Cleanup old records after inserting new login
          deleteOldLogins();
          resolve({ success: true });
        }
      }
    );
  });
};

const formatDateTime = (isoString) => {
  return isoString.replace("T", " ") + ":00";
};

const getAllLogins = ({ start = null, end = null, success = null }) => {
  return new Promise((resolve, reject) => {
    let query = "SELECT * FROM logins";
    let params = [];
    let conditions = [];

    if (start) {
      conditions.push("time >= ?");
      params.push(formatDateTime(start));
    }

    if (end) {
      conditions.push("time <= ?");
      params.push(formatDateTime(end));
    }

    if (success !== null) {
      conditions.push("success = ?");
      params.push(success);
    }

    if (conditions.length > 0) {
      query += " WHERE " + conditions.join(" AND ");
    }

    query += " ORDER BY time DESC";
    db.all(query, params, (err, rows) => {
      if (err) {
        reject({ message: err.message, success: false });
      } else {
        resolve({ data: rows, success: true });
      }
    });
  });
};

// Function to delete logins older than 30 days
const deleteOldLogins = () => {
  db.run(
    `DELETE FROM logins WHERE time < datetime('now', '-30 days')`,
    (err) => {
      if (err) {
        console.error("Error deleting old logins:", err);
      }
    }
  );
};

module.exports = { saveLogin, getAllLogins };
