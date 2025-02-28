const db = require("./db");
const { generateUID } = require("../utils/dateFormat");

db.run(
  `
      CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        pid TEXT UNIQUE,
        company_id INTEGER,
        model_name TEXT,
        product_type TEXT,
        FOREIGN KEY (company_id) REFERENCES companies(id)
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

function validateProductName(ProductName) {
  const ProductNameChk = /^[A-Za-z0-9 .&-]{3,}$/;
  if (!ProductNameChk.test(ProductName)) {
    return {
      valid: false,
      message:
        "Invalid product name. It must be at least 3 characters long and contain only alphabets, numbers, spaces, dash(-) and &.",
    };
  }
  return { valid: true };
}

const saveProduct = async ({ company_id, model_name, product_type }) => {
  const validationProductName = validateProductName(model_name);

  if (!validationProductName.valid) {
    return { success: false, message: validationProductName.message };
  }

  try {
    let pid = "PR" + generateUID();
    const productId = await new Promise((resolve, reject) => {
      db.run(
        "INSERT INTO products (pid, company_id, model_name, product_type) VALUES (?, ?, ?, ?)",
        [pid, company_id, model_name, product_type],
        function (err) {
          if (err) {
            reject(err);
          } else resolve(this.lastID);
        }
      );
    });
    const companyName = await new Promise((resolve, reject) => {
      db.get(
        "SELECT name FROM companies WHERE id = ?",
        [company_id],
        function (err, row) {
          if (err) {
            reject(err);
          } else resolve(row.name);
        }
      );
    });

    return {
      success: true,
      product: { id: productId, pid, company_id,companyName, model_name, product_type },
    };
  } catch (err) {
    return {
      success: false,
      message: err.message,
    };
  }
};

const getProducts = () => {
  return new Promise((resolve, reject) => {
    db.all(
      `
          SELECT products.id as productId, products.pid, products.model_name, products.product_type, companies.id as companyId, companies.name as companyName
          FROM products
          LEFT JOIN companies ON products.company_id = companies.id
          ORDER BY companies.name ASC, products.id DESC
        `,
      [],
      (err, rows) => {
        if (err) {
          reject({ message: err.message, success: false });
        } else {
          resolve({ data: rows, success: true });
        }
      }
    );
  });
};

const updateProduct = async (productData) => {
  const { id, companyId, model_name, product_type } = productData;

  const validationProductName = validateProductName(model_name);

  if (!validationProductName.valid) {
    return { success: false, message: validationProductName.message };
  }

  return new Promise((resolve, reject) => {
    const fieldsToUpdate = [];
    const params = [];

    if (companyId) {
      fieldsToUpdate.push("company_id = ?");
      params.push(companyId);
    }
    if (model_name) {
      fieldsToUpdate.push("model_name = ?");
      params.push(model_name);
    }
    if (product_type) {
      fieldsToUpdate.push("product_type = ?");
      params.push(product_type);
    }
    if (fieldsToUpdate.length === 0) {
      return reject({ success: false, message: "No fields to update." });
    }

    params.push(id);

    const query = `UPDATE products SET ${fieldsToUpdate.join(
      ", "
    )} WHERE id = ?`;

    db.run(query, params, function (err) {
      if (err) {
        reject({ success: false, message: err.message });
      } else {
        resolve({
          message: "Product updated successfully",
          success: true,
        });
      }
    });
  });
};

module.exports = {
  saveProduct,
  getProducts,
  updateProduct,
};
