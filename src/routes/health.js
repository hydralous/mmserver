const express = require("express");
const router = express.Router();
const healthController = require("../controllers/healthController");
const asyncHandler = require("../utils/asyncHandler");

// Health check route
router.get("/", asyncHandler(healthController.healthCheck));
router.post("/", asyncHandler(healthController.healthCheck));

// Health records routes
router.get("/records", asyncHandler(healthController.getHealthRecords));
router.get("/records/:id", asyncHandler(healthController.getHealthRecordById));

module.exports = router;

