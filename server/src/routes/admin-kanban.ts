import express from "express";
import { requireAdmin, requireSuperAdmin } from "../middleware/adminAuth";

// Controllers
import getBoard from "../controllers/admin/kanban/getBoard";
import getRequestDetails from "../controllers/admin/kanban/getRequestDetails";
import moveRequest from "../controllers/admin/kanban/moveRequest";
import assignRequest from "../controllers/admin/kanban/assignRequest";
import assignProviderRequest from "../controllers/admin/kanban/assignProviderRequest";
import updateNotes from "../controllers/admin/kanban/updateNotes";
import getColumns from "../controllers/admin/kanban/getColumns";
import updateFinancials from "../controllers/admin/kanban/updateFinancials";
import updateStatus from "../controllers/admin/kanban/updateStatus";
import hardDeleteRequest from "../controllers/admin/kanban/hardDeleteRequest";
import getActivities from "../controllers/admin/kanban/getActivities";
import updatePaymentStatus from "../controllers/admin/kanban/updatePaymentStatus";

const router = express.Router();

// All routes require admin authentication
router.use(requireAdmin);

/**
 * DELETE /api/admin/kanban/request/:id
 * Permanently delete a request (Super admin only)
 */
router.delete("/request/:id", requireSuperAdmin, hardDeleteRequest);

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

/**
 * PATCH /api/admin/kanban/payment-status
 * Update payment completed boolean
 */
router.patch("/payment-status", updatePaymentStatus);

/**
 * PATCH /api/admin/kanban/status
 * Manually update the status of a request
 */
router.patch("/status", updateStatus);

/**
 * GET /api/admin/kanban/activities
 * Get activity log entries for the timeline
 */
router.get("/activities", getActivities);

export default router;
