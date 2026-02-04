const { verifyAccessToken } = require("../utils/jwt");

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
    return res.status(401).json({ message: "Access token required" });
  }

  const decoded = verifyAccessToken(token);

  if (!decoded) {
    return res.status(403).json({ message: "Invalid or expired token" });
  }

  // Attach user info to request
  req.user = decoded;
  next();
}

module.exports = {
  authenticateToken,
};

