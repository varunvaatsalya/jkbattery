const fs = require("fs");
const path = require("path");
const { DEFAULT_ADMIN } = require("../Credentials");
const { generateUID } = require("../utils/dateFormat");
const { db, saveFile } = require("./db");
const { saveCustomer } = require("./customers");

db.run(
  `
        CREATE TABLE IF NOT EXISTS complaints (
          ctid TEXT UNIQUE,
          complaint_id INTEGER PRIMARY KEY AUTOINCREMENT,
          product_id INTEGER NOT NULL,
          serial_no TEXT,
          purchaseDate TEXT,
          documentName TEXT CHECK(documentName IN ('Warranty Card', 'Purchase Bill')),
          image TEXT,
          customer_id INTEGER,
          dealer_id INTEGER,
          status TEXT DEFAULT 'Pending' CHECK(status IN ('Pending', 'Replaced', 'Rejected')),
          remark TEXT,
          replaced_product_id INTEGER DEFAULT NULL,
          replaced_serial_no TEXT DEFAULT NULL,
          replaced_by INTEGER DEFAULT NULL,
          replaced_at TEXT DEFAULT NULL,
          created_by INTEGER NOT NULL,
          created_at TEXT NOT NULL,
          modified_by INTEGER DEFAULT NULL,
          modified_at TEXT DEFAULT NULL,
          FOREIGN KEY (product_id) REFERENCES products(id),
          FOREIGN KEY (customer_id) REFERENCES customers(id),
          FOREIGN KEY (dealer_id) REFERENCES dealers(id),
          FOREIGN KEY (replaced_product_id) REFERENCES products(id),
          FOREIGN KEY (replaced_by) REFERENCES employees(id),
          FOREIGN KEY (created_by) REFERENCES users(id),
          FOREIGN KEY (modified_by) REFERENCES users(id)
        )
      `,
  (err) => {
    if (err) {
      console.err("Complaint Table creation error:", err.message);
    } else {
      console.log("Complaint table created successfully");
    }
  }
);

const saveComplaint = async (data, buffer, extension) => {
  let ctid = "CT" + generateUID();
  let fName = `${ctid}.${extension}`;

  const {
    product_id,
    serial_no,
    purchaseDate,
    documentName,
    customer_id,
    customer_name,
    customer_contact,
    customer_address,
    dealer_id,
    status = "Pending",
    created_by,
  } = data;

  return new Promise(async (resolve, reject) => {
    try {
      let finalCustomerId = customer_id;

      if (
        !customer_id &&
        customer_name &&
        customer_contact &&
        customer_address
      ) {
        // Save customer first
        const customerResult = await saveCustomer({
          name: customer_name,
          contact: customer_contact,
          address: customer_address,
        });
        if (!customerResult.success) {
          return reject({ success: false, error: customerResult.error });
        }
        finalCustomerId = customerResult.user.id;
      }

      // Save file
      saveFile(buffer, fName, async (err, savedPath) => {
        if (err) {
          console.error("Error Saving File:", err);
          return reject({
            success: false,
            error: "File save failed: " + err.message,
          });
        }
        let image = path.basename(savedPath);
        try {
          db.run(
            `
              INSERT INTO complaints (
                ctid, product_id, serial_no, purchaseDate, documentName, image, 
                customer_id, dealer_id, status, created_by, created_at
              ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `,
            [
              ctid,
              product_id,
              serial_no,
              purchaseDate,
              documentName,
              image,
              finalCustomerId,
              dealer_id,
              status,
              created_by,
              new Date().toISOString(),
            ],
            function (dbError) {
              if (dbError) {
                console.error("Database Save Error:", dbError);

                // Delete the saved image if database save fails
                fs.unlink(savedPath, (unlinkErr) => {
                  if (unlinkErr)
                    console.error("Error deleting file:", unlinkErr);
                });

                return reject({
                  success: false,
                  error: "Database save failed: " + dbError.message,
                });
              }

              resolve({ success: true, complaintId: this.lastID });
            }
          );
        } catch (dbError) {
          console.error("Database Save Error:", dbError);

          // Delete the saved image if an error occurs
          fs.unlink(savedPath, (unlinkErr) => {
            if (unlinkErr) console.error("Error deleting file:", unlinkErr);
          });

          reject({
            success: false,
            error: "Database save failed: " + dbError.message,
          });
        }
      });
    } catch (error) {
      console.error("Save Complaint Error:", error);
      reject({ success: false, error: error.message });
    }
  });
};

