const express = require("express");
const cors = require("cors");
const routes = require("./routes");
const { errorHandler, notFoundHandler } = require("./middleware/errorHandler");

/**
 * Create and configure Express application
 * @returns {express.Application} - Configured Express app
 */
function createApp() {
  const app = express();

  // Trust proxy to get correct client IP
  app.set('trust proxy', true);

  // Middleware
  app.use(cors()); // Enable CORS for all routes
  app.use(express.json()); // Parse JSON request bodies
  app.use(express.urlencoded({ extended: true })); // Parse URL-encoded request bodies

  // API routes
  app.use("/", routes);

  // 404 handler - must be after all routes
  app.use(notFoundHandler);

  // Global error handler - must be last
  app.use(errorHandler);

  return app;
}

module.exports = createApp;

