// Shared CORS whitelist for both Express and Socket.IO.
// Covers the Vite dev server opened via localhost OR 127.0.0.1.
const allowedOrigins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
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