const updateComplaint = async (data) => {
  const {
    complaint_id,
    status,
    productDetails: {
      replaced_product_id = null,
      replaced_serial_no = null,
      replaced_at = null,
    } = {},
    replaced_by = null,
    modified_by,
    remark = null,
  } = data;

  return new Promise((resolve, reject) => {
    let query = `UPDATE complaints SET status = ?, modified_by = ?, modified_at = ?`;
    let params = [status, modified_by, new Date().toISOString()];

    if (status === "Rejected") {
      query += `, remark = ? WHERE complaint_id = ?`;
      params.push(remark, complaint_id);
    } else if (status === "Replaced") {
      query += `, replaced_product_id = ?, replaced_serial_no = ?, replaced_by = ?, replaced_at = ? WHERE complaint_id = ?`;
      params.push(
        replaced_product_id,
        replaced_serial_no,
        replaced_by,
        replaced_at,
        complaint_id
      );
    } else {
      query += ` WHERE complaint_id = ?`;
      params.push(complaint_id);
    }

    db.run(query, params, function (err) {
      if (err) {
        console.error("Error updating complaint:", err);
        return reject({ success: false, error: err.message });
      }
      resolve({ success: true, message: "Complaint updated successfully" });
    });
  });
};

const fetchComplaints = async ({ page = 1, status, complaint_id }) => {
  return new Promise((resolve, reject) => {
    const limit = 50;
    const offset = (page - 1) * limit;

    let query = `
      SELECT 
        c.ctid, 
        c.complaint_id, 
        c.product_id, 
        comp.name AS company_name,
        p.model_name,
        p.product_type,
        c.serial_no, 
        c.purchaseDate, 
        c.documentName, 
        c.image,
        c.customer_id, 
        cu.cid,
        cu.name AS customer_name,
        cu.contact AS customer_contact,
        c.dealer_id, 
        d.did,
        d.name AS dealer_name,
        d.contact AS dealer_contact,
        c.status, 
        c.remark, 
        c.replaced_product_id, 
        rp.model_name AS replaced_modal_name,
        rp_comp.name AS rp_company_name,
        rp.product_type AS replaced_product_type,
        c.replaced_serial_no, 
        c.replaced_by, 
        e.name AS replaced_by_e_name,
        e.contact AS replaced_by_e_contact,
        c.replaced_at, 
        c.created_by, 
        CASE 
          WHEN c.created_by = 0 THEN ? 
          ELSE u1.username 
        END AS created_by_username,
        c.created_at, 
        c.modified_by, 
        CASE 
          WHEN c.modified_by = 0 THEN ? 
          ELSE u2.username 
        END AS modified_by_username,
        c.modified_at
      FROM complaints c
      LEFT JOIN products p ON c.product_id = p.id
      LEFT JOIN customers cu ON c.customer_id = cu.id
      LEFT JOIN companies comp ON p.company_id = comp.id
      LEFT JOIN dealers d ON c.dealer_id = d.id
      LEFT JOIN products rp ON c.replaced_product_id = rp.id
      LEFT JOIN employees e ON c.replaced_by = e.id
      LEFT JOIN companies rp_comp ON rp.company_id = rp_comp.id
      LEFT JOIN users u1 ON c.created_by = u1.id
      LEFT JOIN users u2 ON c.modified_by = u2.id
    `;

    let params = [limit, offset];
    if (complaint_id) {
      query += ` WHERE c.complaint_id = ? `;
      params = [complaint_id, ...params];
    } else if (status) {
      query += ` WHERE c.status = ? `;
      params = [status, ...params];
    }
    params = [DEFAULT_ADMIN.username, DEFAULT_ADMIN.username, ...params];

    query += ` ORDER BY c.created_at DESC LIMIT ? OFFSET ?;`;

    // db.all("DELETE from complaints;", (err, rows) => {
    // db.all("DROP TABLE complaints;", (err, rows) => {
    db.all(query, params, (err, rows) => {
      if (err) {
        console.log(err);
        reject({
          success: false,
          error: "Failed to fetch complaints: " + err.message,
        });
      } else {
        resolve({ success: true, complaints: rows });
      }
    });
  });
};

module.exports = {
  saveComplaint,
  fetchComplaints,
  updateComplaint,
};
