import "dotenv/config";
import http from "http";
import { setServers } from "dns";

// Set custom DNS servers to avoid potential issues with the default DNS resolution.
try {
    setServers(["8.8.8.8", "1.1.1.1"]);
} catch {
    // Non-fatal: if setServers fails we keep whatever the OS provides.
}

import app from "./app.js";
import { Server as SocketIOServer } from "socket.io";
import connectDB from "./config/db.js";
import { corsOptions } from "./config/cors.js";
import { setupSocketHandlers } from "./sockets/socket.js";
import { reconcileAgentStatuses } from "./services/agentService.js";
import type { ServerToClientEvents, ClientToServerEvents } from "./sockets/socketTypes.js";

const PORT = process.env.PORT || 5000;

// Interval for reconciling agent statuses in milliseconds (1 minute)
const RECONCILE_INTERVAL_MS = 60_000;

const startReconciliation = async () => {
    try {
        await reconcileAgentStatuses();
    } catch (error) {
        console.error("Agent status reconciliation failed:", error);
    }
};

const httpServer = http.createServer(app);

// Socket.IO server with CORS settings and typed events
export const io = new SocketIOServer<ClientToServerEvents, ServerToClientEvents>(httpServer, {
    cors: corsOptions,
});

const startServer = (): void => {
    setupSocketHandlers(io);

    httpServer.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
        console.log(`Socket.IO server is running`);
    });
};

connectDB()
    .then(() => {
        startReconciliation();
        setInterval(startReconciliation, RECONCILE_INTERVAL_MS);
        startServer();
    })
    .catch((error: unknown) => {
        console.error(
            "Failed to connect to MongoDB. Server will not start:",
            error
        );
        process.exit(1);
    });
