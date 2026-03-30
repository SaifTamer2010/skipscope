"use client";

import { useEffect } from "react";
import {
  useRealtimeNotifications,
  Notification,
} from "@/hooks/useRealtimeNotifications";
import toast from "react-hot-toast";

/**
 * Notification provider component that shows real-time notifications as toasts
 * Add this component to your layout to enable real-time notification toasts
 */
export default function NotificationToastProvider() {
  const { notifications } = useRealtimeNotifications();

  useEffect(() => {
    // Get the latest unread notification
    const latestNotification = notifications.find(
      (n: Notification) => !n.is_read,
    );

    if (latestNotification) {
      // Show toast based on notification type
      switch (latestNotification.type) {
        case "success":
          toast.success(latestNotification.message, {
            duration: 5000,
            icon: "✅",
          });
          break;
        case "error":
          toast.error(latestNotification.message, {
            duration: 6000,
            icon: "❌",
          });
          break;
        case "warning":
          toast(latestNotification.message, {
            duration: 5000,
            icon: "⚠️",
          });
          break;
        case "info":
        default:
          toast(latestNotification.message, {
            duration: 4000,
            icon: "ℹ️",
          });
          break;
      }
    }
  }, [notifications]);

  // This component doesn't render anything
  return null;
}
