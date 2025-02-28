const db = require("./db");

db.run(
  `
      CREATE TABLE IF NOT EXISTS companies (
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

function validateCompanyName(companyName) {
  const companyNameChk = /^[A-Za-z0-9 .&-]{3,}$/;
  if (!companyNameChk.test(companyName)) {
    return {
      valid: false,
      message:
        "Invalid company name. It must be at least 3 characters long and contain only alphabets, numbers, spaces, and &.",
    };
  }
  return { valid: true };
}

const saveCompany = async ({ name }) => {
  const validationCompanyName = validateCompanyName(name);

  if (!validationCompanyName.valid) {
    return { success: false, message: validationCompanyName.message };
  }

  try {
    const comapnyId = await new Promise((resolve, reject) => {
      db.run(
        "INSERT INTO companies (name) VALUES (?)",
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
      company: { id: comapnyId, name },
    };
  } catch (err) {
    return {
      success: false,
      message: err.message,
    };
  }
};

const getCompanies = () => {
  return new Promise((resolve, reject) => {
    db.all(
      "SELECT id, name FROM companies ORDER BY id DESC",
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

const getCompaniesWithProducts = () => {
  return new Promise((resolve, reject) => {
    db.all(
      `
          SELECT companies.id as companyId, companies.name as companyName, products.id as productId, products.pid, products.model_name, products.product_type
          FROM companies
          LEFT JOIN products ON companies.id = products.company_id
          ORDER BY companies.id DESC
        `,
      [],
      (err, rows) => {
        if (err) {
          reject({ message: err.message, success: false });
        } else {
          const result = rows.reduce((acc, row) => {
            const companyIndex = acc.findIndex((c) => c.id === row.companyId);
            if (companyIndex === -1) {
              acc.push({
                id: row.companyId,
                name: row.companyName,
                products: row.productId
                  ? [
                      {
                        id: row.productId,
                        pid: row.pid,
                        model_name: row.model_name,
                        product_type: row.product_type,
                      },
                    ]
                  : [],
              });
            } else {
              acc[companyIndex].products.push({
                id: row.productId,
                pid: row.pid,
                model_name: row.model_name,
                product_type: row.product_type,
              });
            }
            return acc;
          }, []);
          resolve({ data: result, success: true });
        }
      }
    );
  });
};

const updateCompany = async ({ id, name }) => {
  const validationCompanyName = validateCompanyName(name);

  if (!validationCompanyName.valid) {
    return { success: false, message: validationCompanyName.message };
  }

  return new Promise((resolve, reject) => {
    const query = "UPDATE companies SET name = ? WHERE id = ?";
    const params = [name.toUpperCase(), id];

    db.run(query, params, function (err) {
      if (err) {
        reject({ success: false, message: err.message });
      } else {
        resolve({
          message: "Company updated successfully",
          success: true,
        });
      }
    });
  });
};

module.exports = {
  saveCompany,
  getCompanies,
  getCompaniesWithProducts,
  updateCompany,
};
