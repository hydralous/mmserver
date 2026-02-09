const { Server } = require('socket.io');

// Store connected clients and admins
const clients = new Map(); // socketId -> { socket, info }
const admins = new Map();  // socketId -> socket

// Pending commands waiting for response
const pendingCommands = new Map(); // commandId -> { adminSocketId, clientSocketId }

/**
 * Generate a unique command ID
 * @returns {string} - Unique command ID
 */
function generateCommandId() {
  return `cmd_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Broadcast to all admins
 * @param {object} io - Socket.IO instance
 * @param {string} event - Event name
 * @param {any} data - Data to broadcast
 */
function broadcastToAdmins(io, event, data) {
  admins.forEach((socket) => {
    socket.emit(event, data);
  });
}

/**
 * Get all clients info for admins
 * @returns {Array} - Array of client info objects
 */
function getAllClientsInfo() {
  const clientsInfo = [];
  clients.forEach((client, socketId) => {
    clientsInfo.push({
      socketId,
      info: client.info
    });
  });
  return clientsInfo;
}

/**
 * Initialize Socket.IO server
 * @param {object} httpServer - HTTP server instance
 * @returns {object} - Socket.IO instance
 */
function initializeSocketIO(httpServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST']
    }
  });

  io.on('connection', (socket) => {
    console.log(`🔌 New socket connection: ${socket.id}`);

    // Client registration
    socket.on('register-client', (info) => {
      console.log(`📱 Client registered: ${socket.id}`, info);
      clients.set(socket.id, { socket, info });
      
      // Notify all admins about new client
      broadcastToAdmins(io, 'client-connected', {
        socketId: socket.id,
        info
      });
      
      // Send current clients list to the new client (optional)
      socket.emit('registration-success', { socketId: socket.id });
    });

    // Admin registration
    socket.on('register-admin', () => {
      console.log(`👤 Admin registered: ${socket.id}`);
      admins.set(socket.id, socket);
      
      // Send all current clients to the new admin
      socket.emit('clients-list', getAllClientsInfo());
    });

    // Admin sends command to a specific client
    socket.on('send-command', ({ clientSocketId, command }) => {
      console.log(`📤 Admin ${socket.id} sending command to client ${clientSocketId}: ${command}`);
      
      const client = clients.get(clientSocketId);
      if (client) {
        const commandId = generateCommandId();
        
        // Store pending command
        pendingCommands.set(commandId, {
          adminSocketId: socket.id,
          clientSocketId
        });
        
        // Send command to client
        client.socket.emit('execute-command', {
          commandId,
          command
        });
        
        // Acknowledge to admin
        socket.emit('command-sent', { commandId, clientSocketId });
      } else {
        socket.emit('command-error', {
          error: 'Client not found or disconnected',
          clientSocketId
        });
      }
    });

    // Client sends command result back
    socket.on('command-result', ({ commandId, result, error }) => {
      console.log(`📥 Received result for command ${commandId}`);
      
      const pending = pendingCommands.get(commandId);
      if (pending) {
        const admin = admins.get(pending.adminSocketId);
        if (admin) {
          admin.emit('command-response', {
            commandId,
            clientSocketId: pending.clientSocketId,
            result,
            error
          });
        }
        pendingCommands.delete(commandId);
      }
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log(`🔌 Disconnected: ${socket.id}`);
      
      // Check if it was a client
      if (clients.has(socket.id)) {
        const clientInfo = clients.get(socket.id).info;
        clients.delete(socket.id);
        
        // Notify admins about client disconnection
        broadcastToAdmins(io, 'client-disconnected', {
          socketId: socket.id,
          info: clientInfo
        });
      }
      
      // Check if it was an admin
      if (admins.has(socket.id)) {
        admins.delete(socket.id);
        
        // Clean up any pending commands from this admin
        pendingCommands.forEach((value, key) => {
          if (value.adminSocketId === socket.id) {
            pendingCommands.delete(key);
          }
        });
      }
    });
  });

  return io;
}

module.exports = {
  initializeSocketIO,
  getAllClientsInfo,
  broadcastToAdmins,
  clients,
  admins,
  pendingCommands,
};

