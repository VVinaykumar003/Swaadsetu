// services/socket.service.js
const { Server } = require("socket.io");

const initializeSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    const rid = socket.handshake.query.rid;
    const tableId = socket.handshake.query.tableId;

    if (!rid) {
      socket.disconnect(true);
      return;
    }

    console.log("Client connected", { socketId: socket.id, rid, tableId });

    // Join staff room for restaurant
    socket.join(`restaurant:${rid}:staff`);

    // Join table-specific room if tableId provided
    if (tableId) {
      socket.join(`restaurant:${rid}:tables:${tableId}`);
    }

    socket.on("disconnect", (reason) => {
      console.log("Client disconnected", { socketId: socket.id, reason });
      socket.leave(`restaurant:${rid}:staff`);
      if (tableId) {
        socket.leave(`restaurant:${rid}:tables:${tableId}`);
      }
    });
  });

  return io;
};

module.exports = { initializeSocket };
