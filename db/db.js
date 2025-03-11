const sqlite3 = require("sqlite3").verbose();
const fs = require("fs");
const path = require("path");
const sharp = require("sharp");
const express = require("express");
const archiver = require("archiver");
const unzipper = require("unzipper");
const app = express();

const PORT = 3001;

const homeDir = process.env.HOME || process.env.USERPROFILE;

// const dbPath = path.join(__dirname, "data", "database.db");
// const uploadsFolder = path.join(__dirname, "uploads");

const dbFolder = path.join(homeDir, "JkBatteryApp");
const dbDataPath = path.join(dbFolder, "data");
const dbPath = path.join(dbDataPath, "database.db");
const uploadsFolder = path.join(dbDataPath, "uploads");

if (!fs.existsSync(dbFolder)) {
  fs.mkdirSync(dbFolder, { recursive: true });
}
if (!fs.existsSync(dbDataPath)) {
  fs.mkdirSync(dbDataPath, { recursive: true });
}
if (!fs.existsSync(uploadsFolder)) {
  fs.mkdirSync(uploadsFolder, { recursive: true });
}

app.use("/uploads", express.static(uploadsFolder));

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

// const db = new sqlite3.Database(dbPath, (err) => {
//   if (err) console.error("DB Connection Error:", err);
//   else console.log("Database Connected at", dbPath);
// });

let db = null;

function closeDatabase(callback) {
  if (!db) {
    console.log("Database is already closed.");
    return callback(null);
  }

  db.close((err) => {
    if (err) {
      console.error("Error closing database:", err);
      return callback(err);
    }
    console.log("Database closed successfully!");
    db = null; // ⚡ Reset DB reference
    callback(null);
  });
}

function connectDatabase() {
  return new Promise((resolve, reject) => {
    if (db) {
      console.log("Database is already connected.");
      return resolve(db);  // Agar pehle se open hai to dobara open na kare
    }

    db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        console.error("Error connecting to database:", err);
        return reject(err);
      }
      console.log("Database connected at", dbPath);
      resolve(db);
    });
  });
}


connectDatabase();

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

function createZip() {
  return new Promise((resolve, reject) => {
    if (!fs.existsSync(dbFolder)) {
      return resolve({ success: false, message: "Folder does not exist" });
    }

    // Generate ZIP file name
    const timestamp = new Date()
      .toISOString()
      .replace(/[-T:]/g, "_")
      .split(".")[0]; // YYYY_MM_DD_HH_MM_SS
    const zipFileName = `export_${timestamp}.zip`;
    const zipFilePath = path.join(dbFolder, zipFileName);

    // Create write stream
    const output = fs.createWriteStream(zipFilePath);
    const archive = archiver("zip", { zlib: { level: 9 } });

    output.on("close", () =>
      resolve({
        success: true,
        message: "Export File Created, Click on file Explorer Button to view",
      })
    );
    archive.on("error", (err) =>
      resolve({ success: false, message: err.message })
    );

    archive.pipe(output);
    archive.directory(dbDataPath, false); // Add folder contents
    archive.finalize();
  });
}

async function importDatafromZip() {
  try {
    const files = fs.readdirSync(dbFolder)
      .filter(file => file.endsWith(".zip"))
      .map(file => ({ name: file, time: fs.statSync(path.join(dbFolder, file)).mtime }))
      .sort((a, b) => b.time - a.time);

    if (files.length === 0) {
      console.error("No ZIP files found!");
      return { success: false, message: "No ZIP files found." };
    }

    const latestZip = path.join(dbFolder, files[0].name);
    const dataFolder = path.join(dbFolder, "data");

    console.log("Closing Database before extraction...");
    await new Promise((resolve) => closeDatabase(resolve));

    if (fs.existsSync(dataFolder)) {
      fs.rmSync(dataFolder, { recursive: true, force: true });
      console.log("Old 'data' folder deleted.");
    }

    if (!fs.existsSync(dataFolder)) {
      fs.mkdirSync(dataFolder, { recursive: true });
    }

    console.log("Extracting ZIP:", latestZip);
    await fs.createReadStream(latestZip)
      .pipe(unzipper.Extract({ path: dataFolder }))
      .promise();

      if (fs.existsSync(latestZip)) {
        fs.unlinkSync(latestZip);
        console.log("ZIP file deleted after extraction:", latestZip);
      }

    console.log("Data replaced successfully.");
    return { success: true, message: "Data replaced successfully." };

  } catch (error) {
    console.error("Error:", error);
    
    // **If extraction failed, delete the ZIP file**
    if (fs.existsSync(latestZip)) {
      fs.unlinkSync(latestZip);
      console.log("Invalid ZIP file deleted due to error:", latestZip);
    }

    return { success: false, message: error.message };
  }
}


module.exports = { db, saveFile, dbFolder, createZip, importDatafromZip };
