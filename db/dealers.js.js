const { generateUID } = require("../utils/dateFormat");
const { db } = require("./db");

// Create Employees Table
db.run(
  `
    CREATE TABLE IF NOT EXISTS dealers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    did TEXT UNIQUE,
    name TEXT,
    contact TEXT,
    address TEXT
  )
`,
  (err) => {
    if (err) {
      console.error("Table creation error:", err.message);
    } else {
      console.log("Dealer Table created successfully");
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

const saveDealer = async ({ name, contact, address }) => {
  const validationName = validateName(name);
  const validationContact = validateContactNumber(contact);

  if (!validationName.valid) {
    return { success: false, message: validationName.message };
  }
  if (!validationContact.valid) {
    return { success: false, message: validationContact.message };
  }

  try {
    const dealerId = await new Promise((resolve, reject) => {
      let prefix = "DL";
      let eid = prefix + generateUID();
      let query = "INSERT INTO dealers (did, name, contact";
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
      user: { id: dealerId, name: name.toUpperCase(), contact, address },
    };
  } catch (err) {
    return {
      success: false,
      message: err.message,
    };
  }
};


const getDealers = () => {
  return new Promise((resolve, reject) => {
    db.all("SELECT * FROM dealers ORDER BY id DESC", [], (err, rows) => {
      if (err) {
        reject({ message: err, success: false });
      } else {
        resolve({ data: rows, success: true });
      }
    });
  });
};

const findDealers = ({query}) => {
  return new Promise((resolve, reject) => {
    const searchQuery = `
      SELECT * 
      FROM dealers 
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

const updateDealer = async ({ id, name, contact, address }) => {
  const validationName = validateName(name);
  const validationContact = validateContactNumber(contact);

  if (!validationName.valid) {
    return { success: false, message: validationName.message };
  }
  if (!validationContact.valid) {
    return { success: false, message: validationContact.message };
  }

  return new Promise((resolve, reject) => {
    let query = "UPDATE dealers SET name = ?, contact = ?";
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
          message: "Dealer updated successfully",
          success: true,
        });
      }
    });
  });
};


module.exports = { saveDealer, getDealers,findDealers, updateDealer };
