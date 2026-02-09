"use client";

import { useEffect, useState } from "react";
import NotificationCard from "@/components/NotificationCard";
import { useNotificationStore } from "@/store/notificationStore";
import api from "@/lib/api";
import toast from "react-hot-toast";

interface Notification {
  id: string;
  user_id: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

export default function NotificationsPage() {
  const { notifications, setNotifications, markAsRead, markAllAsRead } =
    useNotificationStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await api.get("/notifications");
      setNotifications(response.data.notifications);
    } catch (error) {
      toast.error("Failed to load notifications");
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      markAsRead(id);
      toast.success("Notification marked as read");
    } catch (error) {
      toast.error("Failed to mark notification as read");
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await api.post("/notifications/read-all");
      markAllAsRead();
      toast.success("All notifications marked as read");
    } catch (error) {
      toast.error("Failed to mark all as read");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
      </div>
    );
  }

  const unreadNotifications = notifications.filter((n) => !n.is_read);
  const readNotifications = notifications.filter((n) => n.is_read);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold mb-2 text-text-primary">
            Notifications
          </h1>
          <p className="text-text-secondry">
            You have {unreadNotifications.length} unread notification
            {unreadNotifications.length !== 1 ? "s" : ""}
          </p>
        </div>
        {unreadNotifications.length > 0 && (
          <button
            onClick={handleMarkAllAsRead}
            className="px-6 py-3 bg-purple-500/20 border border-purple-500/50 rounded-lg font-semibold hover:bg-purple-500/30 transition-colors"
          >
            Mark All as Read
          </button>
        )}
      </div>

      {/* Unread Notifications */}
      {unreadNotifications.length > 0 && (
        <div>
          <h2 className="text-xl font-bold mb-4">Unread</h2>
          <div className="space-y-3">
            {unreadNotifications.map((notification) => (
              <NotificationCard
                key={notification.id}
                notification={notification}
                onMarkAsRead={handleMarkAsRead}
              />
            ))}
          </div>
        </div>
      )}

      {/* Read Notifications */}
      {readNotifications.length > 0 && (
        <div>
          <h2 className="text-xl font-bold mb-4">Read</h2>
          <div className="space-y-3">
            {readNotifications.map((notification) => (
              <NotificationCard
                key={notification.id}
                notification={notification}
              />
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {notifications.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16">
          <div className="text-6xl mb-4">🔔</div>
          <h3 className="text-2xl font-bold mb-2">No notifications yet</h3>
          <p className="text-text-secondry">
            You'll see notifications here when you have updates.
          </p>
        </div>
      )}
    </div>
  );
}
