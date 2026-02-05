const { clients, admins, pendingCommands } = require('../services/socketService');

/**
 * Generate a unique command ID
 * @returns {string} - Unique command ID
 */
function generateCommandId() {
  return `upload_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Handle upload request - forward to mmscript via socket
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 */
function handleUploadRequest(req, res) {
  const { clientSocketId, adminSocketId, path } = req.body;

  if (!clientSocketId || !path) {
    return res.status(400).json({
      message: 'Missing required fields: clientSocketId and path',
    });
  }

  // Check if client is connected
  const client = clients.get(clientSocketId);
  if (!client) {
    return res.status(404).json({
      message: 'Client not found or disconnected',
    });
  }

  // Check if admin is connected (if adminSocketId provided)
  if (adminSocketId) {
    const admin = admins.get(adminSocketId);
    if (!admin) {
      return res.status(404).json({
        message: 'Admin not found or disconnected',
      });
    }
  }

  // Send upload command to mmscript via socket
  // The command will be a special JSON command that mmscript will recognize
  const command = JSON.stringify({
    type: 'upload',
    path: path
  });

  // Generate command ID
  const commandId = generateCommandId();
  
  // Track command in pendingCommands if adminSocketId is provided
  if (adminSocketId) {
    pendingCommands.set(commandId, {
      adminSocketId,
      clientSocketId
    });
  }
  
  // Send command to client (mmscript)
  // The upload will happen asynchronously
  client.socket.emit('execute-command', {
    commandId,
    command
  });

  // Acknowledge immediately - upload happens in background
  res.json({
    message: 'Upload request sent to client',
    commandId,
    path,
    status: 'initiated'
  });
}

module.exports = {
  handleUploadRequest,
};

