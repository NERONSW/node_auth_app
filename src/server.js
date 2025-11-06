import dotenv from "dotenv";
import mongoose from "mongoose";
import app from "./app.js";

// Environment variables
dotenv.config();
const port = process.env.PORT || 3000;
const mongodb_url = process.env.MONGO_DB_URL;

// Database connection and server startup
const startServer = async () => {
  try {
    // 1st Connect to MongoDB
    await mongoose.connect(mongodb_url);
    console.log("✅ MongoDB connected successfully!");

    // 2nd Start Express server only after DB connection
    app.listen(port, () => {
      console.log(`🚀 Server running on port ${port}`);
    });
  } catch (err) {
    console.error("App starting error:", err.message);
    process.exit(1);
  }
};

startServer();
