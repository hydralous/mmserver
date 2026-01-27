const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
// Set up the server
const app = express();
const port = 3000;

// Set up multer storage (no file size limit)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // const hostname = req.headers["x-hostname"] || "unknown-host";
    // const baseUpload = path.join("uploads", hostname);

    // // file.originalname contains the full path from client
    // // const dir = req.body.directories[file.originalname] || 'uploads';

    // console.log(req.body.directories)
    // // // Make sure directory exists
    // // if (!fs.existsSync(dir)) {
    // //   fs.mkdirSync(dir, { recursive: true });
    // // }
    // let relativePath = file.originalname;

    // // Optional: remove drive letter on Windows or leading slash on Unix
    // if (process.platform === "win32") {
    //   relativePath = relativePath.replace(/^([a-zA-Z]:\\)/, "");
    // } else {
    //   relativePath = relativePath.startsWith("/")
    //     ? relativePath.slice(1)
    //     : relativePath;
    // }

    // // Get the directory path (without the file name)
    // const fullDir = path.join(baseUpload, path.dirname(relativePath));

    // // console.log(fullDir)
    // // Ensure all directories exist
    // fs.mkdirSync(fullDir, { recursive: true });

    // // Callback with the directory where the file will be saved
    const TEMP_DIR = path.join(__dirname, "temp");
    if (!fs.existsSync(TEMP_DIR)) fs.mkdirSync(TEMP_DIR, { recursive: true });
    cb(null, TEMP_DIR);
  },
  filename: (req, file, cb) => {
    // Save the file with the original filename (basename)
    cb(null, path.basename(file.originalname));
  },
});

// Initialize multer without any file size limit
const upload = multer({ storage: storage }).array("files", 1000); // Supports up to 10 files

/**
 * Function to handle file upload and extract hostname from headers.
 *
 * @param {Request} req - The Express request object.
 * @param {Response} res - The Express response object.
 */
function handleFileUploadWithHostname(req, res) {
  // Extract hostname from headers
  const hostname = req.headers["x-hostname"] || "unknown-host";
  console.log("Received hostname:", hostname);

  // Process the file upload
  upload(req, res, (err) => {
    if (err) {
      return res
        .status(400)
        .json({ message: "Error uploading files", error: err.message });
    }

    // req.body.savePaths is expected to be an array of target paths
    let savePaths = req.body.savePaths;

    if (!savePaths) {
      return res.status(400).json({ message: "No savePaths provided" });
    }

    // If sent as JSON string, parse it
    if (typeof savePaths === "string") {
      try {
        savePaths = JSON.parse(savePaths);
      } catch (parseErr) {
        return res.status(400).json({ message: "Invalid savePaths JSON" });
      }
    }

    const results = [];

    req.files.forEach((file, idx) => {
      try {
        console.log(idx)
        // Get target path for this file
        let targetPath = savePaths[idx];
        if (!targetPath) targetPath = file.originalname; // fallback to original name

        // Optional: force inside safe uploads root
        const ROOT = path.join(__dirname, "uploads", hostname);
        targetPath = path.join(ROOT, targetPath);

        // Ensure directory exists
        fs.mkdirSync(path.dirname(targetPath), { recursive: true });

        // Move file from temp -> final destination
        fs.renameSync(file.path, targetPath);

        results.push({ original: file.originalname, savedTo: targetPath });
      } catch (moveErr) {
        console.error("Error moving file:", moveErr);
        results.push({ original: file.originalname, error: moveErr.message });
      }
    });

    res.json({
      message: "Files uploaded and moved successfully",
      files: results,
      receivedHostname: hostname,
    });
  });
}


// Set up the POST route for file uploads
app.post("/upload", handleFileUploadWithHostname);

// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
