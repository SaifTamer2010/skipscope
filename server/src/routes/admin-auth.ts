import express from "express";

// Controllers
import checkEnrollment from "../controllers/admin/auth/checkEnrollment";
import generateEnrollment from "../controllers/admin/auth/generateEnrollment";
import completeEnrollment from "../controllers/admin/auth/completeEnrollment";
import login from "../controllers/admin/auth/login";
import logout from "../controllers/admin/auth/logout";
import verify from "../controllers/admin/auth/verify";

const router = express.Router();

/**
 * POST /api/admin/auth/check-enrollment
 * Check if admin needs enrollment
 */
router.post("/check-enrollment", checkEnrollment);

/**
 * POST /api/admin/auth/generate-enrollment
 * Generate TOTP secret and QR code for first-time enrollment
 */
router.post("/generate-enrollment", generateEnrollment);

/**
 * POST /api/admin/auth/complete-enrollment
 * Verify OTP and complete enrollment
 */
router.post("/complete-enrollment", completeEnrollment);

/**
 * POST /api/admin/auth/login
 * Admin login with OTP (after enrollment)
 */
router.post("/login", login);

/**
 * POST /api/admin/auth/logout
 * Invalidate admin session
 */
router.post("/logout", logout);

/**
 * GET /api/admin/auth/verify
 * Verify admin session token
 */
router.get("/verify", verify);

export default router;
