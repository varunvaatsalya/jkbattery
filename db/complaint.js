const db = require("./db");

db.run(
    `
      CREATE TABLE IF NOT EXISTS Complaint (
        complaint_id INTEGER PRIMARY KEY AUTOINCREMENT,
        product_id INTEGER NOT NULL,
        serial_no TEXT,
        warranty_card BOOLEAN,
        bill_have BOOLEAN,
        warranty_doc TEXT,
        bill_doc TEXT,
        customer_id INTEGER,
        dealer_id INTEGER,
        date_of_sale DATE,
        status TEXT DEFAULT 'Pending',
        replaced_product_id INTEGER,
        replaced_serial_no TEXT,
        replaced_by TEXT CHECK (replaced_by IN ('Dealer', 'Distributor')),
        employee_id INTEGER,
        FOREIGN KEY (product_id) REFERENCES products(id),
        FOREIGN KEY (customer_id) REFERENCES Customer(customer_id),
        FOREIGN KEY (dealer_id) REFERENCES Dealer(dealer_id),
        FOREIGN KEY (replaced_product_id) REFERENCES products(id),
        FOREIGN KEY (employee_id) REFERENCES Employee(employee_id)
      )
    `,
    (err) => {
      if (err) {
        console.error("Table creation error:", err.message);
      } else {
        console.log("Complaint table created successfully");
      }
    }
  );
  