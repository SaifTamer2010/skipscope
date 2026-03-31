import express from "express";
import { requireAdmin } from "../middleware/adminAuth";
import listUsers from "../controllers/admin/users/listUsers";
import getUser from "../controllers/admin/users/getUser";
import updateUser from "../controllers/admin/users/updateUser";
import deleteUser from "../controllers/admin/users/deleteUser";

const router = express.Router();

// All routes require admin authentication
router.use(requireAdmin);

router.get("/", listUsers);
router.get("/:id", getUser);
router.put("/:id", updateUser);
router.delete("/:id", deleteUser);

export default router;
