import { io } from "socket.io-client";
import { SOCKET_EMIT } from "./socketEvents";

// The socket URL is determined by the VITE_SOCKET_URL environment variable, defaulting to "http://localhost:5000" if not set. Any trailing slashes are removed from the URL.
const rawSocketURL = import.meta.env.VITE_SOCKET_URL || "http://localhost:5000";
const SOCKET_URL = rawSocketURL.replace(/\/+$/, "");

export const socket = io(SOCKET_URL, {
    autoConnect: false,
    withCredentials: true,
    transports: ["websocket", "polling"],
});

export const connectSocket = () => {
    if (!socket.connected) {
        socket.auth = { token: localStorage.getItem("token") };
        socket.connect();
    }
};

export const disconnectSocket = () => {
    if (socket.connected) {
        socket.disconnect();
    }
};

export const joinAdmin = () => {
    socket.emit(SOCKET_EMIT.JOIN_ADMIN);
};

export const leaveAdmin = () => {
    socket.emit(SOCKET_EMIT.LEAVE_ADMIN);
};

export const joinUser = (userId: string) => {
    socket.emit(SOCKET_EMIT.JOIN_USER, userId);
};

export const leaveUser = (userId: string) => {
    socket.emit(SOCKET_EMIT.LEAVE_USER, userId);
};
