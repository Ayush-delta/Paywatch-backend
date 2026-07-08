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

// Security logs are listed sorted by recency, and aggregated by ip/path for
// the "top attackers" widgets — index each access pattern explicitly.
securityLogSchema.index({ createdAt: -1 });
securityLogSchema.index({ ip: 1, createdAt: -1 });

export default mongoose.model("SecurityLog", securityLogSchema);
