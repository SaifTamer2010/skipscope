"use client";

import { useEffect, useRef } from "react";
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
  const processedIds = useRef<Set<string>>(new Set());
  const isInitialMount = useRef(true);

  useEffect(() => {
    // 1. Initial Mount: Mark existing unread notifications as processed to avoid back-to-back toasts
    if (isInitialMount.current && notifications.length > 0) {
      notifications.forEach((n) => {
        if (n.id) processedIds.current.add(n.id);
      });
      isInitialMount.current = false;
      return;
    }

    if (isInitialMount.current && notifications.length === 0) return;

    // 2. Process Notifications: Only toast newly arrived notifications with fresh IDs
    notifications.forEach((n: Notification) => {
      if (!n.is_read && n.id && !processedIds.current.has(n.id)) {
        processedIds.current.add(n.id);

        switch (n.type) {
          case "success":
            toast.success(n.message, { duration: 5000, icon: "✅" });
            break;
          case "error":
            toast.error(n.message, { duration: 6000, icon: "❌" });
            break;
          case "warning":
            toast(n.message, { duration: 5000, icon: "⚠️" });
            break;
          case "info":
          default:
            toast(n.message, { duration: 4000, icon: "ℹ️" });
            break;
        }
      }
    });

  }, [notifications]);

  // This component doesn't render anything
  return null;
}
