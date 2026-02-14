import api from "../api";

// ──────────────────────────────────────
//  ADMIN ANALYTICS
// ──────────────────────────────────────

/**
 * GET /api/v1/admin/users/stats
 * Returns { total, newToday }
 */
export const fetchUserStats = async () => {
    try {
        const response = await api.get("/admin/users/stats");
        return response.data;
    } catch (error) {
        console.error("Failed to fetch user stats:", error.message);
        return { success: false, data: { total: 0, newToday: 0 } };
    }
};

/**
 * GET /api/v1/admin/security/stats
 * Returns { total, todayBlocks, topIps }
 */
export const fetchSecurityStats = async () => {
    try {
        const response = await api.get("/admin/security/stats");
        return response.data;
    } catch (error) {
        console.error("Failed to fetch security stats:", error.message);
        return { success: false, data: { total: 0, todayBlocks: 0, topIps: [] } };
    }
};

/**
 * GET /api/v1/admin/activity
 * Returns last 20 activity items sorted by createdAt desc
 */
export const fetchActivity = async () => {
    try {
        const response = await api.get("/admin/activity");
        return response.data;
    } catch (error) {
        console.error("Failed to fetch activity:", error.message);
        return { success: false, data: [] };
    }
};
