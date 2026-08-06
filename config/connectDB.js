const mongoose = require("mongoose");

const connectdb = async () => {
    // Check if already connected (1 = connected, 2 = connecting)
    if (mongoose.connection.readyState >= 1) {
        console.log("MongoDB connection already established. Reusing connection.");
        return mongoose.connection;
    }

    try {
        const mongoUrl = process.env.LIVE_URL || process.env.MONOGO_URL;
        if (!mongoUrl) {
            console.error("MongoDB Connection Error: Neither LIVE_URL nor MONOGO_URL environment variables are defined.");
            return;
        }

        const conn = await mongoose.connect(mongoUrl, {
            maxPoolSize: 10,
            minPoolSize: 2,
            serverSelectionTimeoutMS: 10000, // 10 seconds for cold start connection
            socketTimeoutMS: 45000,
            family: 4 // Use IPv4 for faster DNS lookup
        });

        console.log("MongoDb Connected Successfully");
        return conn;
    } catch (error) {
        console.error("MongoDB Connection Error:", error.message || error);
        // Fallback to local MongoDB if live URL fails or times out
        if (process.env.MONOGO_URL && process.env.LIVE_URL && process.env.MONOGO_URL !== process.env.LIVE_URL) {
            try {
                console.log("Attempting fallback to local MongoDB...");
                await mongoose.connect(process.env.MONOGO_URL, {
                    maxPoolSize: 10,
                    serverSelectionTimeoutMS: 5000
                });
                console.log("Connected to local MongoDB");
            } catch (err) {
                console.error("Local MongoDB connection error:", err.message || err);
            }
        }
    }
};

module.exports = connectdb;