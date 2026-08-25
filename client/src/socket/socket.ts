import { io } from "socket.io-client";
import { SOCKET_EMIT } from "./socketEvents";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:5000";

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
