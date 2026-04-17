import express from "express";
import { requireAdmin, requireSuperAdmin } from "../middleware/adminAuth";
import listAdmins from "../controllers/admin/admins/listAdmins";
import createAdmin from "../controllers/admin/admins/createAdmin";
import updateAdmin from "../controllers/admin/admins/updateAdmin";
import deleteAdmin from "../controllers/admin/admins/deleteAdmin";

const router = express.Router();

// All routes require super admin authentication
router.use(requireAdmin);
router.use(requireSuperAdmin);

router.get("/", listAdmins);
router.post("/", createAdmin);
router.patch("/:id", updateAdmin);
router.delete("/:id", deleteAdmin);

export default router;
