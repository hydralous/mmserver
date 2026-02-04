const express = require("express");
const cors = require("cors");
const routes = require("./routes");

/**
 * Create and configure Express application
 * @returns {express.Application} - Configured Express app
 */
function createApp() {
  const app = express();

  // Middleware
  app.use(cors()); // Enable CORS for all routes
  app.use(express.json()); // Parse JSON request bodies
  app.use(express.urlencoded({ extended: true })); // Parse URL-encoded request bodies

  // Health check endpoint (before routes)
  app.get("/health", (req, res) => {
    res.json({
      status: "ok",
      message: "Server is running",
      timestamp: new Date().toISOString(),
    });
  });

  // API routes
  app.use("/", routes);

  // 404 handler
  app.use((req, res) => {
    res.status(404).json({
      status: "error",
      message: "Route not found",
      path: req.originalUrl,
    });
  });

  // Error handling middleware
  app.use((err, req, res, next) => {
    console.error("Error:", err);
    res.status(err.status || 500).json({
      status: "error",
      message: err.message || "Internal server error",
      ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
    });
  });

  return app;
}

module.exports = createApp;

