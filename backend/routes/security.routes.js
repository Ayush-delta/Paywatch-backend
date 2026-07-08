import express from "express";
import SecurityLog from "../models/SecurityLog.js";
import { parsePagination, paginatedResponse } from "../utils/pagination.js";
import { cacheOrFetch } from "../utils/cache.js";

const router = express.Router();

router.get("/logs", async (req, res, next) => {
  try {
    const { page, limit, skip } = parsePagination(req.query, { defaultLimit: 25, maxLimit: 100 });

    const [logs, totalCount] = await Promise.all([
      SecurityLog.find().sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      SecurityLog.countDocuments(),
    ]);

    res.json(paginatedResponse({ data: logs, page, limit, totalCount }));
  } catch (error) {
    next(error);
  }
});

router.get("/stats", async (req, res, next) => {
  try {
    // Read-heavy dashboard endpoint hit on every page load (Security.jsx
    // polls it every 5s) — cache briefly so bursts of tabs/refreshes don't
    // each trigger 3 aggregation queries.
    const stats = await cacheOrFetch("security:stats", 15, async () => {
      const [total, topIps, topRoutes] = await Promise.all([
        SecurityLog.countDocuments(),
        SecurityLog.aggregate([
          { $group: { _id: "$ip", count: { $sum: 1 } } },
          { $sort: { count: -1 } },
          { $limit: 5 },
        ]),
        SecurityLog.aggregate([
          { $group: { _id: "$path", count: { $sum: 1 } } },
          { $sort: { count: -1 } },
          { $limit: 5 },
        ]),
      ]);

      return { total, topIps, topRoutes };
    });

    res.json(stats);
  } catch (error) {
    next(error);
  }
});

export default router;
