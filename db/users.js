const { DEFAULT_ADMIN } = require("../Credentials");
const { generateUID } = require("../utils/dateFormat");
const { db } = require("./db");
const bcrypt = require("bcryptjs");

const userNameChk = /^[a-z]{3,20}$/;
const passwordChk = /^[a-zA-Z0-9]{6,30}$/;

// Create Users Table
db.run(
  `
    CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    uid TEXT UNIQUE,
    username TEXT UNIQUE,
    password TEXT,
    role TEXT DEFAULT 'user' CHECK(role IN ('admin', 'user'))
  )
`,
  (err) => {
    if (err) {
      console.error("Table creation error:", err.message);
    } else {
      console.log("User Table created successfully");
    }
  }
);

const validateEmail = (username) => {
  if (!userNameChk.test(username)) {
    return {
      valid: false,
      message:
        "Invalid username. It must be 3-20 characters long and contain only lowercase letters.",
    };
  }
  return { valid: true };
};

const validatePassword = (password) => {
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
  const validationEmail = validateEmail(username);
  const validationPassword = validatePassword(password);

  if (!validationEmail.valid) {
    return { success: false, message: validationEmail.message };
  }
  if (!validationPassword.valid) {
    return { success: false, message: validationPassword.message };
  }
  if (username === DEFAULT_ADMIN.username) {
    return { success: false, message: "Username already exist." };
  }

  try {
    const hash = await bcrypt.hash(password, 10);

    const userId = await new Promise((resolve, reject) => {
      let prefix = role === "admin" ? "AD" : "UR";
      let uid = prefix + generateUID();
      db.run(
        "INSERT INTO users (uid, username, password, role) VALUES (?, ?, ?, ?)",
        [uid, username, hash, role],
        function (err) {
          if (err) {
            reject(err);
          } else resolve(this.lastID);
        }
      );
    });

    return {
      success: true,
      user: { id: userId, username, role },
    };
  } catch (err) {
    return {
      success: false,
      message: err.message,
    };
  }
};

const getUsers = () => {
  return new Promise((resolve, reject) => {
    db.all(
      "SELECT id, uid, username, role FROM users ORDER BY id DESC",
      [],
      (err, rows) => {
        if (err) {
          reject({ message: err, success: false });
        } else {
          rows.push(DEFAULT_ADMIN);
          resolve({ data: rows, success: true });
        }
      }
    );
  });
};

const updateUser = async ({ id, username, password, role }) => {
  const validationEmail = validateEmail(username);

  if (!validationEmail.valid) {
    return { success: false, message: validationEmail.message };
  }

  if (password) {
    const validationPassword = validatePassword(password);
    if (!validationPassword.valid) {
      return { success: false, message: validationPassword.message };
    }
  }

  let hash = null;
  if (password) {
    hash = await bcrypt.hash(password, 10);
  }

  return new Promise((resolve, reject) => {
    const query = password
      ? "UPDATE users SET username = ?, password = ?, role = ? WHERE id = ?"
      : "UPDATE users SET username = ?, role = ? WHERE id = ?";
    const params = password ? [username, hash, role, id] : [username, role, id];

    db.run(query, params, function (err) {
      if (err) {
        reject({ success: false, message: err });
      } else {
        resolve({
          message: "User updated successfully",
          success: true,
        });
      }
    });
  });
};

module.exports = { saveUser, getUsers, updateUser };
