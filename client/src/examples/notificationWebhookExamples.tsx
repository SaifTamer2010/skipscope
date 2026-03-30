/**
 * Example: How to Use the Notification Webhook
 *
 * This file demonstrates various ways to trigger notifications
 * using the webhook system.
 */

import { sendNotificationWebhook } from "@/utils/notificationWebhook";

// Example 1: Simple notification
export async function sendSimpleNotification(userId: string) {
  await sendNotificationWebhook({
    userId,
    message: "Your request has been updated!",
  });
}

// Example 2: Success notification
export async function sendSuccessNotification(
  userId: string,
  requestId: string,
) {
  await sendNotificationWebhook({
    userId,
    requestId,
    message: "Your request has been completed successfully!",
    type: "success",
  });
}

// Example 3: Warning notification
export async function sendWarningNotification(userId: string) {
  await sendNotificationWebhook({
    userId,
    message: "Your account needs attention",
    type: "warning",
  });
}

// Example 4: Error notification
export async function sendErrorNotification(userId: string, error: string) {
  await sendNotificationWebhook({
    userId,
    message: `An error occurred: ${error}`,
    type: "error",
  });
}

// Example 5: Notification with metadata
export async function sendFileUploadNotification(
  userId: string,
  requestId: string,
  fileCount: number,
) {
  await sendNotificationWebhook({
    userId,
    requestId,
    message: `${fileCount} file${fileCount > 1 ? "s" : ""} uploaded to your request`,
    type: "success",
    metadata: {
      action: "file_upload",
      fileCount,
    },
  });
}

// Example 6: Custom action notification
export async function sendCustomNotification(
  userId: string,
  action: string,
  details: Record<string, any>,
) {
  await sendNotificationWebhook({
    userId,
    message: `Action performed: ${action}`,
    type: "info",
    metadata: details,
  });
}

// Example 7: Using in a component
export function ExampleComponent() {
  const handleAction = async (userId: string) => {
    const result = await sendNotificationWebhook({
      userId,
      message: "Action completed!",
      type: "success",
    });

    if (result.success) {
      console.log("Notification sent!");
    } else {
      console.error("Failed:", result.error);
    }
  };

  return (
    <button onClick={() => handleAction("user-id")}>Send Notification</button>
  );
}

// Example 8: External webhook (using fetch directly)
export async function triggerExternalWebhook() {
  const response = await fetch("/app/api/notifications/webhook", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      userId: "user-uuid-here",
      message: "External notification",
      type: "info",
      webhookSecret: process.env.NEXT_PUBLIC_WEBHOOK_SECRET,
    }),
  });

  return response.json();
}

// Example 9: Backend API webhook (direct to server)
export async function triggerBackendWebhook() {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/webhooks/notifications`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId: "user-uuid-here",
        message: "Backend notification",
        type: "info",
        webhookSecret: process.env.NEXT_PUBLIC_WEBHOOK_SECRET,
      }),
    },
  );

  return response.json();
}

// Example 10: Batch notifications
export async function sendBatchNotifications(
  userIds: string[],
  message: string,
) {
  const promises = userIds.map((userId) =>
    sendNotificationWebhook({
      userId,
      message,
      type: "info",
    }),
  );

  const results = await Promise.allSettled(promises);

  const successful = results.filter((r) => r.status === "fulfilled").length;
  const failed = results.filter((r) => r.status === "rejected").length;

  console.log(`Sent ${successful} notifications, ${failed} failed`);
}
