// db/connectDb.js — Cached connection for serverless environments
// Prevents creating a new connection on every API call (kills request latency)
import mongoose from "mongoose";

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
    throw new Error("Please define the MONGO_URI environment variable in .env.local");
}

/**
 * Global cache is used here to preserve the Mongoose connection across
 * hot reloads in development and across function invocations in serverless.
 */
let cached = global.mongoose;

if (!cached) {
    cached = global.mongoose = { conn: null, promise: null };
}

const connectDb = async () => {
    // Return existing connection immediately
    if (cached.conn) {
        return cached.conn;
    }

    // Reuse in-flight connection promise to prevent multiple simultaneous connections
    if (!cached.promise) {
        const opts = {
            bufferCommands: false,
            maxPoolSize: 10,           // Keep up to 10 connections in the pool
            serverSelectionTimeoutMS: 5000, // Fail fast if MongoDB is unreachable
            socketTimeoutMS: 45000,
            connectTimeoutMS: 10000,
            // Prevents Mongoose from creating an index unless explicitly asked
            autoIndex: process.env.NODE_ENV !== "production",
        };

        cached.promise = mongoose.connect(MONGO_URI, opts).then((m) => m);
    }

    try {
        cached.conn = await cached.promise;
    } catch (error) {
        cached.promise = null; // Reset so next call retries
        console.error("MongoDB connection error:", error.message);
        throw error;
    }

    return cached.conn;
};

export default connectDb;