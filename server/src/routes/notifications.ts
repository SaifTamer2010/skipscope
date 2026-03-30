import { Router } from "express";
import { authMiddleware } from "../middleware/auth";

// Controllers
import getAllNotifications from "../controllers/client/notifications/getAllNotifications";
import markAsRead from "../controllers/client/notifications/markAsRead";
import markAllAsRead from "../controllers/client/notifications/markAllAsRead";
import subscribeNotifications from "../controllers/client/notifications/subscribeNotifications";

const router = Router();

// All routes are protected
router.use(authMiddleware);

// Get all notifications for the logged-in user
router.get("/", getAllNotifications);

// SSE endpoint for real-time notifications
router.get("/subscribe", subscribeNotifications);

// Mark notification as read
router.patch("/:id/read", markAsRead);

// Mark all notifications as read
router.post("/read-all", markAllAsRead);

export default router;
