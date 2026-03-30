import { Router } from "express";
import notificationWebhook from "../controllers/webhooks/notificationWebhook";

const router = Router();

/**
 * POST /api/webhooks/notifications
 * Webhook endpoint for creating notifications from external sources
 * Requires webhookSecret in request body for authentication
 */
router.post("/notifications", notificationWebhook);

export default router;
