const { generateUID } = require("../utils/dateFormat");
const { db } = require("./db");

// Create Employees Table
db.run(
  `
    CREATE TABLE IF NOT EXISTS customers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    cid TEXT UNIQUE,
    name TEXT,
    contact TEXT,
    address TEXT
  )
`,
  (err) => {
    if (err) {
      console.error("Table creation error:", err.message);
    } else {
      console.log("Customer Table created successfully");
    }
  }
);

const validateName = (name) => {
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

const saveCustomer = async ({ name, contact, address }) => {
  const validationName = validateName(name);
  const validationContact = validateContactNumber(contact);

  if (!validationName.valid) {
    return { success: false, message: validationName.message };
  }
  if (!validationContact.valid) {
    return { success: false, message: validationContact.message };
  }

  try {
    const customerId = await new Promise((resolve, reject) => {
      let prefix = "CR";
      let eid = prefix + generateUID();
      let query = "INSERT INTO customers (cid, name, contact";
      let values = [eid, name.toUpperCase(), contact];

      if (address) {
        query += ", address) VALUES (?, ?, ?, ?)";
        values.push(address);
      } else {
        query += ") VALUES (?, ?, ?)";
      }

      db.run(query, values, function (err) {
        if (err) {
          reject(err);
        } else {
          resolve(this.lastID);
        }
      });
    });

    return {
      success: true,
      user: { id: customerId, name: name.toUpperCase(), contact, address },
    };
  } catch (err) {
    return {
      success: false,
      message: err.message,
    };
  }
};

const getCustomers = () => {
  return new Promise((resolve, reject) => {
    db.all("SELECT * FROM customers ORDER BY id DESC", [], (err, rows) => {
      if (err) {
        reject({ message: err, success: false });
      } else {
        resolve({ data: rows, success: true });
      }
    });
  });
};

const findCustomers = ({query}) => {
  return new Promise((resolve, reject) => {
    const searchQuery = `
      SELECT * 
      FROM customers 
      WHERE 
        name LIKE ? OR 
        contact LIKE ? OR 
        address LIKE ? 
      ORDER BY id DESC
    `;

    const searchParam = `%${query}%`;

    db.all(searchQuery, [searchParam, searchParam, searchParam], (err, rows) => {
      if (err) {
        reject({ message: err.message, success: false });
      } else {
        resolve({ data: rows, success: true });
      }
    });
  });
};


const updateCustomer = async ({ id, name, contact, address }) => {
  const validationName = validateName(name);
  const validationContact = validateContactNumber(contact);

  if (!validationName.valid) {
    return { success: false, message: validationName.message };
  }
  if (!validationContact.valid) {
    return { success: false, message: validationContact.message };
  }

  return new Promise((resolve, reject) => {
    let query = "UPDATE customers SET name = ?, contact = ?";
    const params = [name.toUpperCase(), contact];

    if (address) {
      query += ", address = ?";
      params.push(address);
    }

    query += " WHERE id = ?";
    params.push(id);

    db.run(query, params, function (err) {
      if (err) {
        reject({ success: false, message: err });
      } else {
        resolve({
          message: "Customer updated successfully",
          success: true,
        });
      }
    });
  });
};


module.exports = { saveCustomer, getCustomers, updateCustomer, findCustomers };
