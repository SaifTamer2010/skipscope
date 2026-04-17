import express from "express";
import { SlackService } from "../services/slackService";
import { z } from "zod";
import rateLimit from "express-rate-limit";

const router = express.Router();

// Stricter rate limit for support requests
const supportLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // limit each IP to 5 requests per windowMs
  message: { error: "Too many support requests from this IP, please try again after an hour" },
  standardHeaders: true,
  legacyHeaders: false,
});

const supportSchema = z.object({
  name: z.string().min(2, "Name is too short"),
  email: z.string().email("Invalid email address"),
  subject: z.string().min(5, "Subject is too short"),
  message: z.string().min(10, "Message is too short"),
});

router.post("/", supportLimiter, async (req, res, next) => {
  try {
    const validatedData = supportSchema.parse(req.body);

    await SlackService.notifySupportRequest({
      ...validatedData,
      metadata: {
        ip: req.ip,
        userAgent: req.headers["user-agent"],
      },
    });

    res.status(200).json({ success: true, message: "Support request sent successfully" });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        error: "Validation failed", 
        details: error.issues.map((e) => ({
          path: e.path,
          message: e.message,
        }))
      });
    }
    next(error);
  }
});

export default router;
