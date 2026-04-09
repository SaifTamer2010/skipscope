import { Router, Response } from "express";
import { supabase } from "../config/supabase";
import { authMiddleware, AuthRequest } from "../middleware/auth";

// Controllers
import getSettings from "../controllers/client/userSettings/getSettings";
import updateSettings from "../controllers/client/userSettings/updateSettings";
import getUser from "../controllers/client/userSettings/getUser";
import deleteAccount from "../controllers/client/userSettings/deleteAccount";

const router = Router();

router.use(authMiddleware);

router.get("/settings", getSettings); //get settings
router.post("/settings", updateSettings); //update settings
router.get("/profile", getUser); // get User info
router.delete("/account", deleteAccount); // delete account


export default router;
