export class SlackService {
  /**
   * Send a message to a Slack webhook
   */
  static async sendMessage(webhookUrl: string | undefined, payload: any): Promise<void> {
    if (!webhookUrl) {
      console.warn("Slack webhook URL not provided. Skipping notification.");
      return;
    }

    try {
      const response = await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Slack rejected message:", errorText);
      }
    } catch (err) {
      console.error("Slack webhook failed:", err);
    }
  }

  /**
   * Send notification for a new user registration
   */
  static async notifyNewUser(user: { email: string; username?: string; company?: string; role?: string; phone?: string }): Promise<void> {
    const webhookUrl = process.env.SLACK_WEBHOOK_URL_USERS || process.env.SLACK_WEBHOOK_URL_REQUESTS;

    const payload = {
      blocks: [
        {
          type: "header",
          text: {
            type: "plain_text",
            text: "NEW USER JOINED"
          }
        },
        {
          type: "section",
          fields: [
            { type: "mrkdwn", text: `*Email:*\n${user.email}` },
            { type: "mrkdwn", text: `*Username:*\n${user.username || "N/A"}` },
            { type: "mrkdwn", text: `*Company:*\n${user.company || "N/A"}` },
            { type: "mrkdwn", text: `*Role:*\n${user.role || "N/A"}` },
            { type: "mrkdwn", text: `*Phone:*\n${user.phone || "N/A"}` }
          ]
        },
        {
          type: "context",
          elements: [
            {
              type: "mrkdwn",
              text: `Timestamp: ${new Date().toLocaleString()}`
            }
          ]
        }
      ]
    };

    await this.sendMessage(webhookUrl, payload);
  }

  /**
   * Send notification for a server error or crash
   */
  static async notifyError(error: Error, type: "express" | "uncaught" | "rejection"): Promise<void> {
    const webhookUrl = process.env.SLACK_WEBHOOK_URL || process.env.SLACK_WEBHOOK_URL_REQUESTS;
    
    const typeLabels = {
      express: "🚨 EXPRESS ERROR",
      uncaught: "💥 UNCAUGHT EXCEPTION",
      rejection: "⚠️ UNHANDLED REJECTION"
    };

    const payload = {
      blocks: [
        {
          type: "header",
          text: {
            type: "plain_text",
            text: typeLabels[type]
          }
        },
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `*Message:*\n\`\`\`${error.message}\`\`\``
          }
        },
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `*Stack Trace:*\n\`\`\`${error.stack ? error.stack.substring(0, 1000) : "No stack trace available"}\`\`\``
          }
        },
        {
          type: "context",
          elements: [
            {
              type: "mrkdwn",
              text: `Environment: ${process.env.NODE_ENV || "development"} | Time: ${new Date().toLocaleString()}`
            }
          ]
        }
      ]
    };

    await this.sendMessage(webhookUrl, payload);
  }

  /**
   * Send notification for a support request
   */
  static async notifySupportRequest(request: { name: string; email: string; subject: string; message: string; metadata?: any }): Promise<void> {
    const webhookUrl = process.env.SLACK_WEBHOOK_URL_SUPPORT || process.env.SLACK_WEBHOOK_URL || process.env.SLACK_WEBHOOK_URL_REQUESTS;

    const payload = {
      blocks: [
        {
          type: "header",
          text: {
            type: "plain_text",
            text: "📩 NEW SUPPORT REQUEST"
          }
        },
        {
          type: "section",
          fields: [
            { type: "mrkdwn", text: `*From:*\n${request.name}` },
            { type: "mrkdwn", text: `*Email:*\n${request.email}` }
          ]
        },
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `*Subject:*\n${request.subject}`
          }
        },
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `*Message:*\n\`\`\`${request.message}\`\`\``
          }
        },
        {
          type: "context",
          elements: [
            {
              type: "mrkdwn",
              text: `Source: SkipScope Website Support Form | Time: ${new Date().toLocaleString()}`
            }
          ]
        }
      ]
    };

    await this.sendMessage(webhookUrl, payload);
  }
}
