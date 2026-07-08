import { Router } from "express";
import User from "../models/user.model.js";
import Subscription from "../models/subscription.model.js";
import SecurityLog from "../models/SecurityLog.js";
import Activity from "../models/Activity.js";
import { cacheOrFetch } from "../utils/cache.js";

const adminRouter = Router();

adminRouter.get("/users/stats", async (req, res, next) => {
    try {
        const data = await cacheOrFetch("admin:users:stats", 30, async () => {
            const todayStart = new Date();
            todayStart.setHours(0, 0, 0, 0);

            const [total, newToday] = await Promise.all([
                User.countDocuments(),
                User.countDocuments({ createdAt: { $gte: todayStart } }),
            ]);

            return { total, newToday };
        });

        res.status(200).json({ success: true, data });
    } catch (error) {
        next(error);
    }
});

// Real daily signup time series — replaces the hardcoded mock chartData
// that used to live in the frontend's Overview.jsx.
adminRouter.get("/users/growth", async (req, res, next) => {
    try {
        const range = req.query.range === "30d" ? 30 : 7;
        const cacheKey = `admin:users:growth:${range}d`;

        const data = await cacheOrFetch(cacheKey, 60, async () => {
            const since = new Date();
            since.setDate(since.getDate() - (range - 1));
            since.setHours(0, 0, 0, 0);

            const rows = await User.aggregate([
                { $match: { createdAt: { $gte: since } } },
                {
                    $group: {
                        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                        count: { $sum: 1 },
                    },
                },
                { $sort: { _id: 1 } },
            ]);

            const byDay = Object.fromEntries(rows.map((r) => [r._id, r.count]));

            // Fill in zero-count days so the chart doesn't skip gaps
            const series = [];
            for (let i = 0; i < range; i++) {
                const d = new Date(since);
                d.setDate(d.getDate() + i);
                const key = d.toISOString().slice(0, 10);
                series.push({
                    name: d.toLocaleDateString(undefined, { weekday: "short" }),
                    date: key,
                    value: byDay[key] || 0,
                });
            }
            return series;
        });

        res.status(200).json({ success: true, data });
    } catch (error) {
        next(error);
    }
});

adminRouter.get("/subscriptions/stats", async (req, res, next) => {
    try {
        const data = await cacheOrFetch("admin:subscriptions:stats", 30, async () => {
            const [byStatus, revenue] = await Promise.all([
                Subscription.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
                Subscription.aggregate([
                    { $match: { status: "active" } },
                    { $group: { _id: null, total: { $sum: "$price" } } },
                ]),
            ]);

            const counts = { active: 0, cancelled: 0, expired: 0 };
            byStatus.forEach((row) => {
                if (row._id in counts) counts[row._id] = row.count;
            });

            const totalSubs = counts.active + counts.cancelled + counts.expired;
            const churnRate = totalSubs ? Number(((counts.cancelled / totalSubs) * 100).toFixed(1)) : 0;

            return {
                ...counts,
                totalRevenue: revenue[0]?.total || 0,
                churnRate,
            };
        });

        res.status(200).json({ success: true, data });
    } catch (error) {
        next(error);
    }
});

adminRouter.get("/security/stats", async (req, res, next) => {
    try {
        const data = await cacheOrFetch("admin:security:stats", 15, async () => {
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

            return { total, todayBlocks, topIps };
        });

        res.status(200).json({ success: true, data });
    } catch (error) {
        next(error);
    }
});

adminRouter.get("/activity", async (req, res, next) => {
    try {
        const data = await cacheOrFetch("admin:activity", 20, async () => {
            return Activity.find().sort({ createdAt: -1 }).limit(20).lean();
        });

        res.status(200).json({ success: true, data });
    } catch (error) {
        next(error);
    }
});

export default adminRouter;
