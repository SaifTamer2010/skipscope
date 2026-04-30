import { Router } from "express";
import { authMiddleware } from "../middleware/auth";

// Controllers
import login from "../controllers/client/auth/login";
import logout from "../controllers/client/auth/logout";
import register from "../controllers/client/auth/register";
import sendOtp from "../controllers/client/auth/sendOtp";
import verifyOtp from "../controllers/client/auth/verifyOtp";
import rateLimit from "express-rate-limit";

const router = Router();

// Rate limiter for sending OTP: 3 requests per 10 minutes per IP/email
const otpLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 3, // Limit each IP to 3 requests per `window`
  message: { error: "Too many requests, please try again after 10 minutes" },
  standardHeaders: true,
  legacyHeaders: false,
});

// Login route
router.post("/login", login);

// OTP routes
router.post("/send-otp", otpLimiter, sendOtp);
router.post("/verify-otp", verifyOtp);

// Logout route (client-side token removal, but we can log it)
router.post("/logout", authMiddleware, logout);

// Register route (optional - for creating new users)
router.post("/register", register);

export default router;
