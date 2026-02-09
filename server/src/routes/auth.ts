import { Router } from "express";
import { authMiddleware } from "../middleware/auth";

// Controllers
import login from "../controllers/client/auth/login";
import logout from "../controllers/client/auth/logout";
import register from "../controllers/client/auth/register";

const router = Router();

// Login route
router.post("/login", login);

// Logout route (client-side token removal, but we can log it)
router.post("/logout", authMiddleware, logout);

// Register route (optional - for creating new users)
router.post("/register", register);

export default router;
