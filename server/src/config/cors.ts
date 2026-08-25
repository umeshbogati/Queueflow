// Shared CORS whitelist for both Express and Socket.IO.
// Set CLIENT_URL in production (comma-separated list allowed),
// e.g. CLIENT_URL=https://queueflow.bogatiu17.workers.dev
const envOrigins = (process.env.CLIENT_URL ?? "")
    .split(",")
    .map((o) => o.trim())
    .filter(Boolean);

const allowedOrigins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    ...envOrigins,
];

interface CorsOriginCallback {
    (error: Error | null, allow?: boolean): void;
}

export const corsOptions = {
    origin: (origin: string | undefined, callback: CorsOriginCallback) => {
        // Allow requests with no Origin header (curl, Postman, same-origin)
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
            return;
        }
        callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
};
