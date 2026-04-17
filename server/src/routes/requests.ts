import { Router } from "express";
import { authMiddleware } from "../middleware/auth";
import { skipTraceLimiter } from "../middleware/rateLimiter";
import { validate } from "../middleware/validationMiddleware";
import { submitRequestSchema } from "../schemas/requestSchema";

// Controllers
import getAllRequests from "../controllers/client/Requests/getAllRequests";
import submitNewRequest from "../controllers/client/Requests/submitNewRequest";
import getRequestById from "../controllers/client/Requests/getRequestById";
import updateRequestById from "../controllers/client/Requests/updateRequestById";
import downloadFile from "../controllers/client/Requests/downloadFile";

const router = Router();

// All routes are protected
router.use(authMiddleware);

// Get all requests for the logged-in user & Submit a new request
router.get("/", getAllRequests);
router.post("/", skipTraceLimiter, validate(submitRequestSchema), submitNewRequest);

// Download file (Specific route before generic /:id)
router.get("/file/:fileId", downloadFile);

// Get request by ID
router.get("/:id", getRequestById).patch("/:id", updateRequestById);

export default router;
