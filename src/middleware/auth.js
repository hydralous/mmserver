const { verifyAccessToken } = require("../utils/jwt");
const AppError = require("../utils/AppError");

/**
 * Middleware to authenticate requests using JWT access token
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @param {function} next - Express next function
 */
function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN

  if (!token) {
    return next(new AppError("Access token required", 401));
  }

  const decoded = verifyAccessToken(token);

  if (!decoded) {
    return next(new AppError("Invalid or expired token", 403));
  }

  // Attach user info to request
  req.user = decoded;
  next();
}

module.exports = {
  authenticateToken,
};

