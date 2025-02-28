const { generateUID } = require("../utils/dateFormat");
const db = require("./db");

// Create Employees Table
db.run(
  `
    CREATE TABLE IF NOT EXISTS employees (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    eid TEXT UNIQUE,
    name TEXT UNIQUE,
    contact TEXT
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

const validateEmployeeName = (name) => {
  const nameChk = /^[A-Za-z ]{3,}$/;
  if (!nameChk.test(name)) {
    return {
      valid: false,
      message:
        "Invalid name. It must be at least 3 characters long and contain only alphabets and spaces.",
    };
  }
  return { valid: true };
};

const validateContactNumber = (contactNumber) => {
  const contactNumberChk = /^[0-9]{10}$/;
  if (!contactNumberChk.test(contactNumber)) {
    return {
      valid: false,
      message:
        "Invalid contact number. It must be exactly 10 digits long and contain only numbers.",
    };
  }
  return { valid: true };
};

const saveEmployee = async ({ name, contact }) => {
  const validationName = validateEmployeeName(name);
  const validationContact = validateContactNumber(contact);

  if (!validationName.valid) {
    return { success: false, message: validationName.message };
  }
  if (!validationContact.valid) {
    return { success: false, message: validationContact.message };
  }

  try {
    const employeeId = await new Promise((resolve, reject) => {
      let prefix = "EM";
      let eid = prefix + generateUID();
      db.run(
        "INSERT INTO employees (eid, name, contact) VALUES (?, ?, ?)",
        [eid, name.toUpperCase(), contact],
        function (err) {
          if (err) {
            reject(err);
          } else resolve(this.lastID);
        }
      );
    });

    return {
      success: true,
      user: { id: employeeId, name: name.toUpperCase(), contact },
    };
  } catch (err) {
    return {
      success: false,
      message: err.message,
    };
  }
};

const getEmployees = () => {
  return new Promise((resolve, reject) => {
    db.all("SELECT * FROM employees ORDER BY id DESC", [], (err, rows) => {
      if (err) {
        reject({ message: err, success: false });
      } else {
        resolve({ data: rows, success: true });
      }
    });
  });
};

const updateEmployee = async ({ id, name, contact }) => {
  const validationName = validateEmployeeName(name);
  const validationContact = validateContactNumber(contact);

  if (!validationName.valid) {
    return { success: false, message: validationName.message };
  }
  if (!validationContact.valid) {
    return { success: false, message: validationContact.message };
  }

  return new Promise((resolve, reject) => {
    const query = "UPDATE employees SET name = ?, contact = ? WHERE id = ?";
    const params = [name.toUpperCase(), contact, id];

    db.run(query, params, function (err) {
      if (err) {
        reject({ success: false, message: err });
      } else {
        resolve({
          message: "Employee updated successfully",
          success: true,
        });
      }
    });
  });
};

module.exports = { saveEmployee, getEmployees, updateEmployee };
