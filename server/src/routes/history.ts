import { Router } from "express";
import { authMiddleware } from "../middleware/auth";

// Controllers
import getRequestHistory from "../controllers/client/history/getHistory";
import downloadHistoryCsv from "../controllers/client/history/downloadHistoryCsv";

const router = Router();

// All routes are protected
router.use(authMiddleware);

// Get request history for the logged-in user
router.get("/", getRequestHistory);

// Download CSV of request history
router.get("/csv", downloadHistoryCsv);

export default router;
