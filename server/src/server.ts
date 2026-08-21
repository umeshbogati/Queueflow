import "dotenv/config";
import http from "http";
import app from "./app.js";
import { Server as SocketIOServer } from "socket.io";
import connectDB from "./config/db.js";
import { corsOptions } from "./config/cors.js";
import { setupSocketHandlers } from "./sockets/socket.js";
import type { ServerToClientEvents, ClientToServerEvents } from "./sockets/socketTypes.js";

connectDB();

const PORT = process.env.PORT || 5000;

const httpServer = http.createServer(app);

// Socket.IO server with CORS settings and typed events
export const io = new SocketIOServer<ClientToServerEvents, ServerToClientEvents>(httpServer, {
    cors: corsOptions,
});

setupSocketHandlers(io);

httpServer.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Socket.IO server is running`);
});
