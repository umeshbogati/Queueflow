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

export default app;