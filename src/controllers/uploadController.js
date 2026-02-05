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

        console.log("Original targetPath:", targetPath);
        
        // Normalize path for cross-platform compatibility
        // Remove Windows drive letters (C:, D:, etc.) - only remove if it's a drive letter pattern
        if (process.platform === 'win32') {
          targetPath = targetPath.replace(/^[A-Za-z]:/, ''); // Remove drive letter
        }
        
        // Remove leading slashes/backslashes to make path relative
        // This prevents absolute paths from being used (security)
        targetPath = targetPath.replace(/^[/\\]+/, '');
        
        // Replace backslashes with forward slashes for cross-platform compatibility
        targetPath = targetPath.replace(/\\/g, '/');
        
        // Remove any path traversal attempts (../, ..\, etc.)
        targetPath = targetPath.replace(/\.\./g, '');
        
        // Remove any remaining colons (Windows drive letter remnants)
        targetPath = targetPath.replace(/:/g, '');
        
        // Sanitize filename - remove any invalid characters
        targetPath = targetPath.replace(/[<>"|?*\x00-\x1f]/g, '_');
        
        // Join with uploads directory (always relative)
        const uploadsRoot = path.join(__dirname, "../../uploads", hostname);
        targetPath = path.join(uploadsRoot, targetPath);
        
        // Normalize the final path (resolve .. and . segments)
        targetPath = path.normalize(targetPath);
        
        // Security check: ensure the final path is still within uploads root
        const resolvedUploadsRoot = path.resolve(uploadsRoot);
        const resolvedTargetPath = path.resolve(targetPath);
        if (!resolvedTargetPath.startsWith(resolvedUploadsRoot)) {
          throw new Error(`Path traversal detected: ${targetPath}`);
        }

        console.log("Final targetPath:", targetPath);
        
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

