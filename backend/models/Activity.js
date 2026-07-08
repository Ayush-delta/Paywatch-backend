import mongoose from "mongoose";

const activitySchema = new mongoose.Schema(
    {
        type: {
            type: String,
            enum: ["user", "subscription", "security", "workflow"],
            required: true,
        },
        message: {
            type: String,
            required: true,
        },
        meta: {
            type: Object,
            default: {},
        },
    },
    { timestamps: true }
);

// The activity feed always sorts by createdAt desc and often filters by type
activitySchema.index({ createdAt: -1 });
activitySchema.index({ type: 1, createdAt: -1 });

export default mongoose.model("Activity", activitySchema);
