"use client";

import { useNotificationStore } from "@/store/notificationStore";

interface Notification {
  id: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

interface NotificationCardProps {
  notification: Notification;
  onMarkAsRead?: (id: string) => void;
}

export default function NotificationCard({
  notification,
  onMarkAsRead,
}: NotificationCardProps) {
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInMins = Math.floor(diffInMs / 60000);
    const diffInHours = Math.floor(diffInMins / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInMins < 60) return `${diffInMins}m ago`;
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return `${diffInDays}d ago`;
  };

  return (
    <div
      className={`
        relative p-4 rounded-xl border transition-all duration-200
        ${
          notification.is_read
            ? "bg-background-secondry border-white/5"
            : "bg-linear-to-r from-purple-500/10 to-pink-500/10 border-purple-500/30"
        }
      `}
    >
      {/* Unread Indicator */}
      {!notification.is_read && (
        <div className="absolute top-4 left-4 w-2 h-2 bg-purple-500 rounded-full animate-pulse" />
      )}

      <div className={`${!notification.is_read ? "pl-4" : ""}`}>
        <p className="text-sm mb-2">{notification.message}</p>
        <div className="flex items-center justify-between">
          <span className="text-xs text-text-secondry">
            {formatTime(notification.created_at)}
          </span>
          {!notification.is_read && onMarkAsRead && (
            <button
              onClick={() => onMarkAsRead(notification.id)}
              className="text-xs text-purple-400 hover:text-purple-300 transition-colors"
            >
              Mark as read
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
