const healthService = require("../services/healthService");

/**
 * Health check endpoint handler
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 */
async function healthCheck(req, res) {
  // Get system information from client (sent as query parameters for GET or in body for POST)
  const systemInfo = Object.keys(req.query).length > 0 ? req.query : (req.body || {});
  
  // Get remote IP address
  const ipAddress = healthService.getRemoteIP(req);
  
  // Process health check data
  const healthData = await healthService.processHealthCheck(systemInfo, ipAddress);
  
  res.json(healthData);
}

module.exports = {
  healthCheck,
};

