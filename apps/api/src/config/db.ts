import mongoose from "mongoose";
import { ENV } from "./env.js";

let isConnected = false;

export async function connectDB(): Promise<typeof mongoose> {
  if (isConnected && mongoose.connection.readyState === 1) {
    return mongoose;
  }

  try {
    const opts: mongoose.ConnectOptions = {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    };

    const conn = await mongoose.connect(ENV.MONGODB_URI, opts);
    isConnected = true;
    console.log(`[Database] MongoDB connected successfully to ${mongoose.connection.host}`);
    return conn;
  } catch (error) {
    console.error("[Database] Failed to connect to MongoDB:", error);
    throw error;
  }
}

