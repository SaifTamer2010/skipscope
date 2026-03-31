import express from "express";
import { requireAdmin } from "../middleware/adminAuth";

// Controllers
import getBoard from "../controllers/admin/kanban/getBoard";
import getRequestDetails from "../controllers/admin/kanban/getRequestDetails";
import moveRequest from "../controllers/admin/kanban/moveRequest";
import assignRequest from "../controllers/admin/kanban/assignRequest";
import assignProviderRequest from "../controllers/admin/kanban/assignProviderRequest";
import updateNotes from "../controllers/admin/kanban/updateNotes";
import getColumns from "../controllers/admin/kanban/getColumns";
import updateFinancials from "../controllers/admin/kanban/updateFinancials";

const router = express.Router();

// All routes require admin authentication
router.use(requireAdmin);

/**
 * GET /api/admin/kanban/board
 * Get all requests organized by kanban columns
 */
router.get("/board", getBoard);

/**
 * GET /api/admin/kanban/request/:id
 * Get detailed request information
 */
router.get("/request/:id", getRequestDetails);

/**
 * PATCH /api/admin/kanban/move
 * Move a request to a different column or reorder within column
 */
router.patch("/move", moveRequest);

/**
 * PATCH /api/admin/kanban/assign
 * Assign/unassign admin to a request
 */
router.patch("/assign", assignRequest);

/**
 * PATCH /api/admin/kanban/assign-provider
 * Assign/unassign provider to a request
 */
router.patch("/assign-provider", assignProviderRequest);

/**
 * PATCH /api/admin/kanban/notes
 * Update internal or client notes
 */
router.patch("/notes", updateNotes);

/**
 * GET /api/admin/kanban/columns
 * Get all kanban columns
 */
router.get("/columns", getColumns);

/**
 * PATCH /api/admin/kanban/financials
 * Update financials (invoice, expenses, profit)
 */
router.patch("/financials", updateFinancials);

export default router;
