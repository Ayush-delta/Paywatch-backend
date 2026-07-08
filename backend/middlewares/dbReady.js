import mongoose from "mongoose";

export default function dbReady(req, res, next) {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({
      success: false,
      message: "Database unavailable. Please try again later.",
    });
  }
  next();
}
