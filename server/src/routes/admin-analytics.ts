import express from "express";
import { requireAdmin } from "../middleware/adminAuth";

// Controllers
import getDashboardStats from "../controllers/admin/analytics/getDashboardStats";
import getUserAnalytics from "../controllers/admin/analytics/getUserAnalytics";
import getOnlineActivity from "../controllers/admin/analytics/getOnlineActivity";

const router = express.Router();

// All routes require admin authentication
router.use(requireAdmin);

/**
 * GET /api/admin/analytics/dashboard
 * Get comprehensive dashboard analytics
 */
router.get("/dashboard", getDashboardStats);

/**
 * GET /api/admin/analytics/user/:userId
 * Get analytics for a specific user
 */
router.get("/user/:userId", getUserAnalytics);

/**
 * GET /api/admin/analytics/activity-online
 * Get currently active/online users
 */
router.get("/activity-online", getOnlineActivity);

export default router;
