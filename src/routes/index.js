const express = require("express");
const router = express.Router();
const authRoutes = require("./auth");
const uploadRoutes = require("./upload");
const healthRoutes = require("./health");

// Mount route modules
router.use("/health", healthRoutes);
router.use("/auth", authRoutes);
router.use("/upload", uploadRoutes);

module.exports = router;

