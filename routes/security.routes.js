import express from "express";
import SecurityLog from "../models/SecurityLog.js";

const router = express.Router();

router.get("/logs", async (req, res) => {
  const logs = await SecurityLog.find()
    .sort({ createdAt: -1 })
    .limit(100);

  res.json(logs);
});

router.get("/stats", async (req, res) => {
  const total = await SecurityLog.countDocuments();

  const topIps = await SecurityLog.aggregate([
    { $group: { _id: "$ip", count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 5 },
  ]);

  const topRoutes = await SecurityLog.aggregate([
    { $group: { _id: "$path", count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 5 },
  ]);

  res.json({ total, topIps, topRoutes });
});

export default router;
