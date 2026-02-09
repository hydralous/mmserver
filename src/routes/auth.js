const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const { authenticateToken } = require("../middleware/auth");
const asyncHandler = require("../utils/asyncHandler");

/**
 * POST /auth/register
 * Register a new user
 */
router.post("/register", asyncHandler(authController.register));

/**
 * POST /auth/login
 * Login with email and password
 */
router.post("/login", asyncHandler(authController.login));

/**
 * POST /auth/refresh
 * Refresh access token using refresh token
 */
router.post("/refresh", asyncHandler(authController.refreshToken));

/**
 * GET /auth/me
 * Get current user information (protected route)
 */
router.get("/me", authenticateToken, asyncHandler(authController.getCurrentUser));

module.exports = router;

