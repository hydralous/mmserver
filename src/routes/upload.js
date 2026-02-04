const express = require("express");
const router = express.Router();
const uploadController = require("../controllers/uploadController");

/**
 * POST /upload
 * Upload files with hostname
 */
router.post("/", uploadController.handleFileUpload);

module.exports = router;

