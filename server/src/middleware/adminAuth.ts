import { Request, Response, NextFunction } from "express";
import { supabase } from "../config/supabase";

export interface AdminRequest extends Request {
  admin?: {
    id: string;
    username: string;
    displayName: string;
    isSuperAdmin: boolean;
  };
}

/**
 * Middleware to verify admin authentication
 */
export async function requireAdmin(
  req: AdminRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const token = req.headers.authorization?.replace("Bearer ", "");

    if (!token) {
      res.status(401).json({ error: "Authentication required" });
      return;
    }

    // Verify session token
    const { data: session, error } = await supabase
      .from("admin_sessions")
      .select(
        `
        *,
        admin_users (
          id,
          username,
          display_name,
          is_super_admin,
          is_active
        )
      `,
      )
      .eq("token", token)
      .single();

    if (error || !session) {
      res.status(401).json({ error: "Invalid session" });
      return;
    }

    // Check expiration
    if (new Date(session.expires_at) < new Date()) {
      await supabase.from("admin_sessions").delete().eq("token", token);
      res.status(401).json({ error: "Session expired" });
      return;
    }

    // Check if admin is active
    if (!session.admin_users.is_active) {
      res.status(403).json({ error: "Account is disabled" });
      return;
    }

    // Attach admin to request
    req.admin = {
      id: session.admin_users.id,
      username: session.admin_users.username,
      displayName: session.admin_users.display_name,
      isSuperAdmin: session.admin_users.is_super_admin,
    };

    next();
  } catch (error) {
    console.error("Admin auth middleware error:", error);
    res.status(500).json({ error: "Authentication error" });
  }
}

/**
 * Middleware to require super admin privileges
 */
export async function requireSuperAdmin(
  req: AdminRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  if (!req.admin) {
    res.status(401).json({ error: "Authentication required" });
    return;
  }

  if (!req.admin.isSuperAdmin) {
    res.status(403).json({ error: "Super admin privileges required" });
    return;
  }

  next();
}
