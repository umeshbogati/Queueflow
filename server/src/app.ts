import express from "express";
import cors from "cors";
import authRoutes from "./routes/authRoutes.js";
import branchRoutes from "./routes/branchRoutes.js";
import departmentRoutes from "./routes/departmentRoutes.js";
import queueRoutes from "./routes/queueRoutes.js";

const app = express();
app.use(cors());

app.use(express.json());

app.get("/", (_req, res) => {
    res.send("Queueflow server is running!");
});
app.use("/api/auth", authRoutes);
app.use("/api/branches", branchRoutes);
app.use("/api/departments", departmentRoutes);
app.use("/api/queues", queueRoutes);

// Global error handler for Express 5
app.use((err: any, _req: any, res: any, _next: any) => {
    console.error("Unhandled error:", err);
    res.status(500).json({
        success: false,
        message: err.message || "Internal server error",
    });
});

export default app;