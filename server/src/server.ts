import "dotenv/config";
import http from "http";
import app from "./app.js";
import { Server as SocketIOServer } from "socket.io";
import connectDB from "./config/db.js";
import { setupSocketHandlers } from "./sockets/socket.js";
import type { ServerToClientEvents, ClientToServerEvents } from "./sockets/socketTypes.js";

connectDB();

const PORT = process.env.PORT || 5000;

const httpServer = http.createServer(app);

export const io = new SocketIOServer<ClientToServerEvents, ServerToClientEvents>(httpServer, {
    cors: {
        origin: "http://localhost:5173",
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
        credentials: true,
    },
});

setupSocketHandlers(io);

httpServer.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Socket.IO server is running`);
});
