const sqlite3 = require("sqlite3").verbose();
const fs = require("fs");
const path = require("path");
const sharp = require("sharp");
const express = require("express");
const app = express();

const PORT = 3001;

const dbPath = path.join(__dirname, "data", "database.db");
const uploadsFolder = path.join(__dirname, "uploads"); // DB stored in `db/data/`

app.use("/uploads", express.static(uploadsFolder));

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) console.error("DB Connection Error:", err);
  else console.log("Database Connected at", dbPath);
});

if (!fs.existsSync(uploadsFolder)) {
  fs.mkdirSync(uploadsFolder, { recursive: true });
}


// const saveFile = (fileBuffer,fileName, callback) => {
//   if (!fileBuffer) {
//     return callback(new Error("Invalid file data"), null);
//   }

//   const newPath = path.join(uploadsFolder, fileName);

//   fs.writeFile(newPath, Buffer.from(fileBuffer), (err) => {
//     if (err) {
//       return callback(err, null);
//     }
//     console.log("File Saved at:", newPath);
//     callback(null, newPath);
//   });
// };

const saveFile = (fileBuffer, fileName, callback) => {
  if (!fileBuffer) {
    return callback(new Error("Invalid file data"), null);
  }

  const newPath = path.join(uploadsFolder, fileName);
  const extension = fileName.split(".").pop().toLowerCase();

  // Supported Image Extensions
  const validExtensions = ["jpg", "jpeg", "png", "webp"];

  if (!validExtensions.includes(extension)) {
    return callback(new Error("Unsupported file type"), null);
  }

  sharp(Buffer.from(fileBuffer))
    .jpeg({ quality: 75 }) // 75% quality for compression
    .toBuffer()
    .then((compressedBuffer) => {
      // Check if compressed size is below 200 KB
      if (compressedBuffer.length > 200 * 1024) {
        return sharp(compressedBuffer)
          .jpeg({ quality: 50 }) // Further compression if needed
          .toBuffer();
      }
      return compressedBuffer;
    })
    .then((finalBuffer) => {
      fs.writeFile(newPath, finalBuffer, (err) => {
        if (err) {
          return callback(err, null);
        }
        callback(null, newPath);
      });
    })
    .catch((err) => callback(err, null));
};

module.exports = { db, saveFile };

// const sqlite3 = require("sqlite3").verbose();
// const path = require("path");
// const fs = require("fs");

// // Get User's Home Directory
// const homeDir = process.env.HOME || process.env.USERPROFILE;

// // Define Folder & Database Path
// const dbFolder = path.join(homeDir, "JkBattery");
// const dbPath = path.join(dbFolder, "database.db");

// // Check & Create Folder If Not Exists
// if (!fs.existsSync(dbFolder)) {
//     fs.mkdirSync(dbFolder, { recursive: true });
//     console.log("Folder Created:", dbFolder);
// }

// // Connect to Database
// const db = new sqlite3.Database(dbPath, (err) => {
//     if (err) console.error("DB Connection Error:", err);
//     else console.log("Database Connected at", dbPath);
// });

// module.exports = db;

// const sqlite3 = require("sqlite3").verbose();
// const path = require("path");
// const fs = require("fs");

// // Get User's Home Directory
// const homeDir = process.env.HOME || process.env.USERPROFILE;

// // Define Folder & Database Path
// const dbFolder = path.join(homeDir, "JkBattery");
// const dbPath = path.join(dbFolder, "database.db");
// const uploadsFolder = path.join(dbFolder, "uploads"); // Image Storage Folder

// // Check & Create Folders If Not Exists
// if (!fs.existsSync(dbFolder)) {
//     fs.mkdirSync(dbFolder, { recursive: true });
//     console.log("Folder Created:", dbFolder);
// }

// // Check & Create Uploads Folder
// if (!fs.existsSync(uploadsFolder)) {
//     fs.mkdirSync(uploadsFolder, { recursive: true });
//     console.log("Uploads Folder Created:", uploadsFolder);
// }

// // Connect to Database
// const db = new sqlite3.Database(dbPath, (err) => {
//     if (err) console.error("DB Connection Error:", err);
//     else console.log("Database Connected at", dbPath);
// });

// // Function to Save File
// const saveFile = (file, callback) => {
//     if (!file) {
//         return callback(new Error("No file provided"), null);
//     }

//     const newFileName = `complaint_${Date.now()}_${file.name}`;
//     const newPath = path.join(uploadsFolder, newFileName);

//     fs.copyFile(file.path, newPath, (err) => {
//         if (err) {
//             return callback(err, null);
//         }
//         console.log("File Saved at:", newPath);
//         callback(null, newPath);
//     });
// };

// // Export Database & Save File Function
// module.exports = { db, saveFile };
