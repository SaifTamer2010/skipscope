import { AuthRequest } from "../../../middleware/auth";
import { Response } from "express";
import { supabase } from "../../../config/supabase";

const submitNewRequest = async (req: AuthRequest, res: Response) => {
  try {
    const {
      rows,
      county,
      motivations,
      state,
      zipCode,
      ownershipCriteriaFinale,
      market,
      customNotes,
    } = req.body;

    if (!market || !state || !rows) {
      return res.status(400).json({ error: "All Fields are required" });
    }

    // Get the default kanban column (first one)
    const { data: defaultColumn } = await supabase
      .from("kanban_columns")
      .select("id")
      .order("order_index", { ascending: true })
      .limit(1)
      .single();

    // Create new request
    const { data: newRequest, error } = await supabase
      .from("requests")
      .insert({
        user_id: req.userId,
        rows: parseInt(rows as string),
        county: county || "N/A",
        motivations,
        state,
        zipCode: zipCode || "N/A",
        ownershipCriteriaFinale, //
        market,
        customNotes,
        status: "Pending",
        kanban_column_id: defaultColumn?.id, // Assign to first column
        kanban_order: 0, // Add to top
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    // Create a notification for the new request using NotificationService
    const { NotificationService } = require("../../../services/notificationService");
    await NotificationService.createNotification({
      userId: req.userId,
      message: `Your request for ${county || state} has been submitted successfully and is now pending review.`,
      type: "success",
      requestId: newRequest.id,
      metadata: { action: "request_submitted", county, state }
    });

    // Send Slack Notification
    const slackUrl = process.env.SLACK_WEBHOOK_URL_REQUESTS;
    if (slackUrl) {
      try {
        const { data: user } = await supabase
          .from("users")
          .select("username, email, company")
          .eq("id", req.userId)
          .single();

        const criteriaText = ownershipCriteriaFinale && Array.isArray(ownershipCriteriaFinale)
          ? ownershipCriteriaFinale.map((c: any) => `${c.key}: ${c.value}`).join(", ")
          : "N/A";

        const response = await fetch(slackUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            blocks: [
              {
                type: "header",
                text: {
                  type: "plain_text",
                  text: "NEW REQUEST"
                }
              },
              {
                type: "section",
                fields: [
                  { type: "mrkdwn", text: `*ID:*\n${newRequest.id.substring(0, 8)}` },
                  { type: "mrkdwn", text: `*Username:*\n${user?.username || "N/A"}` },
                  { type: "mrkdwn", text: `*Email:*\n${user?.email || "N/A"}` },
                  { type: "mrkdwn", text: `*Company:*\n${user?.company || "N/A"}` },
                  { type: "mrkdwn", text: `*Market:*\n${market || "N/A"}` },
                  { type: "mrkdwn", text: `*State:*\n${state || "N/A"}` },
                  { type: "mrkdwn", text: `*County:*\n${county || "All"}` },
                  { type: "mrkdwn", text: `*Zip Code:*\n${zipCode || "All"}` },
                  { type: "mrkdwn", text: `*Leads:*\n${rows || "0"}` }
                ]
              },
              {
                type: "section",
                text: {
                  type: "mrkdwn",
                  text: `*Motivations:*\n${motivations || "None"}`
                }
              },
              {
                type: "section",
                text: {
                  type: "mrkdwn",
                  text: `*Ownership Criteria:*\n${criteriaText || "None"}`
                }
              },
              {
                type: "section",
                text: {
                  type: "mrkdwn",
                  text: `*Custom Notes:*\n${customNotes || "No notes provided"}`
                }
              }
            ]
          })
        });
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error("Slack rejected message:", errorText);
        }
      } catch (err) {
        console.error("Slack webhook failed:", err);
      }
    }

    res.status(201).json({
      request: newRequest,
      message: "Request submitted successfully",
    });
  } catch (error) {
    console.error("Submit request error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export default submitNewRequest;
