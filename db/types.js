const db = require("./db");

db.run(
  `
      CREATE TABLE IF NOT EXISTS types (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE
      )
    `,
  (err) => {
    if (err) {
      console.error("Table creation error:", err.message);
    } else {
      console.log("Table created successfully");
    }
  }
);

function validateTypeName(typeName) {
  const typeNameChk = /^[A-Za-z]{3,}$/;
  if (!typeNameChk.test(typeName)) {
    return {
      valid: false,
      message:
        "Invalid type name. It must be at least 3 characters long and contain only alphabets",
    };
  }
  return { valid: true };
}

const saveType = async ({ name }) => {
  const validationTypeName = validateTypeName(name);

  if (!validationTypeName.valid) {
    return { success: false, message: validationTypeName.message };
  }

  try {
    const typeId = await new Promise((resolve, reject) => {
      db.run(
        "INSERT INTO types (name) VALUES (?)",
        [name.toUpperCase()],
        function (err) {
          if (err) {
            reject(err);
          } else resolve(this.lastID);
        }
      );
    });

    return {
      success: true,
      company: { id: typeId, name },
    };
  } catch (err) {
    return {
      success: false,
      message: err.message,
    };
  }
};

const getTypes = () => {
  return new Promise((resolve, reject) => {
    db.all(
      "SELECT id, name FROM types ORDER BY id DESC",
      [],
      (err, rows) => {
        if (err) {
          reject({ message: err, success: false });
        } else {
          resolve({ data: rows, success: true });
        }
      }
    );
  });
};

const deleteType = async ({id}) => {
  return new Promise((resolve, reject) => {
    const query = "DELETE FROM types WHERE id = ?";
    const params = [id];

    db.run(query, params, function (err) {
      if (err) {
        reject({ success: false, message: err.message });
      } else {
        resolve({
          message: "Type deleted successfully",
          success: true,
        });
      }
    });
  });
};


module.exports = {
  saveType,
  getTypes,
  deleteType,
};
