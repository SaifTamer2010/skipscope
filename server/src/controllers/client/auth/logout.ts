import { Response } from "express";
import { AuthRequest } from "../../../middleware/auth";

const logout = async (req: AuthRequest, res: Response) => {
  try {
    // You can add logout logging here if needed
    res.json({ message: "Logged out successfully" });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export default logout;
