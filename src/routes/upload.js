const express = require("express");
const router = express.Router();
const uploadController = require("../controllers/uploadController");

/**
 * POST /upload
 * Upload files with hostname
 */
router.post("/", uploadController.handleFileUpload);

/**
 * POST /upload/request
 * Request upload of file or directory from client
 */
router.post("/request", uploadController.handleUploadRequest);

module.exports = router;

