const mongoose = require("mongoose");

const connectdb = async () => {
    try {
        const mongoUrl = process.env.LIVE_URL || process.env.MONOGO_URL;
        
        await mongoose.connect(mongoUrl, {
            maxPoolSize: 10,
            minPoolSize: 2,
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
            family: 4 // Use IPv4 for faster DNS lookup
        });

        console.log("MongoDb Connected Successfully");
    } catch (error) {
        console.log("MongoDB Connection Error:", error);
        // Fallback to local MongoDB if live URL fails or times out
        if (process.env.MONOGO_URL && process.env.LIVE_URL) {
            try {
                console.log("Attempting fallback to local MongoDB...");
                await mongoose.connect(process.env.MONOGO_URL, {
                    maxPoolSize: 10,
                    serverSelectionTimeoutMS: 3000
                });
                console.log("Connected to local MongoDB");
            } catch (err) {
                console.log("Local MongoDB connection error:", err);
            }
        }
    }
};

module.exports = connectdb;