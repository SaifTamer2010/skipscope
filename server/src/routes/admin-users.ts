import express from "express";
import { requireAdmin } from "../middleware/adminAuth";
import listUsers from "../controllers/admin/users/listUsers";

const router = express.Router();

// All routes require admin authentication
router.use(requireAdmin);

/**
 * GET /api/admin/users
 * List all users
 */
router.get("/", listUsers);

export default router;
