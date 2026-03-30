import { Request, Response } from "express";
import { NotificationService } from "../../services/notificationService";

/**
 * Webhook endpoint for external systems to trigger notifications
 * This allows client-side or other services to create notifications
 */
const notificationWebhook = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { userId, message, type, metadata, requestId, webhookSecret } =
      req.body;

    // Validate webhook secret (basic security)
    const expectedSecret =
      process.env.WEBHOOK_SECRET || "your-webhook-secret-here";
    if (webhookSecret !== expectedSecret) {
      res.status(401).json({ error: "Unauthorized - Invalid webhook secret" });
      return;
    }

    // Validate required fields
    if (!userId || !message) {
      res
        .status(400)
        .json({ error: "Missing required fields: userId and message" });
      return;
    }

    // Create notification
    await NotificationService.createNotification({
      userId,
      message,
      type: type || "info",
      metadata: metadata || {},
      requestId,
    });

    res.json({
      success: true,
      message: "Notification created and sent successfully",
    });
  } catch (error: any) {
    console.error("Notification webhook error:", error);
    res.status(500).json({ error: "Failed to process webhook" });
  }
};

export default notificationWebhook;
