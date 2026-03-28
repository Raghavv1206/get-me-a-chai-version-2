// db/connectDb.js — Cached connection for serverless environments
// Prevents creating a new connection on every API call (kills request latency)
import mongoose from "mongoose";

/**
 * Global cache is used here to preserve the Mongoose connection across
 * hot reloads in development and across function invocations in serverless.
 */
let cached = global.mongoose;

if (!cached) {
    cached = global.mongoose = { conn: null, promise: null };
}

const connectDb = async () => {
    // Defer env check to runtime so builds don't fail without the variable
    const MONGO_URI = process.env.MONGO_URI;
    if (!MONGO_URI) {
        throw new Error(
            "MONGO_URI environment variable is not set. " +
            "Add it to your Vercel project settings under Environment Variables."
        );
    }

    // If we have a live, connected connection — reuse it immediately
    if (cached.conn) {
        const state = cached.conn.connection?.readyState;
        // 1 = connected, 2 = connecting — reuse both
        if (state === 1 || state === 2) {
            return cached.conn;
        }
        // Connection dropped; clear cache and reconnect
        cached.conn = null;
        cached.promise = null;
    }

    // Reuse in-flight connection promise to prevent multiple simultaneous connections
    if (!cached.promise) {
        const opts = {
            bufferCommands: false,
            maxPoolSize: 10,                  // Up to 10 connections per serverless instance
            serverSelectionTimeoutMS: 5000,   // Fail fast if MongoDB is unreachable
            socketTimeoutMS: 45000,
            connectTimeoutMS: 10000,
            retryWrites: true,
            // Disable auto-index creation in production (run migrations explicitly)
            autoIndex: process.env.NODE_ENV !== "production",
        };

        cached.promise = mongoose.connect(MONGO_URI, opts).then((m) => m);
    }

    try {
        cached.conn = await cached.promise;
    } catch (error) {
        // Reset promise so the next call can retry — critical for auth errors
        cached.promise = null;
        // Provide a clear, actionable error message for authentication failures
        if (error.code === 8000 || error.codeName === "AtlasError") {
            console.error(
                "[connectDb] MongoDB Atlas authentication failed. " +
                "Check that MONGO_URI in Vercel environment variables is correct " +
                "and that the database user password has no unencoded special characters.",
                { code: error.code, codeName: error.codeName }
            );
        } else {
            console.error("[connectDb] MongoDB connection error:", error.message);
        }
        throw error;
    }

    return cached.conn;
};

export default connectDb;