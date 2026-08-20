import type { Server } from "socket.io";

export const setupSocketHandlers = (io: Server) => {
    io.on("connection", (socket) => {
        console.log(`Client connected: ${socket.id}`);

        socket.on("join:branch", (branchId: string) => {
            socket.join(`branch:${branchId}`);
            console.log(`Socket ${socket.id} joined branch:${branchId}`);
        });

        socket.on("leave:branch", (branchId: string) => {
            socket.leave(`branch:${branchId}`);
            console.log(`Socket ${socket.id} left branch:${branchId}`);
        });

        socket.on("join:department", (departmentId: string) => {
            socket.join(`department:${departmentId}`);
            console.log(`Socket ${socket.id} joined department:${departmentId}`);
        });

        socket.on("leave:department", (departmentId: string) => {
            socket.leave(`department:${departmentId}`);
            console.log(`Socket ${socket.id} left department:${departmentId}`);
        });

        socket.on("join:admin", () => {
            socket.join("admin");
            console.log(`Socket ${socket.id} joined admin room`);
        });

        socket.on("leave:admin", () => {
            socket.leave("admin");
            console.log(`Socket ${socket.id} left admin room`);
        });

        socket.on("join:user", (userId: string) => {
            socket.join(`user:${userId}`);
            console.log(`Socket ${socket.id} joined user:${userId}`);
        });

        socket.on("leave:user", (userId: string) => {
            socket.leave(`user:${userId}`);
            console.log(`Socket ${socket.id} left user:${userId}`);
        });

        socket.on("disconnect", (reason) => {
            console.log(`Client disconnected: ${socket.id}`, reason);
        });
    });
};
