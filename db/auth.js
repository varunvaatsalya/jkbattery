const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Store = require("electron-store");
const { db } = require("./db");
const { DEFAULT_ADMIN, SECRET_KEY } = require("../Credentials");
const { saveLogin } = require("./loginsHistory");

const store = new Store();

const userNameChk = /^[a-z]{3,20}$/;
const passwordChk = /^[a-zA-Z0-9]{6,30}$/;

async function loginUser(username, password) {
  return new Promise((resolve, reject) => {
    if (!userNameChk.test(username) || !passwordChk.test(password)) {
      saveLogin(username, false, "Invalid Format");
      return reject(new Error("Invalid Info"));
    }

    db.get(
      "SELECT * FROM users WHERE username = ?",
      [username],
      async (err, user) => {
        if (err) {
          saveLogin(username, false, "Internal Error");
          return reject(err);
        }

        if (user) {
          const validPassword = await bcrypt.compare(password, user.password);
          if (!validPassword) {
            saveLogin(username, false, "Invalid Password");
            return reject(new Error("Invalid password"));
          }

          let data = {
            id: user.id,
            uid: user.uid,
            username: user.username,
            role: user.role,
          };

          // Generate JWT token
          const token = jwt.sign(data, SECRET_KEY, { expiresIn: "2d" });
          store.set("authToken", token);

          saveLogin(username, true, "Logged In Successfully!");
          return resolve({ success: true, data });
        }

        if (
          username === DEFAULT_ADMIN.username &&
          password === DEFAULT_ADMIN.password
        ) {
          let data = {
            id: DEFAULT_ADMIN.id,
            uid: DEFAULT_ADMIN.uid,
            username: DEFAULT_ADMIN.username,
            role: DEFAULT_ADMIN.role,
          };
          const token = jwt.sign(data, SECRET_KEY, { expiresIn: "2d" });
          store.set("authToken", token);
          saveLogin(username, true, "Default Admin LogIn!");
          return resolve({
            success: true,
            data,
            isDefaultAdmin: true,
          });
        }

        saveLogin(username, false, "Invalid User");
        return reject(new Error("User not found"));
      }
    );
  });
}

function isUserLoggedIn() {
  const token = store.get("authToken");
  if (!token) return null;

  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    return decoded;
  } catch (err) {
    store.delete("authToken");
    return null;
  }
}

function logoutUser() {
  store.delete("authToken");
}

module.exports = { loginUser, isUserLoggedIn, logoutUser };
