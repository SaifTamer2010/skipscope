import { Request, Response, NextFunction } from "express";
import { v4 as uuidv4 } from "uuid";

/**
 * Middleware to add a unique request ID to each request
 * This is useful for tracking requests through logs
 */
export const requestIdMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const requestId = req.get("X-Request-ID") || uuidv4();
  
  // Set the request ID in the request object for use in logs/controllers
  (req as any).requestId = requestId;
  
  // Set the request ID in the response headers
  res.setHeader("X-Request-ID", requestId);
  
  next();
};
