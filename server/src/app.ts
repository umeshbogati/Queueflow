import express from "express";
import cors from "cors";
import authRoutes from "./routes/authRoutes.js";
import branchRoutes from "./routes/branchRoutes.js";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (_req, res) => {
    res.send("Queueflow server is running!");
});

app.use("/api/auth", authRoutes);
app.use("/api/branches", branchRoutes);

export default app;