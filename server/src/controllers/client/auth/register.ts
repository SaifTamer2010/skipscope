import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { supabase } from "../../../config/supabase";
import { SlackService } from "../../../services/slackService";

const register = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    // Check if user already exists
    const { data: existingUser } = await supabase
      .from("users")
      .select("id")
      .eq("email", email)
      .single();

    if (existingUser) {
      return res.status(409).json({ error: "User already exists" });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user
    const { data: newUser, error } = await supabase
      .from("users")
      .insert({
        email,
        password_hash: passwordHash,
        settings: {},
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    // Send Slack Notification
    await SlackService.notifyNewUser({
      email: newUser.email,
      username: newUser.username,
      // Since this is a simple register, we don't have company/role/phone here
      // But they might be added later
    });

    // Generate JWT token
    const token = jwt.sign(
      { userId: newUser.id, email: newUser.email },
      process.env.JWT_SECRET!,
      { expiresIn: "7d" },
    );

    res.status(201).json({
      token,
      user: {
        id: newUser.id,
        email: newUser.email,
        settings: newUser.settings,
      },
    });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export default register;
