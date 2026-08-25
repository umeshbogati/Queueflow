import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { corsOptions } from "./config/cors.js";
import authRoutes from "./routes/authRoutes.js";
import branchRoutes from "./routes/branchRoutes.js";
import departmentRoutes from "./routes/departmentRoutes.js";
import queueRoutes from "./routes/queueRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import agentRoutes from "./routes/agentRoutes.js";

const app = express();

app.use(helmet());
app.use(cors(corsOptions));

app.use(express.json({ limit: "10kb" }));

// Global API rate limit
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit: 300,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: "Too many requests, please try again later." },
});

// Strict limit on auth endpoints (brute-force protection)
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 20,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: "Too many attempts, please try again later." },
});

app.use("/api", apiLimiter);
app.use("/api/auth/login", authLimiter);
app.use("/api/auth/register", authLimiter);

app.get("/", (_req, res) => {
    res.send("Queueflow server is running!");
});
app.use("/api/auth", authRoutes);
app.use("/api/branches", branchRoutes);
app.use("/api/departments", departmentRoutes);
app.use("/api/queues", queueRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/agents", agentRoutes);

// JSON 404 for unknown API routes
app.use((_req, res) => {
    res.status(404).json({
        success: false,
        message: "Route not found",
    });
});

// Global error handler for Express 5.
// Full details stay in server logs; clients only get a generic message.
app.use((err: any, _req: any, res: any, _next: any) => {
    console.error("Unhandled error:", err);

    if (err.message === "Not allowed by CORS") {
        res.status(403).json({
            success: false,
            message: "Origin not allowed",
        });
        return;
    }

    res.status(err.status || 500).json({
        success: false,
        message: "Internal server error",
    });
});

export default app;
