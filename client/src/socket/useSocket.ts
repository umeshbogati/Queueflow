import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { socket, connectSocket, disconnectSocket, joinBranch, leaveBranch, joinAdmin, leaveAdmin, joinUser, leaveUser } from "../socket/socket";
import type { Queue, QueueStats } from "../api/queueApi";
import type { Branch } from "../api/branchApi";
import type { Department } from "../api/departmentApi";

const useSocketConnected = () => {
    const [isConnected, setIsConnected] = useState(socket.connected);

    useEffect(() => {
        const onConnect = () => setIsConnected(true);
        const onDisconnect = () => setIsConnected(false);

        socket.on("connect", onConnect);
        socket.on("disconnect", onDisconnect);

        return () => {
            socket.off("connect", onConnect);
            socket.off("disconnect", onDisconnect);
        };
    }, []);

    return isConnected;
};

export const useSocketConnection = () => {
    const { token, user } = useAppSelector((state) => state.auth);
    const isConnected = useSocketConnected();

    useEffect(() => {
        if (token) {
            connectSocket();
        } else {
            disconnectSocket();
        }

        return () => {
            disconnectSocket();
        };
    }, [token]);

    useEffect(() => {
        if (!isConnected || !user) return;

        if (user.role === "admin") {
            joinAdmin();
            return () => { leaveAdmin(); };
        }

        joinUser(user._id ?? user.id!);
        return () => { leaveUser(user._id ?? user.id!); };
    }, [isConnected, user]);

    return { socket, isConnected };
};

export const useBranchSocket = (branchId: string | undefined) => {
    const dispatch = useAppDispatch();
    const isConnected = useSocketConnected();

    useEffect(() => {
        if (!branchId || !isConnected) return;

        joinBranch(branchId);

        const unsubQueueCreated = (data: Queue) => {
            dispatch({ type: "queue/fetchQueues/fulfilled", payload: [data] });
        };

        const unsubQueueUpdated = (data: Queue) => {
            dispatch({ type: "queue/applyQueueUpdate", payload: data });
        };

        const unsubStatsUpdated = (data: QueueStats) => {
            dispatch({ type: "queue/applyStatsUpdate", payload: data });
        };

        socket.on("queue:created", unsubQueueCreated);
        socket.on("queue:updated", unsubQueueUpdated);
        socket.on("queue:called", unsubQueueUpdated);
        socket.on("stats:updated", unsubStatsUpdated);

        return () => {
            leaveBranch(branchId);
            socket.off("queue:created", unsubQueueCreated);
            socket.off("queue:updated", unsubQueueUpdated);
            socket.off("queue:called", unsubQueueUpdated);
            socket.off("stats:updated", unsubStatsUpdated);
        };
    }, [branchId, isConnected, dispatch]);
};

export const useQueueSocket = (userId?: string) => {
    const dispatch = useAppDispatch();
    const isConnected = useSocketConnected();

    useEffect(() => {
        if (!userId || !isConnected) return;

        const handleQueueUpdate = (data: Queue) => {
            dispatch({ type: "queue/applyQueueUpdate", payload: data });
        };

        socket.on("queue:updated", handleQueueUpdate);
        socket.on("queue:called", handleQueueUpdate);

        return () => {
            socket.off("queue:updated", handleQueueUpdate);
            socket.off("queue:called", handleQueueUpdate);
        };
    }, [userId, isConnected, dispatch]);
};

export const useAdminSocket = () => {
    const dispatch = useAppDispatch();
    const isConnected = useSocketConnected();

    useEffect(() => {
        if (!isConnected) return;

        const handleBranchCreated = (data: Branch) => {
            dispatch({ type: "branch/applyBranchCreated", payload: data });
        };

        const handleBranchUpdated = (data: Branch) => {
            dispatch({ type: "branch/applyBranchUpdated", payload: data });
        };

        const handleBranchDeleted = (data: { _id: string }) => {
            dispatch({ type: "branch/applyBranchDeleted", payload: data._id });
        };

        const handleDeptCreated = (data: Department) => {
            dispatch({ type: "department/applyDepartmentCreated", payload: data });
        };

        const handleDeptUpdated = (data: Department) => {
            dispatch({ type: "department/applyDepartmentUpdated", payload: data });
        };

        const handleDeptDeleted = (data: { _id: string }) => {
            dispatch({ type: "department/applyDepartmentDeleted", payload: data._id });
        };

        socket.on("branch:created", handleBranchCreated);
        socket.on("branch:updated", handleBranchUpdated);
        socket.on("branch:deleted", handleBranchDeleted);
        socket.on("department:created", handleDeptCreated);
        socket.on("department:updated", handleDeptUpdated);
        socket.on("department:deleted", handleDeptDeleted);

        const handleQueueCreated = (data: Queue) => {
            dispatch({ type: "queue/applyQueueUpdate", payload: data });
        };

        const handleQueueUpdated = (data: Queue) => {
            dispatch({ type: "queue/applyQueueUpdate", payload: data });
        };

        const handleStatsUpdated = (data: QueueStats) => {
            dispatch({ type: "queue/applyStatsUpdate", payload: data });
        };

        socket.on("queue:created", handleQueueCreated);
        socket.on("queue:updated", handleQueueUpdated);
        socket.on("queue:called", handleQueueUpdated);
        socket.on("stats:updated", handleStatsUpdated);

        return () => {
            socket.off("branch:created", handleBranchCreated);
            socket.off("branch:updated", handleBranchUpdated);
            socket.off("branch:deleted", handleBranchDeleted);
            socket.off("department:created", handleDeptCreated);
            socket.off("department:updated", handleDeptUpdated);
            socket.off("department:deleted", handleDeptDeleted);
            socket.off("queue:created", handleQueueCreated);
            socket.off("queue:updated", handleQueueUpdated);
            socket.off("queue:called", handleQueueUpdated);
            socket.off("stats:updated", handleStatsUpdated);
        };
    }, [isConnected, dispatch]);
};
