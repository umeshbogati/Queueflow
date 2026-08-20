import type { Server } from "socket.io";

export const setupSocketHandlers = (io: Server) => {
    io.on("connection", (socket) => {
        socket.on("join:branch", (branchId: string) => {
            socket.join(`branch:${branchId}`);
        });

        socket.on("leave:branch", (branchId: string) => {
            socket.leave(`branch:${branchId}`);
        });

        socket.on("join:department", (departmentId: string) => {
            socket.join(`department:${departmentId}`);
        });

        socket.on("leave:department", (departmentId: string) => {
            socket.leave(`department:${departmentId}`);
        });

        socket.on("join:admin", () => {
            socket.join("admin");
        });

        socket.on("leave:admin", () => {
            socket.leave("admin");
        });

        socket.on("join:user", (userId: string) => {
            socket.join(`user:${userId}`);
        });

        socket.on("leave:user", (userId: string) => {
            socket.leave(`user:${userId}`);
        });
    });
};
