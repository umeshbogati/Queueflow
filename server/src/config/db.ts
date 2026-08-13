import mongoose from "mongoose";

const connectDB = async (): Promise<void> => {
    try {
        const mongoURI = process.env.MONGO_URI;
        if (!mongoURI) {
            throw new Error("MONGO_URI is not defined");
        }

        const options = {
            serverSelectionTimeoutMS: 5000,
            connectTimeoutMS: 10000,
        } as mongoose.ConnectOptions;

        const connection = await mongoose.connect(mongoURI, options);
        console.log(`MongoDB connected: ${connection.connection.host}`);
    } catch (error) {
        console.error("MongoDB connection failed:", error);
        process.exit(1);
    }
};

export default connectDB;