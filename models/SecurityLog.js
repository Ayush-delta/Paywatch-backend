import mongoose from "mongoose";

const securityLogSchema = new mongoose.Schema(
  {
    ip: String,
    userId: String,
    path: String,
    method: String,
    reason: String,
  },
  { timestamps: true }
);

export default mongoose.model("SecurityLog", securityLogSchema);
