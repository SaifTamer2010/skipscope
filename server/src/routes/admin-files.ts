import express from "express";
import multer from "multer";
import { requireAdmin } from "../middleware/adminAuth";

// Controllers
import uploadAdminFile from "../controllers/admin/files/uploadAdminFile";
import uploadClientFile from "../controllers/admin/files/uploadClientFile";
import getRequestFiles from "../controllers/admin/files/getRequestFiles";
import downloadFile from "../controllers/admin/files/downloadFile";
import deleteFile from "../controllers/admin/files/deleteFile";
import toggleFileVisibility from "../controllers/admin/files/toggleFileVisibility";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// All routes require admin authentication
router.use(requireAdmin);

/**
 * POST /api/admin/files/upload-admin
 * Upload internal admin-only file
 */
router.post("/upload-admin", upload.single("file"), uploadAdminFile);

/**
 * POST /api/admin/files/upload-client
 * Upload client-visible file
 */
router.post("/upload-client", upload.single("file"), uploadClientFile);

/**
 * GET /api/admin/files/request/:requestId
 * Get all files for a request (both admin and client)
 */
router.get("/request/:requestId", getRequestFiles);

/**
 * GET /api/admin/files/download/:fileId/:type
 * Download a file (type: 'admin' or 'client')
 */
router.get("/download/:fileId/:type", downloadFile);

/**
 * DELETE /api/admin/files/:fileId/:type
 * Delete a file
 */
router.delete("/:fileId/:type", deleteFile);

/**
 * PATCH /api/admin/files/visibility/:fileId
 * Toggle client file visibility
 */
router.patch("/visibility/:fileId", toggleFileVisibility);

export default router;
