
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '.env.development.local') });

const DB_URI = process.env.DB_URI;

const testConnection = async () => {
    if (!DB_URI) {
        console.error("FAILURE: DB_URI is not defined in .env.development.local");
        process.exit(1);
    }
    console.log("Attempting to connect to MongoDB...");
    try {
        await mongoose.connect(DB_URI, { serverSelectionTimeoutMS: 5000 });
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
