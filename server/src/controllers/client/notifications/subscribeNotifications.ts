import { Response } from "express";
import { AuthRequest } from "../../../middleware/auth";
import { NotificationService } from "../../../services/notificationService";

/**
 * SSE endpoint for real-time notifications
 * Client keeps connection open and receives notifications as they happen
 */
const subscribeNotifications = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  // Set headers for SSE
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no"); // Disable buffering for nginx

  // CORS headers for SSE
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Credentials", "true");

  const userId = req.userId!;

  // Send initial connection message
  res.write(
    `data: ${JSON.stringify({ type: "connected", message: "Connected to notifications" })}\n\n`,
  );

  // Callback function to send data to client
  const sendData = (data: any) => {
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  };

  // Register this client
  NotificationService.registerSSEClient(userId, sendData);

  // Send heartbeat every 30 seconds to keep connection alive
  const heartbeatInterval = setInterval(() => {
    res.write(`: heartbeat\n\n`);
  }, 30000);

  // Clean up on client disconnect
  req.on("close", () => {
    clearInterval(heartbeatInterval);
    NotificationService.unregisterSSEClient(userId, sendData);
    res.end();
  });
};

export default subscribeNotifications;
