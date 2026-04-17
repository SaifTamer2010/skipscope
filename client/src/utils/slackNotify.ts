import axios from "axios";

/**
 * Utility to send Slack notifications from the client
 */
export async function sendSlackNewUserNotify(payload: {
  email: string;
  username?: string;
  company?: string;
  role?: string;
  phone?: string;
}) {
  try {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
    const webhookSecret = process.env.NEXT_PUBLIC_WEBHOOK_SECRET || "your-webhook-secret-here";

    await axios.post(`${API_URL}/webhooks/slack-new-user`, {
      ...payload,
      webhookSecret,
    });
  } catch (error) {
    console.error("Failed to send Slack notification:", error);
  }
}
