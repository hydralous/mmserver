const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const { authenticateToken } = require("../middleware/auth");

/**
 * POST /auth/register
 * Register a new user
 */
router.post("/register", authController.register);

/**
 * POST /auth/login
 * Login with email and password
 */
router.post("/login", authController.login);

/**
 * POST /auth/refresh
 * Refresh access token using refresh token
 */
router.post("/refresh", authController.refreshToken);

/**
 * GET /auth/me
 * Get current user information (protected route)
 */
router.get("/me", authenticateToken, authController.getCurrentUser);

module.exports = router;

