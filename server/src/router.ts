import express from "express";

// Client Controllers
import authRoutes from "./routes/auth";
import requestRoutes from "./routes/requests";
import notificationRoutes from "./routes/notifications";
import historyRoutes from "./routes/history";
import userRoutes from "./routes/user";

// Admin Controllers
import adminAuthRoutes from "./routes/admin-auth";
import adminKanbanRoutes from "./routes/admin-kanban";
import adminFilesRoutes from "./routes/admin-files";
import adminAnalyticsRoutes from "./routes/admin-analytics";
import adminUserRoutes from "./routes/admin-users";

const router = express.Router();

// Client routes
router.use("/auth", authRoutes);
router.use("/requests", requestRoutes);
router.use("/notifications", notificationRoutes);
router.use("/history", historyRoutes);
router.use("/user", userRoutes);

// Admin routes
router.use("/admin/auth", adminAuthRoutes);
router.use("/admin/kanban", adminKanbanRoutes);
router.use("/admin/files", adminFilesRoutes);
router.use("/admin/analytics", adminAnalyticsRoutes);
router.use("/admin/users", adminUserRoutes);

// Webhook routes
import webhookRoutes from "./routes/webhooks";
router.use("/webhooks", webhookRoutes);

export default router;
