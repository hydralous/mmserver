const multer = require("multer");
const path = require("path");
const fs = require("fs");
const os = require("os");

// Set up multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const TEMP_DIR = os.tmpdir();
    // System temp directory already exists, no need to create it
    cb(null, TEMP_DIR);
  },
  filename: (req, file, cb) => {
    // Save the file with the original filename (basename)
    cb(null, path.basename(file.originalname));
  },
});

// Initialize multer without any file size limit
const upload = multer({ storage: storage }).array("files", 1000);

/**
 * Handle file upload with hostname
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 */
function handleFileUpload(req, res) {
  // Extract hostname from headers
  const hostname = req.headers["x-hostname"] || "unknown-host";
  console.log("Received hostname:", hostname);

  // Process the file upload
  upload(req, res, (err) => {
    if (err) {
      return res.status(400).json({
        message: "Error uploading files",
        error: err.message,
      });
    }

    // req.body.savePaths is expected to be an array of target paths
    let savePaths = req.body.savePaths;

    if (!savePaths) {
      return res.status(400).json({
        message: "No savePaths provided",
      });
    }

    // If sent as JSON string, parse it
    if (typeof savePaths === "string") {
      try {
        savePaths = JSON.parse(savePaths);
      } catch (parseErr) {
        return res.status(400).json({
          message: "Invalid savePaths JSON",
        });
      }
    }

    const results = [];

    req.files.forEach((file, idx) => {
      try {
        console.log(`Processing file ${idx + 1}/${req.files.length}:`, file.originalname);

        // Get target path for this file
        let targetPath = savePaths[idx];
        if (!targetPath) {
          targetPath = file.originalname; // fallback to original name
        }

        console.log("targetPath", targetPath);
        // Force inside safe uploads root
        targetPath = targetPath.replaceAll(":", "");
        targetPath = path.join(__dirname, "../../uploads", hostname, targetPath);

        // Ensure directory exists
        fs.mkdirSync(path.dirname(targetPath), { recursive: true });

        // Move file from temp -> final destination
        fs.renameSync(file.path, targetPath);

        results.push({
          original: file.originalname,
          savedTo: targetPath,
        });
      } catch (moveErr) {
        console.error("Error moving file:", moveErr);
        results.push({
          original: file.originalname,
          error: moveErr.message,
        });
      }
    });

    res.json({
      message: "Files uploaded and moved successfully",
      files: results,
      receivedHostname: hostname,
      totalFiles: req.files.length,
    });
  });
}

module.exports = {
  handleFileUpload,
};

