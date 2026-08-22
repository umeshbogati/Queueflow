import type { Server, Socket } from "socket.io";
import jwt from "jsonwebtoken";

interface SocketUser {
    userId: string;
    role: string;
}

// Every socket connection must present a valid JWT (sent by the client
// in handshake.auth.token). Without this, anyone could join the admin
// room or another user's private notification room.
const authenticateSocket = (socket: Socket): SocketUser | null => {
    const token = socket.handshake.auth?.token as string | undefined;

    if (!token) {
        return null;
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
        return null;
    }

    try {
        const decoded = jwt.verify(token, secret) as { id: string; role: string };
        return { userId: decoded.id, role: decoded.role };
    } catch {
        return null;
    }
};

export const setupSocketHandlers = (io: Server) => {
    // Reject unauthenticated connections before any event handler runs
    io.use((socket, next) => {
        const user = authenticateSocket(socket);

        if (!user) {
            next(new Error("Authentication required"));
            return;
        }

        socket.data.userId = user.userId;
        socket.data.role = user.role;
        next();
    });

    io.on("connection", (socket) => {
        const userId = socket.data.userId as string;
        const role = socket.data.role as string;

        // Join the caller's private room immediately using the AUTHENTICATED id.
        // Personal notifications (notification:new, queue:position) are emitted
        // to this room, so delivery must not depend on the client remembering
        // to emit "join:user" with the right id.
        socket.join(`user:${userId}`);

        socket.on("join:branch", (branchId: string) => {
            if (typeof branchId === "string" && branchId.length <= 64) {
                socket.join(`branch:${branchId}`);
            }
        });

        socket.on("leave:branch", (branchId: string) => {
            socket.leave(`branch:${branchId}`);
        });

        socket.on("join:department", (departmentId: string) => {
            if (typeof departmentId === "string" && departmentId.length <= 64) {
                socket.join(`department:${departmentId}`);
            }
        });

        socket.on("leave:department", (departmentId: string) => {
            socket.leave(`department:${departmentId}`);
        });

        socket.on("join:admin", () => {
            // Only admins may join the admin broadcast room
            if (role === "admin") {
                socket.join("admin");
            }
        });

        socket.on("leave:admin", () => {
            socket.leave("admin");
        });

        socket.on("join:user", (requestedId: string) => {
            // Users can only join their own private room
            if (requestedId === userId) {
                socket.join(`user:${userId}`);
            }
        });

        socket.on("leave:user", (_requestedId: string) => {
            socket.leave(`user:${userId}`);
        });
    });
};
