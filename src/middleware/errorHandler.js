const AppError = require("../utils/AppError");

/**
 * Handle 404 Not Found errors
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @param {function} next - Express next function
 */
function notFoundHandler(req, res, next) {
  const error = new AppError(
    `Route ${req.originalUrl} not found`,
    404
  );
  next(error);
}

/**
 * Handle validation errors (e.g., from mongoose)
 * @param {Error} err - Error object
 * @returns {AppError} - Formatted error
 */
function handleValidationError(err) {
  const errors = Object.values(err.errors).map((e) => e.message);
  const message = `Invalid input data: ${errors.join(". ")}`;
  return new AppError(message, 400);
}

/**
 * Handle duplicate key errors (e.g., from MongoDB)
 * @param {Error} err - Error object
 * @returns {AppError} - Formatted error
 */
function handleDuplicateKeyError(err) {
  const field = Object.keys(err.keyValue)[0];
  const message = `${field} already exists`;
  return new AppError(message, 409);
}

/**
 * Handle JWT errors
 * @param {Error} err - Error object
 * @returns {AppError} - Formatted error
 */
function handleJWTError() {
  return new AppError("Invalid token. Please log in again.", 401);
}

/**
 * Handle JWT expired errors
 * @param {Error} err - Error object
 * @returns {AppError} - Formatted error
 */
function handleJWTExpiredError() {
  return new AppError("Your token has expired. Please log in again.", 401);
}

/**
 * Handle cast errors (e.g., invalid MongoDB ObjectId)
 * @param {Error} err - Error object
 * @returns {AppError} - Formatted error
 */
function handleCastError(err) {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppError(message, 400);
}

/**
 * Send error response in development environment
 * @param {Error} err - Error object
 * @param {object} res - Express response object
 */
function sendErrorDev(err, res) {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
}

/**
 * Send error response in production environment
 * @param {Error} err - Error object
 * @param {object} res - Express response object
 */
function sendErrorProd(err, res) {
  // Operational, trusted error: send message to client
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  } else {
    // Programming or other unknown error: don't leak error details
    console.error("ERROR 💥", err);
    res.status(500).json({
      status: "error",
      message: "Something went wrong!",
    });
  }
}

/**
 * Global error handling middleware
 * @param {Error} err - Error object
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @param {function} next - Express next function
 */
function errorHandler(err, req, res, next) {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  if (process.env.NODE_ENV === "development") {
    sendErrorDev(err, res);
  } else {
    let error = { ...err };
    error.message = err.message;

    // Handle specific error types
    if (err.name === "ValidationError") {
      error = handleValidationError(err);
    }
    if (err.name === "CastError") {
      error = handleCastError(err);
    }
    if (err.code === 11000) {
      error = handleDuplicateKeyError(err);
    }
    if (err.name === "JsonWebTokenError") {
      error = handleJWTError();
    }
    if (err.name === "TokenExpiredError") {
      error = handleJWTExpiredError();
    }

    sendErrorProd(error, res);
  }
}

module.exports = {
  errorHandler,
  notFoundHandler,
};

