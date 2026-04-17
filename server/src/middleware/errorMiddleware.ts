import { Request, Response, NextFunction } from "express";
import { SlackService } from "../services/slackService";

/**
 * Global error handler middleware
 */
export const errorMiddleware = async (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error("Express Error:", err);

  // Send Slack notification
  await SlackService.notifyError(err, "express");

  // Respond to client
  res.status(err.status || 500).json({
    error: process.env.NODE_ENV === "production" 
      ? "Internal server error" 
      : err.message || "Internal server error"
  });
};
