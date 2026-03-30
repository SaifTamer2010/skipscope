"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useUserStore } from "@/store/userStore";
import { supabase } from "@/lib/supabase";

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
  const user = useUserStore((state) => state.user);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch initial notifications from the API
  const fetchNotifications = useCallback(async () => {
    if (!user) return;

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) return;

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/notifications`,
        {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        },
      );

      if (response.ok) {
        const data = await response.json();
        setNotifications(data.notifications || []);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  }, [user]);

  // Connect to SSE stream for real-time updates
  const connectToSSE = useCallback(async () => {
    if (!user || eventSourceRef.current) return;

    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) return;

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
    const eventSource = new EventSource(
      `${apiUrl}/notifications/subscribe?token=${session.access_token}`,
      {
        withCredentials: false,
      },
    );

    eventSource.onopen = () => {
      console.log("SSE connection opened");
      setIsConnected(true);
    };

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        if (data.type === "connected") {
          console.log("Connected to notifications stream");
          return;
        }

        // Add new notification to the list
        setNotifications((prev) => [
          {
            message: data.message,
            type: data.type || "info",
            metadata: data.metadata,
            requestId: data.requestId,
            created_at: new Date().toISOString(),
            is_read: false,
          },
          ...prev,
        ]);

        // Show browser notification if permitted
        if (Notification.permission === "granted") {
          new Notification("SkipScope Notification", {
            body: data.message,
            icon: "/favicon.png",
          });
        }
      } catch (error) {
        console.error("Error parsing SSE message:", error);
      }
    };

    eventSource.onerror = (error) => {
      console.error("SSE connection error:", error);
      setIsConnected(false);
      eventSource.close();
      eventSourceRef.current = null;

      // Attempt to reconnect after 5 seconds
      reconnectTimeoutRef.current = setTimeout(() => {
        connectToSSE();
      }, 5000);
    };

    eventSourceRef.current = eventSource;
  }, [user]);

  // Disconnect from SSE
  const disconnectSSE = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
      setIsConnected(false);
    }
  }, []);

  // Mark notification as read
  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) return;

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/notifications/${notificationId}/read`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        },
      );

      if (response.ok) {
        setNotifications((prev) =>
          prev.map((n) =>
            n.id === notificationId ? { ...n, is_read: true } : n,
          ),
        );
      }
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  }, []);

  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) return;

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/notifications/read-all`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        },
      );

      if (response.ok) {
        setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      }
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
    }
  }, []);

  // Request browser notification permission
  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  // Connect to SSE when user is authenticated
  useEffect(() => {
    if (user) {
      fetchNotifications();
      // connectToSSE();
    }

    return () => {
      disconnectSSE();
    };
  }, [user, fetchNotifications, connectToSSE, disconnectSSE]);

  return {
    notifications,
    isConnected,
    markAsRead,
    markAllAsRead,
    refetch: fetchNotifications,
  };
}
