// CORS configuration for the Express server. This allows cross-origin requests from the specified origins.
const envOrigins = (process.env.CLIENT_URL ?? "")
    .split(",")
    .map((o) => o.trim().replace(/\/+$/, ""))
    .filter(Boolean);
// The allowedOrigins array includes localhost for development and any origins specified in the CLIENT_URL environment variable.
const allowedOrigins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "https://queueflow-dusky.vercel.app",
    ...envOrigins,
];

interface CorsOriginCallback {
    (error: Error | null, allow?: boolean): void;
}

export const corsOptions = {
    origin: (origin: string | undefined, callback: CorsOriginCallback) => {
        // Allow requests with no Origin header (curl, Postman, same-origin)
        if (!origin) {
            callback(null, true);
            return;
        }

        const normalizedOrigin = origin.replace(/\/+$/, "");
        if (allowedOrigins.includes(normalizedOrigin)) {
            callback(null, true);
            return;
        }

        callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE","OPTIONS"],
     allowedHeaders: ["Content-Type", "Authorization"],
};
