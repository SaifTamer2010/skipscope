import { NextRequest, NextResponse } from "next/server";

/**
 * Webhook endpoint for receiving notification triggers from external sources
 * This allows the client-side to trigger notifications via webhooks
 *
 * POST /app/api/notifications/webhook
 * Body: {
 *   userId: string,
 *   message: string,
 *   type?: 'info' | 'success' | 'warning' | 'error',
 *   metadata?: Record<string, any>,
 *   requestId?: string,
 *   webhookSecret: string
 * }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, message, type, metadata, requestId, webhookSecret } = body;

    // Validate webhook secret
    const expectedSecret =
      process.env.NEXT_PUBLIC_WEBHOOK_SECRET || "your-webhook-secret-here";
    if (webhookSecret !== expectedSecret) {
      return NextResponse.json(
        { error: "Unauthorized - Invalid webhook secret" },
        { status: 401 },
      );
    }

    // Validate required fields
    if (!userId || !message) {
      return NextResponse.json(
        { error: "Missing required fields: userId and message" },
        { status: 400 },
      );
    }

    // Forward the request to the backend webhook endpoint
    const backendUrl =
      process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
    const response = await fetch(`${backendUrl}/api/webhooks/notifications`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId,
        message,
        type: type || "info",
        metadata: metadata || {},
        requestId,
        webhookSecret: process.env.WEBHOOK_SECRET || webhookSecret,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(
        { error: errorData.error || "Failed to send notification" },
        { status: response.status },
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
