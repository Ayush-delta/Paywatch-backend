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

export default mongoose.model("Activity", activitySchema);
