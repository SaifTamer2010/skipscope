/**
 * Utility to send notifications via webhook
 */

export interface WebhookNotificationPayload {
  userId: string;
  message: string;
  type?: "info" | "success" | "warning" | "error";
  metadata?: Record<string, any>;
  requestId?: string;
}

/**
 * Send a notification via the client-side webhook
 * This is useful for triggering notifications from client-side code
 */
export async function sendNotificationWebhook(
  payload: WebhookNotificationPayload,
): Promise<{ success: boolean; error?: string }> {
  try {
    const webhookSecret =
      process.env.NEXT_PUBLIC_WEBHOOK_SECRET || "your-webhook-secret-here";

    const response = await fetch("/app/api/notifications/webhook", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...payload,
        webhookSecret,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return {
        success: false,
        error: errorData.error || "Failed to send notification",
      };
    }

    return { success: true };
  } catch (error: any) {
    console.error("Webhook notification error:", error);
    return {
      success: false,
      error: error.message || "Unknown error occurred",
    };
  }
}

/**
 * Example usage:
 *
 * import { sendNotificationWebhook } from '@/utils/notificationWebhook';
 *
 * // Send a notification
 * await sendNotificationWebhook({
 *   userId: 'user-id-here',
 *   message: 'Your request has been updated!',
 *   type: 'info',
 *   requestId: 'request-id-here',
 *   metadata: { action: 'custom_action' }
 * });
 */
