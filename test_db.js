
import mongoose from 'mongoose';

// Hardcoded URI from .env.development.local to avoid dotenv issues in isolation
const DB_URI = "mongodb+srv://ayushratna2012_db_user:newdatabase@cluster0.mwrtmfl.mongodb.net/?appName=Cluster0";

const testConnection = async () => {
    console.log("Attempting to connect to MongoDB...");
    try {
        await mongoose.connect(DB_URI, { serverSelectionTimeoutMS: 5000 }); // Fail faster (5s)
        console.log("SUCCESS: Connected to MongoDB!");
        await mongoose.disconnect();
    } catch (error) {
        console.error("FAILURE: Could not connect to MongoDB.");
        console.error("Error Name:", error.name);
        console.error("Error Message:", error.message);
        if (error.cause) console.error("Cause:", error.cause);
    }
};

testConnection();
