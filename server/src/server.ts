import "dotenv/config";
import http from "http";
import { setServers } from "dns";

// Workaround for a flaky local DNS resolver: on some Windows machines Node's
// default resolver is pointed at 127.0.0.1 and refuses SRV lookups, which makes
// every mongodb+srv:// (Atlas) connection fail with "querySrv ECONNREFUSED".
// Switch to a reliable public DNS so Atlas SRV resolution always works.
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

// Periodically free agents that are stuck "busy" without an active ticket.
// Runs on a fixed interval AND once right after the server starts so statuses
// self-heal without anyone having to open the dashboard.
const RECONCILE_INTERVAL_MS = 60_000;

const startReconciliation = async () => {
    try {
        await reconcileAgentStatuses();
    } catch (error) {
        console.error("Agent status reconciliation failed:", error);
    }
};

connectDB()
    .then(() => {
        startReconciliation();
        setInterval(startReconciliation, RECONCILE_INTERVAL_MS);
    })
    .catch(() => {
        // DB connection error is handled/logged inside connectDB
    });

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
