import { Request, Response } from "express";
import { SlackService } from "../../services/slackService";

const notifyNewUser = async (req: Request, res: Response) => {
  try {
    const { email, username, company, role, phone, webhookSecret } = req.body;

    // Basic security check
    const expectedSecret = process.env.WEBHOOK_SECRET || "your-webhook-secret-here";
    if (webhookSecret !== expectedSecret) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    await SlackService.notifyNewUser({
      email,
      username,
      company,
      role,
      phone
    });

    res.status(200).json({ success: true, message: "Slack notification sent" });
  } catch (error) {
    console.error("Slack notification error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export default notifyNewUser;
