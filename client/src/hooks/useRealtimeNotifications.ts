"use client";

export interface Notification {
  id?: string;
  message: string;
  type: "info" | "success" | "warning" | "error";
  metadata?: Record<string, any>;
  requestId?: string;
  created_at?: string;
  is_read?: boolean;
}

/**
 * Custom hook for real-time notifications using Server-Sent Events (SSE)
 */
export function useRealtimeNotifications() {
  return {
    notifications: [],
    isConnected: false,
    markAsRead: async (_id: string) => {},
    markAllAsRead: async () => {},
    refetch: async () => {},
  };
}
