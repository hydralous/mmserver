const authService = require("../services/authService");

/**
 * Register a new user
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 */
async function register(req, res) {
  const { email, name, password } = req.body;

  const result = await authService.registerUser({ email, name, password });

  res.status(201).json({
    message: "User registered successfully",
    token: result.token,
    user: result.user,
  });
}

/**
 * Login a user
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 */
async function login(req, res) {
  const { email, password } = req.body;

  const result = await authService.loginUser({ email, password });

  res.json({
    message: "Login successful",
    token: result.token,
    user: result.user,
  });
}

/**
 * Refresh access token
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 */
async function refreshToken(req, res) {
  const { refresh_token } = req.body;

  const result = await authService.refreshAccessToken(refresh_token);

  res.json({
    message: "Token refreshed successfully",
    access_token: result.access_token,
  });
}

/**
 * Get current user information
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 */
async function getCurrentUser(req, res) {
  const userId = req.user.id;
  const user = await authService.getUserById(userId);

  res.json({
    user,
  });
}

module.exports = {
  register,
  login,
  refreshToken,
  getCurrentUser,
};

