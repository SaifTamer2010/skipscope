import { supabase } from "../config/supabase";

export interface NotificationPayload {
  userId: string;
  message: string;
  type?: "info" | "success" | "warning" | "error";
  metadata?: Record<string, any>;
  requestId?: string;
}

export class NotificationService {
  /**
   * Create a new notification for a user
   */
  static async createNotification(payload: NotificationPayload): Promise<void> {
    try {
      const { error } = await supabase.from("notifications").insert({
        user_id: payload.userId,
        message: payload.message,
        type: payload.type || "info",
        metadata: payload.metadata || {},
        request_id: payload.requestId,
        is_read: false,
        created_at: new Date().toISOString(),
      });

      if (error) {
        console.error("Error creating notification:", error);
        throw error;
      }

      // Emit SSE event for real-time updates
      this.emitNotificationEvent(payload.userId, {
        message: payload.message,
        type: payload.type || "info",
        metadata: payload.metadata,
        requestId: payload.requestId,
      });
    } catch (error) {
      console.error("Failed to create notification:", error);
    }
  }

  /**
   * Create notifications for kanban board changes
   */
  static async notifyKanbanStatusChange(
    userId: string,
    requestId: string,
    fromStatus: string,
    toStatus: string,
  ): Promise<void> {
    await this.createNotification({
      userId,
      requestId,
      message: `Your request status changed from "${fromStatus}" to "${toStatus}"`,
      type: "info",
      metadata: {
        action: "status_change",
        fromStatus,
        toStatus,
      },
    });
  }

  /**
   * Notify when a request is assigned to an admin
   */
  static async notifyRequestAssigned(
    userId: string,
    requestId: string,
    adminName: string,
  ): Promise<void> {
    await this.createNotification({
      userId,
      requestId,
      message: `Your request has been assigned to ${adminName}`,
      type: "info",
      metadata: {
        action: "request_assigned",
        adminName,
      },
    });
  }

  /**
   * Notify when notes are updated
   */
  static async notifyNotesUpdated(
    userId: string,
    requestId: string,
    noteType: "client" | "internal",
  ): Promise<void> {
    if (noteType === "client") {
      await this.createNotification({
        userId,
        requestId,
        message: "New notes have been added to your request",
        type: "info",
        metadata: {
          action: "notes_updated",
          noteType,
        },
      });
    }
  }

  /**
   * Notify when files are uploaded
   */
  static async notifyFilesUploaded(
    userId: string,
    requestId: string,
    fileCount: number,
  ): Promise<void> {
    await this.createNotification({
      userId,
      requestId,
      message: `${fileCount} new file${fileCount > 1 ? "s" : ""} uploaded to your request`,
      type: "success",
      metadata: {
        action: "files_uploaded",
        fileCount,
      },
    });
  }

  // SSE event emitters storage (in-memory for now, use Redis for production)
  private static sseClients: Map<string, Array<(data: any) => void>> =
    new Map();

  /**
   * Register an SSE client
   */
  static registerSSEClient(
    userId: string,
    callback: (data: any) => void,
  ): void {
    if (!this.sseClients.has(userId)) {
      this.sseClients.set(userId, []);
    }
    this.sseClients.get(userId)!.push(callback);
  }

  /**
   * Unregister an SSE client
   */
  static unregisterSSEClient(
    userId: string,
    callback: (data: any) => void,
  ): void {
    const clients = this.sseClients.get(userId);
    if (clients) {
      const index = clients.indexOf(callback);
      if (index > -1) {
        clients.splice(index, 1);
      }
      if (clients.length === 0) {
        this.sseClients.delete(userId);
      }
    }
  }

  /**
   * Emit notification event to all registered SSE clients
   */
  private static emitNotificationEvent(userId: string, data: any): void {
    const clients = this.sseClients.get(userId);
    if (clients && clients.length > 0) {
      clients.forEach((callback) => callback(data));
    }
  }
}
