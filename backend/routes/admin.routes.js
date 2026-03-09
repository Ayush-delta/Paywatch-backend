import { Router } from "express";
import User from "../models/user.model.js";
import SecurityLog from "../models/SecurityLog.js";
import Activity from "../models/Activity.js";

const adminRouter = Router();

adminRouter.get("/users/stats", async (req, res, next) => {
    try {
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);

        const [total, newToday] = await Promise.all([
            User.countDocuments(),
            User.countDocuments({ createdAt: { $gte: todayStart } }),
        ]);

        res.status(200).json({ success: true, data: { total, newToday } });
    } catch (error) {
        next(error);
    }
});

adminRouter.get("/security/stats", async (req, res, next) => {
    try {
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);

        const [total, todayBlocks, topIps] = await Promise.all([
            SecurityLog.countDocuments(),
            SecurityLog.countDocuments({ createdAt: { $gte: todayStart } }),
            SecurityLog.aggregate([
                { $group: { _id: "$ip", count: { $sum: 1 } } },
                { $sort: { count: -1 } },
                { $limit: 5 },
            ]),
        ]);

        res.status(200).json({
            success: true,
            data: { total, todayBlocks, topIps },
        });
    } catch (error) {
        next(error);
    }
});

adminRouter.get("/activity", async (req, res, next) => {
    try {
        const activities = await Activity.find()
            .sort({ createdAt: -1 })
            .limit(20)
            .lean();

        res.status(200).json({ success: true, data: activities });
    } catch (error) {
        next(error);
    }
});

export default adminRouter;
