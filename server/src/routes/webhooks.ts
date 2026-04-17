import { Router } from "express";
import notificationWebhook from "../controllers/webhooks/notificationWebhook";
import notifyNewUser from "../controllers/notifications/notifyNewUser";

const router = Router();

/**
 * POST /api/webhooks/notifications
 * Webhook endpoint for creating notifications from external sources
 * Requires webhookSecret in request body for authentication
 */
router.post("/notifications", notificationWebhook);

/**
 * POST /api/webhooks/slack-new-user
 * Send a Slack notification when a new user signs up
 */
router.post("/slack-new-user", notifyNewUser);

export default router;
