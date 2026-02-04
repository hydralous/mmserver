const authService = require("../services/authService");

/**
 * Register a new user
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 */
async function register(req, res) {
  try {
    const { email, name, password } = req.body;

    const result = await authService.registerUser({ email, name, password });

    res.status(201).json({
      message: "User registered successfully",
      token: result.token,
      user: result.user,
    });
  } catch (error) {
    console.error("Registration error:", error);

    // Handle specific error types
    if (error.message === "User with this email already exists") {
      return res.status(409).json({
        message: error.message,
      });
    }

    if (
      error.message === "Email, name, and password are required" ||
      error.message === "Password must be at least 8 characters long"
    ) {
      return res.status(400).json({
        message: error.message,
      });
    }

    res.status(500).json({
      message: error.message || "Internal server error",
    });
  }
}

/**
 * Login a user
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 */
async function login(req, res) {
  try {
    const { email, password } = req.body;

    const result = await authService.loginUser({ email, password });

    res.json({
      message: "Login successful",
      token: result.token,
      user: result.user,
    });
  } catch (error) {
    console.error("Login error:", error);

    // Handle specific error types
    if (
      error.message === "Email and password are required" ||
      error.message === "Invalid email or password"
    ) {
      const statusCode =
        error.message === "Email and password are required" ? 400 : 401;
      return res.status(statusCode).json({
        message: error.message,
      });
    }

    res.status(500).json({
      message: error.message || "Internal server error",
    });
  }
}

/**
 * Refresh access token
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 */
async function refreshToken(req, res) {
  try {
    const { refresh_token } = req.body;

    const result = await authService.refreshAccessToken(refresh_token);

    res.json({
      message: "Token refreshed successfully",
      access_token: result.access_token,
    });
  } catch (error) {
    console.error("Refresh token error:", error);

    // Handle specific error types
    if (
      error.message === "Refresh token is required" ||
      error.message === "Invalid or expired refresh token" ||
      error.message === "User not found"
    ) {
      const statusCode =
        error.message === "Refresh token is required" ? 400 : 403;
      return res.status(statusCode).json({
        message: error.message,
      });
    }

    res.status(500).json({
      message: error.message || "Internal server error",
    });
  }
}

/**
 * Get current user information
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 */
async function getCurrentUser(req, res) {
  try {
    const userId = req.user.id;
    const user = await authService.getUserById(userId);

    res.json({
      user,
    });
  } catch (error) {
    console.error("Get user error:", error);

    if (error.message === "User not found") {
      return res.status(404).json({
        message: error.message,
      });
    }

    res.status(500).json({
      message: error.message || "Internal server error",
    });
  }
}

module.exports = {
  register,
  login,
  refreshToken,
  getCurrentUser,
};

