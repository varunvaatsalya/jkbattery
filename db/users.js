const db = require("./db");
const bcrypt = require("bcryptjs");

const userNameChk = /^[a-z]{3,20}$/;
const passwordChk = /^[a-zA-Z0-9]{6,30}$/;

// Create Users Table
db.run(`
    CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    uid
    username TEXT UNIQUE,
    password TEXT,
    role TEXT DEFAULT 'user' CHECK(role IN ('admin', 'user'))
  )
`);

const validateInputs = (username, password) => {
  if (!userNameChk.test(username)) {
    return {
      valid: false,
      message:
        "Invalid username. It must be 3-20 characters long and contain only lowercase letters.",
    };
  }
  if (!passwordChk.test(password)) {
    return {
      valid: false,
      message:
        "Invalid password. It must be 6-30 characters long and contain only alphabets and numbers.",
    };
  }
  return { valid: true };
};

const saveUser = async ({ username, password, role = "user" }) => {
  const validation = validateInputs(username, password);
  if (!validation.valid) {
    return new Error(validation.message);
  }
  const hash = await bcrypt.hash(password, 10);
  return new Promise((resolve, reject) => {
    db.run(
      "INSERT INTO users (username, password, role) VALUES (?, ?, ?)",
      [username, hash, role],
      function (err) {
        if (err) reject(err);
        else resolve(this.lastID);
      }
    );
  });
};

const getUsers = () => {
  return new Promise((resolve, reject) => {
    db.all("SELECT id, username, role FROM users ORDER BY id DESC", [], (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};

const updateUser = async ( { id,username, password, role }) => {
  const validation = validateInputs(username, password);
  if (!validation.valid) {
    return new Error(validation.message);
  }
  
  const hash = await bcrypt.hash(password, 10);
  return new Promise((resolve, reject) => {
    db.run(
      "UPDATE users SET username = ?, password = ?, role = ? WHERE id = ?",
      [username, hash, role, id],
      function (err) {
        if (err) reject(err);
        else resolve({ message: "User updated successfully", changes: this.changes });
      }
    );
  });
};

module.exports = { saveUser, getUsers, updateUser };
