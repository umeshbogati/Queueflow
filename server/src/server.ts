import dotenv from "dotenv";
import app from "./app.js";
import connectDB from "./config/db.js";

dotenv.config();

const PORT = process.env.PORT || 5000;

//  Connect to MongoDB first
const startServer = async () => {
    await connectDB();

    //  Start listening for requests only after DB is ready
    app.listen(PORT, () => {
        console.log(` Server is running on port ${PORT}`);
    });
};

startServer();